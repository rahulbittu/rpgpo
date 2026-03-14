# Artifact Registry

## Purpose
Central registry for all major artifacts produced across Parts 19-30. Enables lookup, lineage, and governance tracking.

## 22 Artifact Types
board_decision, work_order, execution_graph, execution_node, approval_gate, review_contract, promotion_dossier, simulation_result, readiness_score, enforcement_decision, override_entry, exception_case, tuning_recommendation, tuning_application, shared_pattern, provider_incident, documentation_artifact, drift_resolution, block_resolution, cost_decision, latency_decision, reliability_snapshot

## Registration Fields
- artifact_id, source_id, type, scope (lane/domain/project/isolation)
- Related IDs: task, graph, node, dossier
- Producer, title, retention, integrity
- Timestamps

## API
- `GET /api/artifact-registry` — All artifacts
- `POST /api/artifact-registry/register` — Register new
- `GET /api/artifact-registry/:id` — By ID
- `GET /api/artifact-registry/type/:type` — By type
