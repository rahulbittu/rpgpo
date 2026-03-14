# Network HTTP Validation Architecture

## Harness
The validation harness first probes the running server at `http://localhost:3200/api/middleware-truth`. If reachable, all 8 cases make real HTTP GET requests. If unreachable, falls back to direct middleware function invocation.

## 8 Validation Cases
| # | Case | Route | Expected | Middleware |
|---|------|-------|----------|-----------|
| 1 | Non-entitled tenant | /api/compliance-export | deny | api-entitlement-enforcement |
| 2 | Entitled tenant | /api/release-orchestration | allow | api-entitlement-enforcement |
| 3 | Cross-project boundary | /api/audit-hub | deny | boundary-enforcement |
| 4 | Cross-tenant query | /api/tenant-admin | deny | middleware-enforcement |
| 5 | Boundary redact context | /api/enforcement-evidence | redact | data-boundaries |
| 6 | Extension denied | /api/marketplace | deny | extension-permission-enforcement |
| 7 | Provider gate | /api/release-provider-gating | allow | release-provider-gating |
| 8 | Same-scope allowed | /api/middleware-truth | allow | boundary-enforcement |

## Network vs Function
- `validation_level: 'network'` — real HTTP request + middleware function check
- `validation_level: 'function_fallback'` — middleware function only (server not running)

Both levels record enforcement evidence for auditability.
