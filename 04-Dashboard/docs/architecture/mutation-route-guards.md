# Mutation Route Guards Architecture

## 10 Protected Mutation Routes
All use `mutation-route-guards.guardMutation()` which delegates to `http-response-guard.guard()`.

| Route | Method | Guard Types |
|-------|--------|------------|
| /api/skill-packs | POST | entitlement, isolation |
| /api/skill-packs/:id/bind | POST | entitlement, isolation |
| /api/engine-templates | POST | entitlement, isolation |
| /api/engine-templates/:id/instantiate | POST | entitlement, isolation |
| /api/extensions | POST | extension, isolation |
| /api/extensions/:id/install | POST | extension, isolation |
| /api/extensions/:id/uninstall | POST | extension, isolation |
| /api/integrations | POST | entitlement, isolation |
| /api/compliance-export | POST | entitlement |
| /api/marketplace | POST | extension, entitlement |

## Decision Recording
Every mutation decision is persisted to `state/mutation-guard-decisions.json` and enforcement evidence is recorded.
