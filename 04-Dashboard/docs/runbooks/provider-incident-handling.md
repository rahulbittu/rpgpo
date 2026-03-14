# Runbook: Provider Incident Handling

## When Incidents Occur
Provider incidents are recorded when repeated failures, latency spikes, or cost spikes are detected.

## Incident Types
| Type | Response |
|------|----------|
| repeated_failure | Check provider status, consider fallback |
| latency_spike | Monitor, reroute if persistent |
| governance_issue | Review enforcement decisions |
| cost_spike | Check budget, may need rate limiting |
| reliability_drop | Compute fresh reliability snapshot |

## Resolution
1. Check `GET /api/provider-incidents` for open incidents
2. Investigate root cause (provider outage, rate limit, etc.)
3. If provider is unstable, `chooseProviderWithGovernance` will auto-avoid it
4. Record resolution when fixed
