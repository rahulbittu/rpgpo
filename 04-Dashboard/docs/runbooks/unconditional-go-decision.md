# Runbook: Unconditional Go Decision

## Prerequisites
1. Server running: `node server.js`
2. Clean state: `POST /api/clean-state-verification/clear`

## Full Procedure
1. Pre-populate evidence:
   - `POST /api/protected-paths/run-all`
   - `POST /api/http-middleware-validation/run`
2. Run route-level proof: `POST /api/final-go-proof/run`
3. Get report: `GET /api/unconditional-go-report`

## Decision Rules
- **UNCONDITIONAL_GO**: 8/8 routes proven + 0 blockers + confidence: unconditional
- **CONDITIONAL_GO**: Some routes proven but blockers remain
- **NO_GO**: Server not running or routes failing

## Target: UNCONDITIONAL_GO at 100%, confidence: unconditional
