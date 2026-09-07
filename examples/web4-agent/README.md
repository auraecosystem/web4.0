# Web4 AI Agent Example

A dependency-free reference implementation for the `auraecosystem/web4.0` repository.

## What it demonstrates

The example models a simple Web4 request lifecycle:

`Identity -> Capability Discovery -> Agent Request -> Result -> Verification`

The browser creates a demo Web4 identity, sends a protocol request to `/api/web4/agent`, and renders the verified response.

## Run locally

Requirements: Node.js 18+.

```bash
cd examples/web4-agent
node server.mjs
```

Open:

```text
http://localhost:8787
```

## Request shape

```json
{
  "protocol": "web4",
  "version": "1.0",
  "identity": "did:web4:example:user",
  "task": "Explain Web4",
  "capabilities": ["language", "reasoning", "decentralized-data"]
}
```

## Important

This is a protocol/architecture example, not a production identity implementation. The DID is deliberately synthetic and the `verified` field is demonstration-only. A production Web4 stack should replace these pieces with cryptographic identity, authenticated sessions, capability authorization, durable agent discovery, and independently verifiable results.

The Git `bundle-uri` protocol-v2 test work is separate from this application layer: bundle URIs can be used as a Git distribution mechanism for large Web4 resources, but they are not themselves the Web4 application protocol.
