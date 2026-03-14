# Runbook: Network HTTP Validation

## Run Validation
`POST /api/network-http-validation/run` — probes server, runs 8 cases at network or function level

## View Results
`GET /api/network-http-validation` — latest run with harness state, per-case results

## Full Clean-State Validation
1. `POST /api/clean-state-verification/clear` — clear stale state
2. `POST /api/protected-paths/run-all` — run Part 51 path validation
3. `POST /api/http-middleware-validation/run` — run Part 52 HTTP validation
4. `POST /api/network-http-validation/run` — run Part 53 network validation
5. `GET /api/final-go-verification` — get final production decision

## Target: 8/8 passed, network_validated > 0 when server running
