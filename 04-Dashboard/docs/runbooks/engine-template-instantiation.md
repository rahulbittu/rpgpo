# Runbook: Engine Template Instantiation

## Viewing Available Templates
`GET /api/engine-templates` — shows 4+ built-in templates

## Instantiating
`POST /api/engine-templates/:id/instantiate` with tenant_id, engine_id, domain

## What Instantiation Creates
- Links template to engine for capability composition
- Doesn't modify existing engine state
- Template defaults become available via capability composer

## Composing After Instantiation
`GET /api/domain-capabilities/:engineId` — shows all active capabilities with sources
