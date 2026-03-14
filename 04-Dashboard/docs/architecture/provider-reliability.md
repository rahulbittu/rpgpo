# Provider Reliability

## Metrics
- success_count, failure_count, retry_count
- override_linked_count, escalation_linked_count
- review_failure_correlation, promotion_block_correlation
- incident_count

## Health Classification
| State | Criteria |
|-------|----------|
| healthy | success_rate >= 85%, 0 incidents |
| watch | success_rate 70-85% or 1 incident |
| degraded | success_rate 50-70% or 2 incidents |
| unstable | success_rate < 50% or 3+ incidents |

## API
- `GET /api/provider-reliability` — All provider snapshots
- `GET /api/provider-incidents` — All incidents
- `POST /api/provider-incidents` — Record incident
