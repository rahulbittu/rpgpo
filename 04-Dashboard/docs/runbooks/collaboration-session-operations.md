# Runbook: Collaboration Session Operations

## Creating a Session
1. `POST /api/collaboration-runtime/create` with scope, participants, protocol
2. Agents submit proposals via `POST /:sessionId/propose`
3. Run negotiation: `POST /:sessionId/negotiate`
4. Compute consensus: `POST /:sessionId/consensus`
5. Resolve: `POST /:sessionId/resolve`

## When Unresolved
If consensus is `split` or `blocked`, the session enters `unresolved` state. Options:
- Add more evidence and re-negotiate
- Escalate to Board of AI
- Escalate to operator
