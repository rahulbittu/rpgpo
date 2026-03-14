# Agent Consensus

## Consensus Levels
- unanimous — all agents agree
- majority — more for than against
- split — evenly divided
- blocked — more against than for, or no votes

## Dissent Records
Every disagreement is preserved with: provider, role, reason, opposed proposal, alternative.

## API
- `GET /api/agent-consensus/:sessionId` — Votes
- `GET /api/dissent-records/:sessionId` — Dissent records
