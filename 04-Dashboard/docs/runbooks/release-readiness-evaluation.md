# Runbook: Release Readiness Evaluation

## When to Score

- Before promoting any dossier
- Before cutting a release branch
- When the operator asks "is this ready?"

## Scoring Categories

| Category | Weight | Passing Criteria |
|----------|--------|------------------|
| Policy compliance | 15 | Governance simulation passes |
| Review health | 20 | All reviews pass or waive, none fail |
| Documentation | 15 | All required artifacts present |
| Escalation stability | 10 | No unresolved escalation events |
| Provider confidence | 10 | Average fit confidence above threshold |
| Mission alignment | 15 | Work description matches mission statement |
| Risk resolution | 15 | No unresolved risks or items in dossier |

## Recommendation Logic

- **ready** (75%+, no blockers): Safe to promote
- **conditional** (40-75% or warnings): Proceed with known gaps
- **not_ready** (<40% or blockers): Must resolve before proceeding

## Handling Not Ready

1. Check blockers list — these must be resolved
2. Check warnings list — these should be addressed
3. Look at category breakdown — lowest scores indicate where to focus
4. Re-run after fixes to verify improvement
