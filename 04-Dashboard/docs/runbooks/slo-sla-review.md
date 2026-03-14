# Runbook: SLO/SLA Review

## Checking Status
`GET /api/slo-sla` — shows all 6 SLOs with current vs target

## Breach Response
When an SLO is breached (met=false):
1. Check which SLO is failing
2. Review the current value vs target
3. Investigate root cause (approval backlog? execution failures?)
4. Address the bottleneck
5. Re-check after remediation

## Budget Management
Each SLO has budget_remaining showing margin before breach.
When budget approaches 0, take preventive action.

## Regular Review
Weekly review of SLO statuses and reliability incidents recommended.
