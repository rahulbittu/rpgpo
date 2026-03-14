# API Entitlement Enforcement

## 12 Protected Routes
| Route | Feature | Min Plan |
|-------|---------|----------|
| /api/compliance-export | compliance | team |
| /api/tenant-admin | tenant_admin | team |
| /api/collaboration-runtime | collaboration | pro |
| /api/release-orchestration | release | pro |
| /api/provider-reliability | provider_governance | pro |
| /api/marketplace | governance | pro |
| /api/extensions | governance | pro |
| /api/integrations | governance | pro |
| /api/skill-packs | governance | pro |
| /api/engine-templates | governance | pro |
| /api/security-hardening | governance | pro |
| /api/observability | governance | pro |

## Decision Outcomes
allowed, denied, denied_upgrade_required, denied_scope_violation
