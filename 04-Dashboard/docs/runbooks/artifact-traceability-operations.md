# Runbook: Artifact Traceability Operations

## Registering Artifacts
All major system outputs should be registered via `registerArtifact(type, sourceId, title, metadata)`. The registry deduplicates by source_id + type.

## Building Evidence Bundles
Before promotion decisions:
1. `POST /api/evidence-bundles/build/dossier/:dossierId`
2. Review the bundle: how many artifacts, what links exist

## Querying Lineage
To understand what produced/influenced an artifact:
1. `GET /api/evidence-chain/:artifactId`
2. Review upstream (what this was produced from) and downstream (what it influenced)

## Traceability Audit
For compliance or incident investigation:
1. `GET /api/traceability-ledger` — full history
2. Filter by domain or project for scoped audit
3. Each entry shows actor, action, target, timestamp, and linked artifacts
