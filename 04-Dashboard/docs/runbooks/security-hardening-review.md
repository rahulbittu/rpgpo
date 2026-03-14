# Runbook: Security Hardening Review

## Running Assessment
`POST /api/security-hardening/run` — evaluates all 10 controls

## Reviewing Findings
`GET /api/security-hardening/findings` — current severity-ranked findings

## Hardening Checklist
`GET /api/hardening-checklist` — 10 items with completion status

## Priority Order
1. Fix blocker/high severity findings first
2. Address incomplete checklist items
3. Review secret health (expired keys)
4. Check boundary violation count
5. Verify runtime enforcement coverage
