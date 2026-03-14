# Runbook: Final Production Authorization

## Full Validation Procedure
1. Start server: `node server.js`
2. Clear stale state: `POST /api/clean-state-verification/clear`
3. Run full harness: `POST /api/validation-harness/run`
4. Get authorization: `GET /api/go-authorization`

## Or Step-by-Step
1. `POST /api/protected-paths/run-all`
2. `POST /api/http-middleware-validation/run`
3. `POST /api/live-server-proof/run`
4. `POST /api/go-authorization/recompute`

## Decision Rules
- **GO**: All 8 gates pass + live network proof + score >= 90%
- **CONDITIONAL_GO**: All gates pass but proof is function-only
- **NO_GO**: Any required gate fails

## Proof Gap Resolution
- `fallback_only` → Start server, re-run live proof
- `no_live_proof` → Run `POST /api/live-server-proof/run`
- `stale_evidence` → Clear state, re-run all validations
- `failed_case` → Investigate failing middleware, fix, re-run
