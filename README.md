# Web4.0

Web4.0 is a semantic digital-infrastructure foundation for intelligent applications. This repository now contains a dependency-free Web4.0 dashboard, a single authoritative GitHub Pages deployment path, and a production-oriented static container runtime.

## Live site

GitHub Pages: https://auraecosystem.github.io/web4.0/

## Semantic model

The dashboard presents the core Web4 vocabulary used by this repository:

- **MCP** — interaction and tool membrane.
- **RDF** — semantic graph substrate for typed relationships.
- **LCT** — Linked Context Token for witnessed presence.
- **T3/V3** — trust and value dimensions attached to entity-role relationships.
- **MRH** — Markov Relevancy Horizon for bounded contextual reasoning.
- **ATP/ADP** — allocation and discharge packets for resource accountability.

The execution surface is expressed as **ROUTE → INSTRUCT → VERIFY → RESULT**.

## Repository layout

```text
site/                 Web4.0 dashboard and static assets
Docs/                 Reference and technical documentation
.github/workflows/    CI/CD automation
Dockerfile            Production static web container
nginx.conf            Runtime security headers and routing
STATUS.md             Current implementation status
```

## Local preview

No package manager or framework is required for the dashboard. Serve `site/` with any static HTTP server, for example:

```bash
python3 -m http.server 8080 --directory site
```

Then open http://localhost:8080/.

## Container

```bash
docker build -t web4.0 .
docker run --rm -p 8080:80 web4.0
```

## CI/CD

`Deploy Web4.0` is the authoritative GitHub Pages workflow. It validates the dashboard, uploads only `site/` as the Pages artifact, and deploys on pushes to `main`. `Docker Image CI` independently verifies that the production container builds.

## Security

Secrets and local environment files are ignored. The static runtime adds content-type, framing, referrer, permissions, and content-security policies through Nginx. No application credentials are embedded in the dashboard.

## Development note

The repository contains broader Web4 research/reference material in `Docs/`. Those materials are not treated as executable application dependencies. Changes to protocol semantics should preserve the established Web4 terminology and specifications documented by the project.
