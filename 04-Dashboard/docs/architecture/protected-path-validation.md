# Protected Path Validation Architecture

## Overview
End-to-end validation that protected routes actually enforce the expected behavior when real requests hit them.

## 8 Protected Paths
| Path | Protection | Expected | Middleware |
|------|-----------|----------|-----------|
| Non-entitled tenant on compliance | entitlement | deny | api-entitlement-enforcement |
| Cross-project audit query | boundary | deny | boundary-enforcement |
| Cross-tenant query | tenant_isolation | deny | middleware-enforcement |
| Cross-project evidence query | boundary | deny | boundary-enforcement |
| Untrusted extension action | extension_permission | deny | extension-permission-enforcement |
| Provider gate on release | provider_gate | allow | release-provider-gating |
| Entitled tenant on release route | entitlement | allow | api-entitlement-enforcement |
| Same-scope boundary check | boundary | allow | boundary-enforcement |

## Validation Flow
1. Look up path definition from `getProtectedPaths()`
2. Invoke actual middleware function with test scenario parameters
3. Compare observed decision against expected outcome
4. Record enforcement evidence via `enforcement-evidence.recordEvidence()`
5. Classify: validated / partially_validated / failed / not_wired
6. Persist run to state/protected-path-runs.json

## Integration
- Chief of Staff: `runProtectedPathValidation()`, `getProtectedPathSummary()`
- Memory Viewer: validation summary in governance artifacts
- Governance tab: run button + path-by-path results with middleware invoked
