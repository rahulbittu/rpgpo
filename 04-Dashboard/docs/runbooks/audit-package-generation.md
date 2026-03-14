# Runbook: Audit Package Generation

## When to Generate
- Before promotion to prod
- For compliance review
- When investigating a governance incident
- For external audit requests

## Steps
1. `GET /api/audit-packages/:scopeType/:relatedId` — generates package
2. Review: artifacts, evidence links, ledger entries, findings
3. Check findings for warnings/issues
4. For compliance: also build export via `POST /api/compliance-export`
