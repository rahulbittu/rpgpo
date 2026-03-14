# Runbook: Live Server Proof Validation

## Prerequisites
Server must be running at http://localhost:3200

## Run Live Proof
`POST /api/live-server-proof/run` — runs 8 proof cases against live server

## View Results
`GET /api/live-server-proof` — latest run with per-case results and proof level

## Run Full Harness
`POST /api/validation-harness/run` — clean state → paths → HTTP → live proof

## Get Authorization
`GET /api/go-authorization` — final decision with gates and proof gaps

## Target
- 8/8 cases passed at live_network level
- proof_complete: true
- confidence: fully_proven
- authorization: GO
