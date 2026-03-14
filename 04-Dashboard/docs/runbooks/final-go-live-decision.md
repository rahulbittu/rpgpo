# Runbook: Final Go-Live Decision

## Get Final Ship Decision
`GET /api/final-ship-decision` — evidence-backed GO/CONDITIONAL_GO/NO_GO

## Recompute Decision
`POST /api/final-ship-decision/recompute` — recomputes from current live state

## Check Blocker Reconciliation
`GET /api/final-blockers` — all blockers with reconciled status and evidence
`GET /api/final-blockers/reconciliation` — same endpoint, alias

## Check Workflow Closure
`GET /api/final-workflow-closure` — all workflows with usable/partial/blocked status

## Procedure for GO
1. Run `POST /api/protected-paths/run-all` — validate Part 51 paths
2. Run `POST /api/http-middleware-validation/run` — validate Part 52 HTTP cases
3. Check `GET /api/final-blockers` — all 7 blockers must be closed
4. Check `GET /api/final-workflow-closure` — 13/13 workflows usable
5. Get `GET /api/final-ship-decision` — must return GO with score >= 90%

## Target: decision=GO, 0 remaining gaps, 7/7 blockers closed, 13/13 workflows usable
