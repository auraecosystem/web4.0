# Web4.0 Semantic Execution Contract

Web4.0 treats `ROUTE → INSTRUCT → VERIFY → RESULT` as the execution surface. This document makes the `^D Create → Validate` phase explicit and implementation-neutral.

## Create

`^D Create` constructs an execution state from a semantic request. Creation is successful only when the request is structurally valid and the selected execution provider can satisfy its declared capabilities.

A canonical request contains:

```json
{
  "subject": "semantic task",
  "inputs": ["text"],
  "output": {
    "type": "text"
  },
  "constraints": {
    "localOnly": true,
    "maxTokens": 4000,
    "maxTurns": 8
  }
}
```

The request is an object with explicit subject, input modalities, output contract, and execution constraints. The protocol must preserve those declarations through routing and execution rather than silently widening capabilities.

## Validate

`^D Validate` verifies the created execution state before the system performs the task. Validation covers:

1. Structural validity — required fields and supported values.
2. Capability validity — selected provider supports every requested input modality and output contract.
3. Policy validity — `localOnly` and provider constraints are respected.
4. Resource validity — token and turn budgets are positive and bounded.
5. Provenance validity — the selected provider and session source agree.
6. Result validity — structured output is checked against the declared result contract.

A validation result has this shape:

```json
{
  "valid": true,
  "status": "verified",
  "errors": [],
  "warnings": [],
  "evidence": {}
}
```

A rejected state must not proceed to execution.

## Protocol mapping

```text
^↑D DETECT
   ↓
^D CREATE
   ↓
ROUTE
   ↓
INSTRUCT
   ↓
^D VALIDATE
   ↓
VERIFY
   ↓
RESULT
```

`CREATE` constructs the state. `ROUTE` selects an eligible execution path. `INSTRUCT` supplies the task to that path. `VALIDATE` checks the execution state and declared result. `VERIFY` provides the protocol-level verification gate. `RESULT` is the only terminal success surface.

## Web4 vocabulary

The contract remains compatible with the repository's semantic vocabulary: MCP is the interaction/tool membrane, RDF is the semantic graph substrate, LCT represents witnessed presence, T3/V3 carry trust/value dimensions, MRH bounds contextual reasoning, and ATP/ADP provide resource accountability.

The contract is deliberately provider-neutral. A Web4 execution may be implemented by browser-native AI, a local model, a remote model, an agent, or another protocol participant as long as the declared capabilities and validation gates are preserved.
