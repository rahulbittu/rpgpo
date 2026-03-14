# Governance Drift Detection

## Purpose

Detects mismatch between defined governance policy and actual operating behavior.

## Drift Signal Categories

| Category | Trigger |
|----------|---------|
| repeated_override | Same override type used 3+ times |
| chronic_sim_warnings | 3+ simulation warnings/blocks |
| frequent_promotion_blocks | 2+ promotion blocks |
| provider_mismatch_drift | 2+ provider-role mismatches from reverse prompting |
| exception_trend | Rising exception trends from analytics |

## Drift Reports

Reports group signals by scope (global/engine/project) with evidence counts and time ranges. Reports are persisted for trend tracking.

## API

- `GET /api/governance-drift` — Global drift report
- `GET /api/governance-drift/domain/:domain` — Engine-scoped
- `GET /api/governance-drift/project/:projectId` — Project-scoped
