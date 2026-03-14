# Route Middleware Enforcement Architecture

## Bindings
8 protected routes with inline guards:
| Route | Guard Type | Behavior |
|-------|-----------|----------|
| /api/compliance-export | entitlement | deny non-entitled |
| /api/tenant-admin | isolation | deny cross-tenant |
| /api/audit-hub | boundary | redact cross-project context |
| /api/release-orchestration | entitlement | deny non-entitled |
| /api/marketplace | extension | deny untrusted |
| /api/enforcement-evidence | boundary | redact cross-project |
| /api/release-provider-gating | provider | deny when gated |

## Guard Chain
1. Entitlement → deny if feature not entitled for tenant plan
2. Isolation → deny if cross-tenant access
3. Boundary → deny or redact based on data-boundaries policy
4. Extension → deny if untrusted requesting governance features
