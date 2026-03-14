# Observability

## Telemetry Events
category, action, outcome (success/failure/blocked/warning), duration_ms, scope metadata

## Computed Metrics
throughput, success_rate, failure_rate, blocked_rate, avg_duration

## Scoped Queries
By tenant, lane, engine, project, provider, action, time window

## API
- `GET /api/observability` — Metrics + recent events
- `POST /api/observability/query` — Filtered query
