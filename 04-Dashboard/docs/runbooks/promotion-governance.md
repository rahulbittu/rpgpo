# Runbook: Promotion Governance

## When a Promotion Dossier is Generated

1. **Chief of Staff** calls `generatePromotionDossier(graphId)`
2. System gathers: completed nodes, failed nodes, review results, gate statuses
3. Confidence score calculated: starts at 100, penalized for failures
4. Recommendation determined: promote (>70), hold (40-70), rework (<40)

## Before Promotion

1. **Escalation evaluation** — `evaluateEscalation(graphId)` checks all rules
2. **Documentation check** — `checkDocumentationRequirements('promotion', dossierId, lane)`
3. **Autonomy budget check** — Is auto-promotion allowed for this lane?
4. **Operator policy check** — What is the `learning_promotion_mode`?

## Promotion Flow

### Dev Lane
- Warn on missing docs, do not block
- Escalation rules: standard (notify on low confidence)
- Auto-promote: only if budget allows (default: no)

### Beta Lane
- Soft-block on missing docs (operator can override)
- Escalation: require approval for promotion attempts
- Auto-promote: never

### Prod Lane
- Hard-block on missing docs
- Escalation: require approval + board recheck
- Auto-promote: never
- Operator must explicitly approve

## Handling Escalation Events

| Event | Action |
|-------|--------|
| `promotion_attempt` triggered | Show in Governance tab, require operator click |
| `documentation_gap` triggered | Show missing docs, link to doc creation |
| `low_confidence` triggered | Show in CoS brief, highlight in dossier |
