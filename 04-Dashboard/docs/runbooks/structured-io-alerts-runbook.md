# Structured I/O Alerts Runbook

**Part:** 69
**Last Updated:** 2026-03-14

## Alert Types

| Kind | Trigger | Default Threshold |
|------|---------|-------------------|
| `parse_spike` | Parse failure rate exceeds threshold | 20% with 20+ calls |
| `provider_error_spike` | Per-provider error rate exceeds threshold | 30% with 20+ calls |

## Viewing Alerts

```bash
curl http://localhost:3000/api/structured-io/alerts
```

Or use the Structured I/O Health panel in the dashboard.

## Acknowledging Alerts

```bash
curl -X POST http://localhost:3000/api/structured-io/alerts/ack \
  -H 'Content-Type: application/json' \
  -d '{"id": "sio_xxx", "actor": "operator"}'
```

## Provider Circuit Breaker

When a provider's error rate exceeds 50% with 20+ calls, its circuit opens:
- Open circuit: provider is skipped in routing decisions
- After 5-minute sleep window: circuit half-opens for trial
- Successful trial: circuit closes
- Failed trial: circuit re-opens

View circuit state:
```bash
curl http://localhost:3000/api/structured-io/providers/learning
```

## Override Provider Score

For emergency routing changes:
```bash
curl -X POST http://localhost:3000/api/structured-io/providers/override-score \
  -H 'Content-Type: application/json' \
  -d '{"providerKey": "openai", "score": 0.9}'
```

## Configuration

Edit `state/config/structured-io.json`:

```json
{
  "alerts": {
    "parseFailureRateThreshold": 0.2,
    "providerErrorRateThreshold": 0.3,
    "minCalls": 20,
    "evaluationIntervalMinutes": 5,
    "cooldownMinutes": 30
  }
}
```
