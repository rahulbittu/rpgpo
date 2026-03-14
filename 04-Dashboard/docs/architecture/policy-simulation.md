# Policy Simulation

## Purpose

Run governance checks against graphs, dossiers, and releases under simulated conditions without side effects on real execution state.

## Simulation Overrides

| Override | Effect |
|----------|--------|
| `lane` | Simulate under different lane (dev/beta/prod) |
| `policies` | Override policy values |
| `auto_execute_green/yellow` | Override autonomy budget flags |
| `max_retries` | Override retry limits |
| `documentation_present/missing` | Override doc availability |
| `review_verdicts` | Override review outcomes |
| `provider_confidence` | Override provider confidence |

## Outcome

Returns `pass`, `warn`, or `block` with explicit:
- Policy violations
- Budget violations
- Escalation triggers
- Missing docs
- Blocked actions
- Warnings
- Summary

## API

- `POST /api/policy-simulation/run` — Run simulation
- `GET /api/policy-simulation/:scenarioId` — Get scenario
- `GET /api/policy-simulation/results/:resultId` — Get result
