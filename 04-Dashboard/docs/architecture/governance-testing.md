# Governance Testing

## Purpose

Reusable what-if test cases that validate governance behavior for graphs and dossiers.

## Built-in Tests

| Test | Expected | Checks |
|------|----------|--------|
| Beta lane readiness | pass | Simulate beta promotion |
| Prod lane readiness | pass | Simulate prod promotion |
| Missing docs in prod | block | Prod with missing architecture_doc + runbook |
| Low provider confidence | warn | Provider confidence at 30% |
| Strict review mode | pass | With strict review policy |
| Failed review in beta | block | Quality review fails in beta |

## Test Lifecycle

1. Tests are generated (built-in or custom)
2. Each test runs the simulation engine with its scenario overrides
3. Actual outcome compared to expected outcome → pass/fail
4. Results persisted for audit trail

## API

- `POST /api/governance-tests/run/:relatedType/:relatedId` — Run test suite
- `GET /api/governance-tests/:relatedType/:relatedId` — Get test results
