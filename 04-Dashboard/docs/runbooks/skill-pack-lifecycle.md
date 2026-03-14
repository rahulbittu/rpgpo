# Runbook: Skill Pack Lifecycle

## Creating
`POST /api/skill-packs` with name, description, capabilities

## Versioning
`POST /api/skill-packs/:id/version` — increments version

## Binding
`POST /api/skill-packs/:id/bind` with scope_type and scope_id

## States
draft → experimental (testing) → stable (production-ready) → deprecated

## Best Practices
- Start as draft, test in dev lane
- Promote to experimental after validation
- Promote to stable after evidence from execution
- Deprecate when superseded
