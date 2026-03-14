# Runbook: Drift Resolution Operations

## When Drift Resolutions Appear

Drift resolutions are generated when governance drift detection identifies signals. Each resolution proposes specific actions with risk and urgency.

## Resolution Review

1. Check `root_cause` — what drift was detected
2. Review `proposed_actions` — what changes are recommended
3. Assess `risk` and `urgency`
4. Check `evidence_ids` — how much supporting data

## Lifecycle

| Status | Action |
|--------|--------|
| Open | Review and decide |
| Approved | Ready for application |
| Applied | Change has been made |
| Verified | Operator confirms drift improved |
| Closed | Resolution complete |
| Rejected | Not needed or not appropriate |

## Verification

After applying a resolution, re-run drift detection. If the signal no longer appears, verify and close the resolution.
