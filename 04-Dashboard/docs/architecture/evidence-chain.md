# Evidence Chain

## Purpose
Graph-like lineage linking artifacts so the system can explain what evidence supported any decision.

## Edge Relations
| Relation | Meaning |
|----------|---------|
| produced_by | Artifact was created by another |
| contributed_to | Artifact contributed to a decision |
| blocked_by | Artifact caused a block |
| cleared_by | Artifact cleared a block (e.g., override) |
| influenced | Artifact influenced an outcome |
| superseded | Artifact replaced another |

## Evidence Bundles
Grouped evidence for decision points (dossiers, promotions, drift cases). Includes all related nodes and edges.

## API
- `GET /api/evidence-chain/:artifactId` — Lineage summary
- `POST /api/evidence-chain/link` — Create link
- `POST /api/evidence-bundles/build/:type/:id` — Build bundle
