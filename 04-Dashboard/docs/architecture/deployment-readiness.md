# Deployment Readiness

## 9 Dimensions (10 points each)
1. tenant_isolation — project/tenant isolation enforced
2. governance_completeness — Parts 19-35 governance layers
3. release_maturity — release orchestration + pipeline
4. documentation — documentation governance active
5. audit_compliance — audit hub + compliance export
6. rollback_readiness — rollback control available
7. provider_governance — reliability + cost + latency
8. admin_subscription — tenant admin + subscription ops
9. ux_operator — approval workspace + escalation inbox + collaboration

## API
- `POST /api/deployment-readiness/run` — Compute readiness
- `GET /api/deployment-readiness` — Past reports
