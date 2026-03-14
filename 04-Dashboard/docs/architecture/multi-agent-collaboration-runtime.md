# Multi-Agent Collaboration Runtime

## Session Lifecycle
open → negotiating → consensus_reached / unresolved / escalated → closed

## Roles
strategist, builder, researcher, critic, verifier, reviewer

## Collaboration Patterns
- strategist ↔ builder refinement
- researcher → strategist evidence negotiation
- builder ↔ critic revision loop
- multi-agent proposal comparison

## API
- `POST /api/collaboration-runtime/create` — Create session
- `POST /api/collaboration-runtime/:id/propose` — Submit proposal
- `POST /api/collaboration-runtime/:id/negotiate` — Run negotiation
- `POST /api/collaboration-runtime/:id/consensus` — Compute consensus
