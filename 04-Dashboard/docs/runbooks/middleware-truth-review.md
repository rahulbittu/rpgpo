# Runbook: Middleware Truth Review

## Check Truth Report
`GET /api/middleware-truth` — shows each area's honest wire state and truth score

## Wire State Progression
1. `design_only` — only in types/docs, needs code implementation
2. `evaluated_only` — code exists but never ran on a real request
3. `wired` — code runs but no durable evidence recorded
4. `executed_and_verified` — code ran AND evidence records exist

## Improve Truth Score
1. Run `POST /api/protected-paths/run-all` to exercise middleware and create evidence
2. Check `GET /api/middleware-truth` to see updated states
3. For `evaluated_only` areas, identify what request would trigger the middleware
4. For `wired` areas, ensure enforcement-evidence is being recorded

## Governance Tab
The Middleware Truth panel in the governance tab shows:
- Score cards for each wire state count
- Per-area state with detail
- Protected path validation results with pass/fail indicators
- Evidence records with middleware, decision, and route

## Target: truth_score >= 80% for conditional_go, 100% for go
