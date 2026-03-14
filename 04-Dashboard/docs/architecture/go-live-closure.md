# Go-Live Closure Architecture

## Modules
- `go-live-closure.ts` — Aggregates ship blockers, middleware, workflows, acceptance, production readiness
- `release-provider-gating.ts` — Provider health + cost + latency + incident gates for releases
- `readiness-reconciliation.ts` — Weighted reconciliation score with stale contradiction resolution

## Data Flow
1. Each module queries upstream signals (ship-blocker-closure, middleware-enforcement, operator-workflow-completion, operator-acceptance, production-readiness-closure, provider-reliability-scoring, cost-latency-governance, incident-response)
2. go-live-closure aggregates into unified blocker list with closure status
3. release-provider-gating checks provider health gates independently
4. readiness-reconciliation computes weighted score: workflows (25%), middleware (20%), blockers (25%), acceptance (30%)
5. All exposed through Chief of Staff and API routes
6. Releases tab renders reconciliation dashboard with score cards and closure detail

## Ship Decision Thresholds
- `go`: reconciled_score >= 95%, no blocked items
- `conditional_go`: reconciled_score >= 80%, no blocked items
- `no_go`: below thresholds or any blocked items
