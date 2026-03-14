# ADR-050: Go-Live Closure + Ship Readiness Reconciliation

## Status: Accepted
## Date: 2026-03-14

## Context
After Parts 48-49 brought the system to conditional_go status with 12/13 workflows usable and 6/7 blockers resolved, a final reconciliation layer is needed to aggregate all readiness signals into a single ship decision and provide provider governance gates for release approval.

## Decision
- `go-live-closure.ts` aggregates all ship blockers, middleware enforcement, workflow completion, operator acceptance, and production readiness into a unified closure report with go/conditional_go/no_go recommendation
- `release-provider-gating.ts` evaluates provider health, cost, latency, and incident status before allowing a release to proceed
- `readiness-reconciliation.ts` computes a weighted reconciled score (workflows 25%, middleware 20%, blockers 25%, acceptance 30%) and resolves stale contradictions from prior parts
- Updated operator-acceptance.ts to reflect Part 49 UI improvements (rollback, skill packs, templates, extensions now fully usable)

## Consequences
- Single source of truth for ship readiness across all dimensions
- Provider health automatically gates release approval
- Stale assessment contradictions from earlier parts are resolved
- Releases tab shows reconciliation score, closure report, and provider gate status
