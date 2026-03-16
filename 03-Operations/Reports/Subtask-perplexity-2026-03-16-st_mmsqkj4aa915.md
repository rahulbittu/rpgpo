# Subtask Output — Research Distributed Tracing Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Context Propagation
Context propagation passes trace identifiers (trace ID, span ID, trace flags) across microservices via standardized HTTP headers like W3C Trace Context's `traceparent` and `tracestate`, ensuring spans connect into complete traces rather than isolated fragments.[1][2][3]

- In GCP with OpenTelemetry and Node.js, inject context into Pub/Sub messages using `opentelemetry.propagate.inject(carrier)` on the sender, then pass as message attributes; receivers extract automatically for child spans.[1]
- For Azure Application Insights with Service Bus (C# example): Producers add `activity.Id` and `activity.TraceStateString` to `message.ApplicationProperties["traceparent"]` and `["tracestate"]`; consumers create linked spans via `activity.SetParentId(traceparent)`. Handles HTTP/gRPC automatically, manual for queues.[3]
- OpenTelemetry defaults to W3C format for HTTP/gRPC; supports baggage for custom metadata like `messaging.solace.message.baggage.region=us-west` in Solace event brokers (v10.10.1+).[2][5]
- Go services: Use OTel SDKs for automatic propagation via HTTP headers or metadata; follow semantic conventions like `semconv.HTTPMethodKey`.[7]

Real-world: OneUptime's GCP setup traces requests across 5+ microservices, preventing disconnected spans in Cloud Trace.[1]

## Sampling Strategies
Search results lack specific recent details on sampling strategies (e.g., head-based, tail-based, or rate-limiting), but OpenTelemetry/Jaeger integrations emphasize low-overhead sampling via production configs in Jaeger/Tempo deployments for Kubernetes/Docker.[4]

- Claude Code Skill for Jaeger/Tempo includes "advanced sampling strategies" with minimal performance impact; auto-instruments Python/Node.js/Go to sample traces end-to-end without full capture.[4][6]
- Best practice inference: Combine with propagation to sample at ingress (e.g., 1% rate), propagate sampling flags in `traceparent` for consistent downstream decisions.[2]

No 2026 updates found; trend toward OpenTelemetry for vendor-neutral sampling over Jaeger/Zipkin natives.

## Tools: Jaeger and Zipkin
Jaeger and Zipkin enable visualization of traces from OpenTelemetry spans; recent skills focus on Jaeger/Tempo combos for microservices observability.[4][6]

| Tool | Key Features from Sources | Deployment Examples |
|------|---------------------------|---------------------|
| **Jaeger** | Production-ready Kubernetes/Docker Compose configs; tracks requests across services, identifies bottlenecks via OTel instrumentation (Python/Node.js/Go).[4][6] | Claude Code Skill: Full framework with auto context propagation.[4] |
| **Zipkin** | Not directly detailed; older tool, trends shift to OTel collectors exporting to Zipkin-compatible backends for legacy support.[2] | No recent examples; pair with OTel for propagation like Jaeger. |
| **Tempo (Grafana)** | Paired with Jaeger for storage/visualization; low-cost object storage backend.[4] | Docker Compose setups in skills for end-to-end visibility.[4][6] |

Real-world: LobeHub/Claude skills deploy Jaeger/Tempo for microservices, automating propagation and sampling; used in complex architectures for latency debugging.[4][6]

## Recent Trends and Updates (2026)
- Feb 2026: OneUptime posts detail OTel propagation on GCP (Pub/Sub/Tasks) and Azure (Application Insights), emphasizing W3C headers for multi-language services.[1][3]
- OpenTelemetry dominates: Automatic instrumentation for HTTP/gRPC, manual for async (queues); shift from Jaeger/Zipkin to OTel collectors for unified export.[2][7]
- Vendor integrations: Solace PubSub+ adds span attributes like `messaging.source.kind=queue` for event meshes (v10.10.1).[5]

**Next Steps**:
- Deploy OTel SDK: Start with Node.js example from [1], test propagation on GCP Pub/Sub.
- Set up Jaeger: Use Docker Compose from Claude Skill [4]; sample at 0.1% initially.
- Verify: Instrument 2-3 mock services, check trace continuity in Jaeger UI.
- Update: Monitor OpenTelemetry 2026 releases for sampling enhancements.
