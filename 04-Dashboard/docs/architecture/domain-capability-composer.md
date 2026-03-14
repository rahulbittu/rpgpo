# Domain Capability Composer

## Composition Sources (in precedence order)
1. Platform defaults (governance, audit, execution graph, approval workspace)
2. Engine template capabilities
3. Bound skill packs (engine-level then project-level)
4. Operator policy overrides
5. Entitlement constraints (blocked by subscription)

## Output
CapabilityCompositionPlan with: active capabilities + source, blocked capabilities + reason, template/pack/override breakdown

## API
- `GET /api/domain-capabilities/:engineId` — Compose for engine
- `POST /api/domain-capabilities/:engineId/compose` — Compose with project
