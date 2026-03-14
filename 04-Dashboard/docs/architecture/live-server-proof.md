# Live Server Proof Architecture

## Server Detection
Probes `http://localhost:3200/` with 3-second timeout. Any 2xx-4xx response means server is running.

## 8 Proof Cases
| # | Case | Route | Expected | Middleware |
|---|------|-------|----------|-----------|
| 1 | Non-entitled compliance | /api/compliance-export | deny | api-entitlement-enforcement |
| 2 | Entitled release | /api/release-orchestration | allow | api-entitlement-enforcement |
| 3 | Cross-project boundary | /api/audit-hub | deny | boundary-enforcement |
| 4 | Cross-tenant denied | /api/tenant-admin | deny | middleware-enforcement |
| 5 | Boundary redact | /api/enforcement-evidence | redact | data-boundaries |
| 6 | Extension denied | /api/marketplace | deny | extension-permission-enforcement |
| 7 | Provider gate | /api/release-provider-gating | allow | release-provider-gating |
| 8 | Same-scope allowed | /api/middleware-truth | allow | boundary-enforcement |

## Dual Validation
Each case performs:
1. Real HTTP request to running server (records status + body size)
2. Middleware function call (records enforcement decision)

Both must succeed for `passed: true`.

## Evidence
Each case records enforcement evidence via `enforcement-evidence.recordEvidence()`.
