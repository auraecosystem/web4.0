# Status

## Semantic execution

The Web4.0 execution surface is explicitly modeled as `ROUTE → INSTRUCT → VERIFY → RESULT` with a preceding `^D Create → Validate` gate. The contract is documented in `Docs/SEMANTIC_EXECUTION.md` and is provider-neutral.

Validation covers request structure, provider capabilities, execution policy, resource bounds, session provenance, and declared result contracts. Rejected execution states must not advance to execution.
