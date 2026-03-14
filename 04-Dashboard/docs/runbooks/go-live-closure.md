# Runbook: Go-Live Closure

## Check Closure Report
`GET /api/go-live-closure` — shows all blockers with closed/partial/blocked status and recommendation

## Check Provider Release Gate
`GET /api/release-provider-gating` — evaluates provider health before release
`GET /api/release-provider-gating/:releaseId` — for specific release

## Check Readiness Reconciliation
`GET /api/readiness-reconciliation` — weighted score across all dimensions

## Target: recommendation=go, all gates clear, reconciled_score >= 95%
