# Latency Governance

## Lane Thresholds
| Lane | Threshold | 2x Block |
|------|-----------|----------|
| dev | 10,000ms | 20,000ms |
| beta | 5,000ms | 10,000ms |
| prod | 3,000ms | 6,000ms |

## Latency Classification
- fast: significantly below threshold
- acceptable: within threshold
- slow: approaching threshold
- degraded: above threshold

## Decision Outcomes
- proceed — latency acceptable
- warn — approaching threshold
- reroute — above threshold (prod reroutes)
- fallback — significantly above threshold (non-prod)
- block — above 2x threshold (prod)
