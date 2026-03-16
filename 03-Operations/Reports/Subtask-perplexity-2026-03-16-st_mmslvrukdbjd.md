# Subtask Output — Research current logging practices for microservices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Best Practices

- **Structured Logging with JSON**: Use JSON format for logs to enable high dimensionality, including fields like `trace_id`, structured stack traces, and redacted sensitive data (e.g., passwords masked as "[REDACTED]"). This supports parsing, searching, and dashboards; implement redaction at the source via framework hooks or OpenTelemetry Collector as a second layer.[2]
- **Correlation IDs**: Assign a unique ID (e.g., `trace_id` or AWS `Request ID`) to every incoming request and propagate it across all service calls for tracing transactions in distributed systems; 2026 standard mandates OpenTelemetry (OTel) for injecting and propagating Trace IDs across 10-20 services per request.[1][2][5]
- **Log Levels**: Categorize events as DEBUG, INFO, WARN, ERROR for filtering; apply log-level filtering and deduplication to control volume and costs.[1][2]
- **Centralized Aggregation with ELK**: Aggregate logs from multiple services using ELK Stack (Elasticsearch, Logstash, Kibana) for searching and monitoring; alternatives include Splunk, Datadog, Sentry.[1]
- **Performance Optimization**: Select allocation-aware loggers like Zerolog or Zap in Go (10x faster than Logrus); batch logs and compress before sending.[2]
- **Security and Compliance**: Never log sensitive data; filter at source to comply with GDPR/HIPAA.[1][2]

## Challenges

- **Distributed Tracing Complexity**: A single transaction spans dozens of services across clouds, generating telemetry; traditional monitoring alerts on "Service X slow" without explaining upstream causes or cascades.[4]
- **Log Volume and Costs**: High-volume logs increase network costs; requires aggressive batching, compression, deduplication, and log-level filtering.[2]
- **Sensitive Data Risks**: JSON flexibility leads to accidental logging of PII/API keys; hard to purge post-logging.[2]
- **Legacy Integration**: Microservices with monoliths need explicit contracts (e.g., Anti-Corruption Layer) to avoid propagating legacy rules; direct DB sharing prohibited.[5]
- **MTTR in Distributed Systems**: Without full telemetry correlation, debugging slows; observability reduces MTTR by 40-60%.[4][5]

## Tools

| Tool/Stack | Key Features | Use Case | Source |
|------------|--------------|----------|--------|
| **ELK Stack** (Elasticsearch, Logstash, Kibana) | Aggregates/searchable logs from multiple services; centralized dashboards. | Microservices log aggregation. | [1] |
| **OpenTelemetry (OTel)** | Standard for traces, metrics, logs; propagates Trace IDs; traces 10-20 service paths. | Correlation across distributed systems; 2026 mandatory. | [2][5] |
| **Zerolog/Zap** | Allocation-aware loggers; 10x faster than Logrus in Go benchmarks. | High-performance structured JSON logging. | [2] |
| **Splunk/Datadog/Sentry** | Structured JSON ingestion, parsing, dashboards. | Centralized alternatives to ELK. | [1] |
| **OpenTelemetry Collector** | Central redaction rules for sensitive data across services. | Security in pipelines. | [2] |

## Concrete Next Steps
- Audit current loggers: Benchmark Zerolog/Zap vs. existing (e.g., Logrus) using Go workloads from dash0.com/guides/json-logging[2]; target 10x throughput gain.
- Implement OTel: Integrate Trace ID propagation per service; deploy health dashboard with p95/p99 latency, error rates before launch (wishtreetech.com/blogs/...[5]).
- Setup ELK: Deploy via Elastic (in.springverify.com/blog/...[1]); start with correlation ID middleware in 1-2 services, test end-to-end trace.
- Volume Control: Enable batching/compression in agents; set alerts for pool exhaustion equivalents in logs (oneuptime.com/blog/...[3]).
- Measure Impact: Track MTTR pre/post (aim 40-60% reduction per ir.com/guides/...[4]); tag resources for per-1,000-request costs.[5]
