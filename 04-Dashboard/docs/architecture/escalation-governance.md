# Escalation Governance

## Purpose

Escalation governance defines rules that trigger operator involvement when the system detects conditions that require human judgment.

## Triggers

| Trigger | Description | Default Action |
|---------|-------------|----------------|
| `low_confidence` | Dossier confidence below threshold | Notify operator |
| `review_conflict` | Reviews have conflicting pass/fail | Require second provider review |
| `handoff_quality` | Handoff confidence below threshold | Notify operator |
| `privacy_risk` | Privacy policy violation detected | Pause execution |
| `mission_conflict` | Work conflicts with mission statement | Notify operator |
| `documentation_gap` | Required documentation missing | Notify operator |
| `provider_mismatch` | Provider uses deprecated fit | Downgrade to advisory |
| `retry_exhaustion` | Too many failed retries | Require operator approval |
| `promotion_attempt` | Promotion dossier pending | Require operator approval |

## Actions

| Action | Severity | Effect |
|--------|----------|--------|
| `notify_operator` | Low | Alert only, no blocking |
| `require_operator_approval` | Medium | Block until approved |
| `board_reopen` | Medium | Send back to Board of AI |
| `require_second_provider_review` | Medium | Get critique from another AI |
| `pause_execution` | High | Stop execution immediately |
| `downgrade_to_advisory` | Low | Make recommendation non-binding |

## Evaluation

`evaluateEscalation(graphId)` checks all enabled rules against the graph's current state and persists any fired events.
