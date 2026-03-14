# Validation Harness Orchestrator Architecture

## Phases (sequential)
1. **Clean state** — Clear validation state files, verify clean
2. **Protected paths** — Run Part 51 protected path validation
3. **HTTP middleware** — Run Part 52 HTTP middleware validation
4. **Live server proof** — Run Part 54 live server proof

## Environment Detection
Probes `http://localhost:PORT/` before starting. Records:
- server_running, host, port, latency_ms, validation_mode, timestamp

## Usage
`POST /api/validation-harness/run` — runs all 4 phases in sequence
`GET /api/validation-harness` — latest execution with phase results
