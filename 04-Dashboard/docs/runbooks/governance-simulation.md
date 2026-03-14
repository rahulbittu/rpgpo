# Runbook: Governance Simulation

## When to Simulate

- Before promoting a graph from dev to beta
- Before promoting a dossier from beta to prod
- After changing operator policies, autonomy budgets, or escalation rules
- When evaluating whether documentation gaps will block a release

## Running a Simulation

### Via API
```
POST /api/policy-simulation/run
{
  "related_type": "graph",
  "related_id": "eg_xxxxx",
  "lane": "prod",
  "overrides": {
    "documentation_missing": ["runbook"],
    "review_verdicts": { "quality": "fail" }
  }
}
```

### Via UI
Click "Simulate Governance" on any execution graph panel. The system runs policy, budget, escalation, and doc checks for the selected lane.

## Interpreting Results

| Outcome | Meaning | Action |
|---------|---------|--------|
| `pass` | All checks clear | Safe to proceed |
| `warn` | Non-blocking issues found | Review warnings, proceed if acceptable |
| `block` | Blocking issues found | Resolve blockers before proceeding |

## Running What-If Tests

Click "Run What-If Tests" to execute 6 built-in governance test scenarios. Each test has an expected outcome — failures indicate governance configuration gaps.
