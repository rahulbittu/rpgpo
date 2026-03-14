# Runbook: Deployment Readiness Review

## Running Assessment
`POST /api/deployment-readiness/run` — computes 9-dimension readiness report

## Interpreting Results
- Overall score: percentage of total possible points
- Each dimension: score/max with status (ready/partial/not_ready)
- Blockers: must fix before deployment
- Warnings: should address but not blocking
- Recommended fixes: actionable next steps

## Target Score
- Dev deployment: 50%+
- Beta deployment: 70%+
- Prod deployment: 85%+
