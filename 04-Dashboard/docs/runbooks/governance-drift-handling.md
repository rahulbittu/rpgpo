# Runbook: Governance Drift Handling

## When Drift Is Detected

Drift signals fire when the system detects that actual behavior consistently diverges from defined governance policy.

## Drift Signal Types

| Signal | Action |
|--------|--------|
| `repeated_override` | Review the underlying enforcement rule — it may be too strict for current workflow |
| `chronic_sim_warnings` | Re-calibrate policies or simulation parameters |
| `frequent_promotion_blocks` | Adjust promotion policy thresholds or address recurring blockers |
| `provider_mismatch_drift` | Update provider-role assignments in the registry |
| `exception_trend` | Investigate the trend source and add targeted escalation rules |

## Resolution Flow

1. Review drift signals in the Governance tab
2. Check the evidence count and time range
3. If drift is expected (intentional behavior change):
   - Approve the corresponding tuning recommendation to update policy
4. If drift is unexpected (governance gap):
   - Investigate root cause
   - Tighten relevant rules
   - Add documentation requirements if needed
5. Monitor subsequent governance health snapshots for improvement
