# Runbook: Evidence Chain Audit

## When to Audit Evidence
- Before promotion to prod
- When an enforcement decision is disputed
- When an override is questioned
- When a provider incident needs root cause analysis

## Audit Steps
1. Identify the decision artifact (dossier, enforcement, override)
2. Query lineage: `GET /api/evidence-chain/:artifactId`
3. Review upstream artifacts — what evidence supported the decision
4. Review downstream artifacts — what was affected
5. Build bundle for comprehensive view: `POST /api/evidence-bundles/build/:type/:id`

## What to Look For
- Missing evidence links (decision without supporting reviews)
- Stale artifacts (old evidence used for recent decisions)
- Superseded artifacts (old versions still referenced)
- Cross-project links that violate isolation
