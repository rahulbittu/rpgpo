# Shared Pattern Exchange

## Pattern Types
prompt_recipe, provider_heuristic, escalation_lesson, governance_mitigation, documentation_template, tuning_lesson

## Pattern Scopes
- project_private — visible only to source project
- engine_shared — visible to all projects in same engine
- operator_global — visible to all projects

## Lifecycle
candidate (pending) → approved → shared pattern (experimental) → promoted → deprecated

## Redaction
All candidates are automatically redacted before approval. Project IDs, task IDs, and project names are replaced with placeholders.

## API
- `POST /api/pattern-exchange/candidates` — Create candidate
- `POST /api/pattern-exchange/candidates/:id/approve` — Approve + promote
- `POST /api/shared-patterns/:id/use` — Record usage
