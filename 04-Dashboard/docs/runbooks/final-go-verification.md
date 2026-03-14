# Runbook: Final Go Verification

## Get Production Decision
`GET /api/final-go-verification` — 8-gate evidence-backed GO/CONDITIONAL_GO/NO_GO

## Recompute
`POST /api/final-go-verification/recompute` — recomputes from live state

## Clean-State Procedure for GO
1. Clear stale state: `POST /api/clean-state-verification/clear`
2. Run all validations:
   - `POST /api/protected-paths/run-all`
   - `POST /api/http-middleware-validation/run`
   - `POST /api/network-http-validation/run`
3. Verify clean state: `GET /api/clean-state-verification`
4. Get decision: `GET /api/final-go-verification`

## 8 Required Gates
1. Network HTTP validation: 8/8 passed
2. Blocker reconciliation: 7/7 closed
3. Workflow closure: 13/13 usable
4. Middleware truth: >= 95%
5. Reliability closure: 0 proxy-only metrics
6. Clean state: no stale files (advisory)
7. Operator acceptance: >= 95%
8. Security posture: strong or moderate

## Target: GO at 100%, 0 remaining gaps, clean state verified
