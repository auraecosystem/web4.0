#!/usr/bin/env python3
"""
web4_agent.py

Reference simulator for the Web4 execution surface:

    ROUTE -> INSTRUCT -> VERIFY -> RESULT

This is a standalone, dependency-free demonstration of how an IoT telemetry
event moves through the pipeline described in `iot-web4-pipeline.yaml` and
`webapi-model.yaml`:

  ROUTE     - match the inbound event to a handler
  INSTRUCT  - use an MCP-style tool membrane to gather context, bounded by
              a Markov Relevancy Horizon (MRH) so only relevant context is
              considered
  VERIFY    - check the device's LCT (Linked Context Token) and its T3/V3
              trust scores against configured thresholds; account for the
              action's cost in ATP, discharge to ADP on completion
  RESULT    - emit a verified reading or quarantine the event

Run it directly:

    python3 web4_agent.py

No external dependencies are required.
"""

from __future__ import annotations

import json
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class TrustTensor:
    """T3 (trust-in-competence) or V3 (trust-in-value) scores, 0.0-1.0."""
    talent: float = 0.0
    training: float = 0.0
    temperament: float = 0.0

    @property
    def score(self) -> float:
        # Simple mean across the three root dimensions.
        return (self.talent + self.training + self.temperament) / 3.0


@dataclass
class DeviceProfile:
    device_id: str
    device_type: str
    owner_zone: str
    lct: str
    t3: TrustTensor
    v3: TrustTensor
    capabilities: List[str] = field(default_factory=list)

    def to_rdf_like(self) -> Dict[str, Any]:
        return {
            "@id": f"device:{self.device_id}",
            "type": self.device_type,
            "owner": self.owner_zone,
            "lct": self.lct,
            "trust": {"t3": round(self.t3.score, 3), "v3": round(self.v3.score, 3)},
            "capabilities": self.capabilities,
        }


@dataclass
class TelemetryEvent:
    device_id: str
    lct: str
    reading: Dict[str, Any]
    timestamp: float = field(default_factory=time.time)


@dataclass
class ATPLedgerEntry:
    event_id: str
    allocated: int
    discharged: int = 0
    note: str = ""


# ---------------------------------------------------------------------------
# Registry (stand-in for a real device/RDF registry, MCP-reachable in a
# production deployment)
# ---------------------------------------------------------------------------

class DeviceRegistry:
    def __init__(self) -> None:
        self._devices: Dict[str, DeviceProfile] = {}

    def register(self, profile: DeviceProfile) -> None:
        self._devices[profile.device_id] = profile

    def get(self, device_id: str) -> Optional[DeviceProfile]:
        return self._devices.get(device_id)


# ---------------------------------------------------------------------------
# The pipeline itself
# ---------------------------------------------------------------------------

class Web4Agent:
    """
    Minimal ROUTE -> INSTRUCT -> VERIFY -> RESULT agent for IoT telemetry.
    """

    def __init__(
        self,
        registry: DeviceRegistry,
        min_t3: float = 0.70,
        min_v3: float = 0.50,
        atp_cost_per_event: int = 1,
    ) -> None:
        self.registry = registry
        self.min_t3 = min_t3
        self.min_v3 = min_v3
        self.atp_cost_per_event = atp_cost_per_event
        self.atp_ledger: List[ATPLedgerEntry] = []
        self.verified_readings: List[Dict[str, Any]] = []
        self.quarantined: List[Dict[str, Any]] = []

    # -- ROUTE ---------------------------------------------------------
    def route(self, topic: str, event: TelemetryEvent) -> Optional[str]:
        """Match an inbound event to a handler name based on its topic."""
        if topic.startswith("iot/") and topic.endswith("/telemetry"):
            self._log("ROUTE", f"matched topic '{topic}' -> handlers.iot_telemetry")
            return "handlers.iot_telemetry"
        self._log("ROUTE", f"no handler for topic '{topic}'; rejecting")
        return None

    # -- INSTRUCT --------------------------------------------------------
    def instruct(self, event: TelemetryEvent) -> Dict[str, Any]:
        """
        MCP-style tool membrane: fetch only the context needed, bounded by
        an MRH (Markov Relevancy Horizon). Here that means: this device's
        profile only, not the whole registry.
        """
        profile = self.registry.get(event.device_id)
        context = {
            "device_profile": profile.to_rdf_like() if profile else None,
            "mrh_scope": ["device_profile"],  # bounded context window
        }
        self._log(
            "INSTRUCT",
            f"fetched device_profile for {event.device_id} "
            f"(mrh_scope={context['mrh_scope']})",
        )
        return context

    # -- VERIFY ----------------------------------------------------------
    def verify(self, event: TelemetryEvent, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Identity + trust checks. Returns a verification result dict with
        'passed': bool and a 'reason' if it failed.
        """
        event_id = str(uuid.uuid4())
        entry = ATPLedgerEntry(event_id=event_id, allocated=self.atp_cost_per_event)
        self.atp_ledger.append(entry)

        profile = self.registry.get(event.device_id)
        if profile is None:
            return self._fail(entry, "unknown_device")

        if event.lct != profile.lct:
            return self._fail(entry, "invalid_lct")

        if profile.t3.score < self.min_t3:
            return self._fail(entry, "t3_below_threshold")

        if profile.v3.score < self.min_v3:
            return self._fail(entry, "v3_below_threshold")

        # Passed: discharge the ATP allocation (ADP side of the cycle).
        entry.discharged = entry.allocated
        entry.note = "discharged_on_success"
        self._log(
            "VERIFY",
            f"PASS device={event.device_id} t3={profile.t3.score:.2f} "
            f"v3={profile.v3.score:.2f} atp_event={event_id}",
        )
        return {"passed": True, "event_id": event_id, "profile": profile}

    def _fail(self, entry: ATPLedgerEntry, reason: str) -> Dict[str, Any]:
        entry.discharged = 0
        entry.note = f"quarantined:{reason}"
        self._log("VERIFY", f"FAIL reason={reason} atp_event={entry.event_id}")
        return {"passed": False, "reason": reason, "event_id": entry.event_id}

    # -- RESULT ------------------------------------------------------------
    def result(self, event: TelemetryEvent, verification: Dict[str, Any]) -> Dict[str, Any]:
        if verification["passed"]:
            profile: DeviceProfile = verification["profile"]
            record = {
                "@id": f"reading:{verification['event_id']}",
                "device_id": event.device_id,
                "reading": event.reading,
                "verified_at": time.time(),
                "trust_at_verification": {
                    "t3": round(profile.t3.score, 3),
                    "v3": round(profile.v3.score, 3),
                },
            }
            self.verified_readings.append(record)
            self._log("RESULT", f"emit verified reading for {event.device_id}")
            return {"status": 200, "body": record}
        else:
            record = {
                "device_id": event.device_id,
                "reason": verification["reason"],
                "received_at": time.time(),
                "raw_payload": event.reading,
            }
            self.quarantined.append(record)
            self._log("RESULT", f"quarantine event for {event.device_id}")
            return {"status": 403, "body": record}

    # -- Orchestration -----------------------------------------------------
    def handle(self, topic: str, event: TelemetryEvent) -> Dict[str, Any]:
        handler = self.route(topic, event)
        if handler is None:
            return {"status": 400, "body": {"error": "no_route"}}

        context = self.instruct(event)
        verification = self.verify(event, context)
        return self.result(event, verification)

    # -- Utility -------------------------------------------------------
    @staticmethod
    def _log(stage: str, message: str) -> None:
        print(f"[{time.strftime('%H:%M:%S')}] {stage:9s} | {message}")


# ---------------------------------------------------------------------------
# Demo / self-test when run directly
# ---------------------------------------------------------------------------

def _demo() -> None:
    registry = DeviceRegistry()
    registry.register(
        DeviceProfile(
            device_id="fleet-01:temp-sensor-042",
            device_type="TemperatureSensor",
            owner_zone="zone:warehouse-3",
            lct="lct:issuer/fleet-01#042",
            t3=TrustTensor(talent=0.80, training=0.85, temperament=0.80),
            v3=TrustTensor(talent=0.60, training=0.65, temperament=0.68),
            capabilities=["read.temperature", "read.humidity"],
        )
    )
    registry.register(
        DeviceProfile(
            device_id="fleet-01:temp-sensor-099",
            device_type="TemperatureSensor",
            owner_zone="zone:warehouse-3",
            lct="lct:issuer/fleet-01#099",
            t3=TrustTensor(talent=0.40, training=0.35, temperament=0.30),  # low trust
            v3=TrustTensor(talent=0.55, training=0.50, temperament=0.52),
            capabilities=["read.temperature"],
        )
    )

    agent = Web4Agent(registry, min_t3=0.70, min_v3=0.50, atp_cost_per_event=1)

    print("=== Event 1: valid device, good LCT, sufficient trust ===")
    good_event = TelemetryEvent(
        device_id="fleet-01:temp-sensor-042",
        lct="lct:issuer/fleet-01#042",
        reading={"temperature_c": 21.4, "humidity_pct": 38.0},
    )
    result1 = agent.handle("iot/warehouse-3/telemetry", good_event)
    print("-> result:", json.dumps(result1, default=str, indent=2))

    print("\n=== Event 2: device below trust threshold ===")
    low_trust_event = TelemetryEvent(
        device_id="fleet-01:temp-sensor-099",
        lct="lct:issuer/fleet-01#099",
        reading={"temperature_c": 19.8},
    )
    result2 = agent.handle("iot/warehouse-3/telemetry", low_trust_event)
    print("-> result:", json.dumps(result2, default=str, indent=2))

    print("\n=== Event 3: LCT mismatch (spoofed token) ===")
    spoofed_event = TelemetryEvent(
        device_id="fleet-01:temp-sensor-042",
        lct="lct:issuer/OTHER#999",
        reading={"temperature_c": 99.9},
    )
    result3 = agent.handle("iot/warehouse-3/telemetry", spoofed_event)
    print("-> result:", json.dumps(result3, default=str, indent=2))

    print("\n=== ATP ledger ===")
    for entry in agent.atp_ledger:
        print(
            f"  event={entry.event_id[:8]}... allocated={entry.allocated} "
            f"discharged={entry.discharged} note={entry.note}"
        )

    print(f"\nVerified readings: {len(agent.verified_readings)}")
    print(f"Quarantined events: {len(agent.quarantined)}")


if __name__ == "__main__":
    _demo()
