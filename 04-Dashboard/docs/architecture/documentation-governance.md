# Documentation Governance

## Purpose

Documentation governance ensures that architecture parts, execution graphs, promotions, and releases have required documentation before proceeding through lanes.

## Scope Types

| Scope | Required Artifacts | Dev | Beta | Prod |
|-------|-------------------|-----|------|------|
| `architecture_part` | architecture_doc, contract_doc, runbook | warn | soft_block | hard_block |
| `execution_graph` | graph_summary | warn | warn | soft_block |
| `promotion` | dossier_doc, review_summary | warn | soft_block | hard_block |
| `release` | changelog, release_notes, rollback_plan | warn | soft_block | hard_block |

## Block Levels

- **warn** — Log a warning, do not block
- **soft_block** — Block with override option
- **hard_block** — Block without override

## Documentation Artifacts

Artifacts are linked to their scope type and related ID (e.g., a graph ID or release ID). Each has a status: `draft`, `complete`, or `outdated`.

## API

- `GET /api/documentation-requirements` — All requirements
- `POST /api/documentation-artifacts` — Register an artifact
- `POST /api/documentation/check/:scopeType/:relatedId` — Check compliance
