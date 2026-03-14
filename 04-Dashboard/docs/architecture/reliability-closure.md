# Reliability Closure Architecture

## Metric Sources
1. **measured-reliability** — execution success/failure/block rates, latency, SLO status, approval backlog
2. **live-middleware-wiring** — middleware enforcement truth score
3. **protected-path-validation** — protected path pass rate
4. **operator-acceptance** — operator acceptance rate
5. **http-middleware-validation** — HTTP validation pass rate

## Metric Classification
- `fully_measured` — derived from real telemetry/execution data
- `partially_measured` — has some real data but incomplete window
- `proxy_only` — no real data, estimated from static analysis

## Closure Score
`(fully_measured * 100 + partially_measured * 50) / (total * 100) * 100`

## Latency Closure
The previously unmeasured `avg_action_latency` metric is closed by emitting a telemetry probe event via `telemetry-wiring.emitTelemetry()` with a real duration.
