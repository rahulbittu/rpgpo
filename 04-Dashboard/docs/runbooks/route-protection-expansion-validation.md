# Runbook: Route Protection Expansion Validation

## Check Coverage
`GET /api/route-protection-expansion` — full expansion report with categories

## Check By Category
`GET /api/route-protection-expansion/category/ship_critical`
`GET /api/route-protection-expansion/category/sensitive_noncritical`

## Check Mutation Guards
`GET /api/mutation-route-guards` — enforcement report
`POST /api/mutation-route-guards/validate` — rules + recent decisions

## Check Regressions
`GET /api/protection-regressions` — 4 regression checks for ship-critical guards

## Target: 22/22 guarded, 10/10 mutations enforced, 4/4 regressions pass
