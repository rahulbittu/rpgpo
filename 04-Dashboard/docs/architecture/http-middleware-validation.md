# HTTP Middleware Validation Architecture

## 8 Validation Cases
| # | Case | Route | Expected | Middleware |
|---|------|-------|----------|-----------|
| 1 | Non-entitled tenant on compliance | /api/compliance-export | deny (403) | api-entitlement-enforcement |
| 2 | Entitled tenant on release route | /api/release-orchestration | allow (200) | api-entitlement-enforcement |
| 3 | Cross-project audit query | /api/audit-hub | deny (403) | boundary-enforcement |
| 4 | Cross-tenant query | /api/tenant-admin | deny (403) | middleware-enforcement |
| 5 | Cross-project context (redact) | /api/evidence-chain | redact (200) | data-boundaries |
| 6 | Extension permission denied | /api/extensions/untrusted/action | deny (403) | extension-permission-enforcement |
| 7 | Provider governance gate | /api/release-provider-gating | allow (200) | release-provider-gating |
| 8 | Same-scope boundary | /api/audit-hub | allow (200) | boundary-enforcement |

## Redaction vs Deny
- Cross-project with `context` artifact type → redact (policy bp_cross_project)
- Cross-project with `api` artifact type → deny (policy bp_cross_project_api)
- Cross-tenant with any artifact → deny (policy bp_cross_tenant)
- Data-boundaries now uses two-pass matching: specific artifact first, then wildcard

## Evidence Chain
Each case records:
- Enforcement evidence via enforcement-evidence.recordEvidence()
- Redaction behavior records for redact-specific cases
- Results persisted to state/http-middleware-validation-runs.json
