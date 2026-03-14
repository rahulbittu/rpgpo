# Alert Routing

## Alert Categories
slo_breach, execution_failure, stuck_approval, stuck_escalation, security_finding, release_failure, provider_degradation

## Routing Targets
| Category | Target |
|----------|--------|
| stuck_approval/escalation | escalation_inbox |
| slo_breach/execution_failure | admin_workspace |
| security_finding | escalation_inbox |
| critical severity | operator_home |

## Deduplication
Same category+detail within 1 hour = deduped (not re-delivered).
