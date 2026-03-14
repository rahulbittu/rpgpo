# Runbook: Protected Path Validation

## Run All Validations
`POST /api/protected-paths/run-all` — executes all 8 protected paths and records evidence

## Run Single Path
`POST /api/protected-paths/run/:pathId` — validates one specific path

## View Results
`GET /api/protected-path-summary` — summary with validated/partial/failed/not-wired counts
`GET /api/protected-paths` — list all path definitions
`GET /api/protected-paths/:pathId` — single path definition

## View Evidence
`GET /api/enforcement-evidence` — all evidence records
`GET /api/enforcement-evidence/area/:area` — evidence for specific area

## View Truth Report
`GET /api/middleware-truth` — honest wire state per area with truth score

## Target: 8/8 paths validated, truth score 100%, 0 design-only areas
