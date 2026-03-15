# ADR-0069: Structured I/O Observability + Metrics + Provider Learning + Evidence Lifecycle

**Status:** Accepted
**Date:** 2026-03-14
**Part:** 69

## Context

Parts 67-68 built the structured output pipeline and wired it into board/worker/chief-of-staff. However, there was no aggregate observability — no metrics, no alerting, no cost tracking, and evidence files accumulated without cleanup. Provider capabilities were static with no learning from actual outcomes.

## Decision

Add in-process metrics collection, provider learning with EWMA scoring and circuit breaker, evidence lifecycle management, cost tracking, and alerting — all exposed via API and an operator dashboard panel.

### New Modules (5)

| Module | Purpose |
|--------|---------|
| `structured-io-metrics.ts` | Event ingestion, rolling aggregation, histograms, percentiles |
| `structured-io-cost.ts` | Per-call cost estimation and accumulation |
| `provider-learning.ts` | EWMA scoring, circuit breaker, routing bias |
| `evidence-lifecycle.ts` | TTL cleanup, size enforcement, indexing |
| `structured-io-alerts.ts` | Spike detection, alert lifecycle, acknowledgement |

### Provider Learning

- **EWMA** (Exponentially Weighted Moving Average) with alpha=0.2
- **Dynamic Score** = 0.6×success + 0.25×(1/latency) + 0.15×(1/cost)
- **Circuit Breaker**: opens at 50% failure rate with 20+ calls; auto-resets after 5 min sleep window
- **Routing Bias**: ±20% adjustment to provider preference ordering

### Evidence Lifecycle

- TTL: 30 days default
- Max bytes: 500MB
- LRU eviction when over limit
- Operations log for audit

### Alerting

- `parse_spike`: fires when parse failure rate > 20%
- `provider_error_spike`: fires per-provider when error rate > 30%
- Cooldown: 30 min per alert kind
- Minimum calls: 20 before evaluation

### Cost Tracking

- Per-provider pricing table in config
- Estimates from input/output token counts
- Aggregation by provider and task

## API Routes (11 new)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/structured-io/metrics` | GET | Global metrics snapshot |
| `/api/structured-io/metrics/providers` | GET | Per-provider metrics |
| `/api/structured-io/metrics/schemas` | GET | Per-schema metrics |
| `/api/structured-io/latency-histogram` | GET | Latency bucket histogram |
| `/api/structured-io/costs` | GET | Cost summary |
| `/api/structured-io/alerts` | GET | Active alerts |
| `/api/structured-io/alerts/ack` | POST | Acknowledge alert |
| `/api/structured-io/providers/learning` | GET | Provider learning state |
| `/api/structured-io/providers/override-score` | POST | Override provider score |
| `/api/structured-io/metrics/reset` | POST | Reset metrics |
| `/api/structured-io/evidence/index` | GET | Evidence file index |

## UI

New "Structured I/O" tab with:
- Global KPIs (success rate, p50/p95, retry rate, cost)
- Per-provider table with dynamic score and circuit state
- Latency histogram
- Active alerts with acknowledge buttons
- Evidence store summary with age distribution

## Consequences

### Positive
- Full observability into structured I/O pipeline health
- Provider routing improves over time based on actual outcomes
- Evidence files don't accumulate indefinitely
- Operator can detect and respond to provider degradation

### Negative
- In-memory metrics buffer grows with call volume (bounded by retention)
- EWMA scoring requires tuning of alpha and weights
