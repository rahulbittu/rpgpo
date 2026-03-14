# Live Middleware Wiring Architecture

## Wire States
Each middleware area has a truthful state:
- `design_only` — exists in types/docs but no code executes
- `evaluated_only` — code exists and can evaluate but never actually ran on a request
- `wired` — code executes on requests but no durable evidence recorded
- `executed_and_verified` — code executed AND enforcement-evidence records exist

## Areas Tracked
1. **api_entitlements** — API route entitlement checks via api-entitlement-enforcement
2. **boundary_enforcement** — Cross-scope boundary blocking via boundary-enforcement
3. **extension_permissions** — Trust-based extension permission gating
4. **tenant_isolation** — Cross-tenant access denial
5. **provider_governance_in_releases** — Provider health gates on release approval
6. **payload_redaction** — Boundary redaction on cross-scope responses

## Truth Score Calculation
```
truth_score = (verified*100 + wired*70 + evaluated*30 + design*0) / (total * 100) * 100
```

## Integration
- `middleware-enforcement.getCoverageReport()` now delegates to live-middleware-wiring for honest state
- `readiness-reconciliation` consumes truth_score instead of assumed coverage
