# Enforcement Engine

## Purpose

Evaluates whether a specific action can proceed given the current governance state. Consumes all governance layers: policies, budgets, escalation, documentation, reviews, readiness scores, and approved overrides.

## Enforcement Rules (9 defaults)

| Rule | Action | Condition | Level |
|------|--------|-----------|-------|
| ef_prod_docs | promote_to_prod | documentation_incomplete | hard_block |
| ef_prod_reviews | promote_to_prod | reviews_not_passed | hard_block |
| ef_prod_readiness | promote_to_prod | readiness_below_75 | soft_block |
| ef_beta_docs | promote_to_beta | documentation_incomplete | soft_block |
| ef_beta_readiness | promote_to_beta | readiness_below_50 | warn |
| ef_exec_budget | start_execution | budget_exceeded | soft_block |
| ef_exec_escalation | start_execution | unresolved_escalation | warn |
| ef_release_all | release | not_promoted | hard_block |
| ef_dossier_graph | generate_dossier | graph_incomplete | warn |

## Override Clearing

When enforcement returns `soft_block` or `override_required`, the engine checks the override ledger for approved, non-expired overrides covering the required override types. If all types are covered, the decision is upgraded to `allow`.
