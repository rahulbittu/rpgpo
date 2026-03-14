# Security Hardening

## 10 Controls
1. Tenant Isolation — implemented
2. API Entitlement Checks — partial (evaluation only)
3. Sensitive Artifact Redaction — implemented
4. Audit Coverage — implemented
5. Rollback Safety — implemented
6. Environment Separation — implemented
7. Secret Governance — partial (no auto-rotation)
8. Runtime Enforcement — implemented
9. Approval/Escalation Visibility — implemented
10. Data Boundary Controls — implemented (in deployment-readiness checklist)

## Posture Levels
strong, acceptable, weak, critical

## API
- `POST /api/security-hardening/run` — Run assessment
- `GET /api/security-hardening/findings` — Current findings
- `GET /api/hardening-checklist` — Checklist items
