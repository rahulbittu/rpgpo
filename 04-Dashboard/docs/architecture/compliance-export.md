# Compliance Export

## Purpose
Generate deterministic, privacy-safe export bundles for external review.

## Export Includes
- Registered artifacts, evidence bundle, traceability entries
- Policy versions in force, overrides/exceptions
- Readiness/simulation context, documentation status

## Scopes
graph, dossier, project, release

## API
- `POST /api/compliance-export` — Build export
- `GET /api/compliance-export/:exportId` — Retrieve
