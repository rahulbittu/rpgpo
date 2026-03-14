# Exception Analytics

## Purpose

Aggregates governance exceptions across all modules to surface patterns, hotspots, and trends.

## Exception Categories

| Category | Source |
|----------|--------|
| override | Override ledger |
| enforcement_block | Enforcement decisions (non-allow) |
| promotion_block | Promotion control blocks |
| simulation_failure | Policy simulation blocks |
| readiness_shortfall | Release readiness low scores |
| escalation | Escalation events |
| review_failure | Failed review contracts |

## Aggregation Dimensions

- By category, severity, lane, domain, provider
- Time-windowed (default 30 days)
- Hotspots (top concentrations)
- Trends (rising override rates, repeated blockers)

## API

- `GET /api/exception-analytics` — Global aggregates
- `GET /api/exception-analytics/domain/:domain` — Domain-scoped
- `GET /api/exception-analytics/project/:projectId` — Project-scoped
- `GET /api/exception-analytics/provider/:providerId` — Provider-scoped
