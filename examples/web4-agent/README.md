# Web4 AI Agent + LMLM Example

A dependency-free reference implementation for the `auraecosystem/web4.0` repository. It combines a Web4 agent runtime with the supplied Jotform LMLM Web Agent interface.

## Architecture

`Web4 Identity -> LMLM/Jotform Input -> Jotform Webhook -> Web4 Agent -> Result -> Verification`

The Jotform agent is embedded in `index.html` using the supplied iframe. Because the Jotform agent runs on a different origin, the browser cannot directly inspect its submitted fields. The reliable integration point is the Jotform webhook endpoint exposed by this example.

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

## Jotform integration

The embedded agent is:

```text
https://agent.jotform.com/01a0786fd0c870008e95b789230166b37b2f?embedMode=iframe&autofocus=0&background=1&shadow=1
```

Configure the Jotform app's webhook destination to the publicly reachable URL:

```text
https://YOUR-WEB4-HOST/api/jotform/webhook
```

The server accepts JSON and URL-encoded Jotform webhook payloads and normalizes the latest submission in memory. The browser can retrieve it with:

```text
GET /api/jotform/latest
```

For local development, a public HTTPS tunnel or deployed host is required for Jotform to reach the webhook. The in-memory store is intentionally demo-only; production deployments should persist submissions in an authenticated database and validate the webhook according to the Jotform security model.

## Web4 agent request

The browser sends the latest Jotform submission, when available, to `/api/web4/agent` together with the Web4 identity and declared capabilities.

Example request:

```json
{
  "protocol": "web4",
  "version": "1.0",
  "identity": "did:web4:example:user",
  "task": "Process the LMLM Web Agent request and return a verified Web4 response.",
  "capabilities": ["language", "reasoning", "multimodal", "decentralized-data"],
  "input": {}
}
```

## Production hardening

This example deliberately uses a synthetic DID and demonstration verification. A production Web4/LMLM deployment should add cryptographic identity, authenticated sessions, capability authorization, signed requests, webhook authentication/verification, persistent storage, rate limiting, audit logs, encrypted secrets, and independently verifiable agent results.

The Git `bundle-uri` protocol-v2 test work is separate from this application layer: bundle URIs can be used as a Git distribution mechanism for large Web4 resources, but they are not themselves the Web4 application protocol.
