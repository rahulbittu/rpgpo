# Runbook: Provider Routing Governance

## How Provider Selection Works
1. Provider Registry selects based on role + task kind + scope
2. Reliability check filters out unstable providers
3. Cost check ensures budget availability
4. Latency check ensures SLA compliance
5. `chooseProviderWithGovernance()` combines all three

## Lane-Specific Behavior
| Lane | Cost Limit | Latency Threshold | Reliability Tolerance |
|------|-----------|-------------------|----------------------|
| dev | $10/day | 10s | watch OK |
| beta | $5/day | 5s | watch OK |
| prod | $2/day | 3s | healthy only |

## Fallback Behavior
Claude (local) is the universal fallback: free, fast, no network dependency.
When any external provider is blocked/degraded, Claude can substitute.
