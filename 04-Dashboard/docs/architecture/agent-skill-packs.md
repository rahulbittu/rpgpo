# Agent Skill Packs

## Capability Types
prompt_recipe, provider_preference, collaboration_pattern, review_requirement, policy_default, documentation_template, release_default, observability_hook, security_expectation

## States
draft → experimental → stable → deprecated

## Binding
Packs bind to scope: global, tenant, engine, project. Bindings are explicit and auditable.

## API
- `GET /api/skill-packs` — All packs
- `POST /api/skill-packs` — Create pack
- `POST /api/skill-packs/:id/bind` — Bind to scope
