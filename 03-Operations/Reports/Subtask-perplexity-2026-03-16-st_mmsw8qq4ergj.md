# Subtask Output — Research Observability Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Structured Logging Standards
JSON is the dominant format for structured logging, emphasizing consistent schemas, correlation IDs, and redaction of sensitive data like passwords or PII to comply with GDPR/HIPAA.[1][4][5]  
Adopt OpenTelemetry Semantic Conventions for field names (e.g., "http.method": "POST", "http.status_code": 201) to avoid schema inconsistency; include timestamp, service name/version, request ID, user context (non-sensitive), error code, and single-escaped stack traces.[1][3][5]  
Use severity levels per OpenTelemetry: TRACE (1-4) for debugging, INFO (9-12) for operations, ERROR (17-20) for failures, FATAL (21-24) for crashes.[5]  
**Actionable next step**: Implement Serilog in .NET 10 with `builder.Services.AddSerilog()` and destructuring policies like `.Destructure.ByTransforming<LoginRequest>(r => new { r.Username, Password = "***REDACTED***" })`; test with Seq locally (2.5B+ downloads).[4]

## Distributed Tracing Instrumentation
Standardize with OpenTelemetry for trace-log correlation via automatic TraceId/SpanId capture in tools like Serilog 4.x; add correlation ID middleware for request tracing across services.[1][3][4]  
Roadmap: After SLO definition and metrics, instrument critical endpoints with distributed tracing.[3]  
**Actionable next step**: Follow OpenTelemetry logs guide (published 2026-02-20) to configure log pipelines linking traces; query "Show all checkout errors in production over the last 30 minutes for version X."[3][5]

## Custom Metric Design
Focus on high-dimensional logs with consistent fields (e.g., environment, request ID) for metric derivation; instrument application metrics tied to SLOs for key user journeys before tracing/logging.[3]  
No specific custom metric formulas found in last 30 days; prioritize metrics from structured logs like http.response.body.size (e.g., 256 bytes).[5]  
**Actionable next step**: Define service-level objectives first, then instrument health checks; review weekly against incidents to refine.[3]

## Alerting Philosophies
Set thresholds based on historical data and SLOs to avoid false positives; implement circuit breakers with realistic failure counts/percentages, meaningful fallbacks (e.g., cached data), and centralized platforms like ELK, Splunk, Datadog, or Sentry.[6]  
Weekly reviews of alert rules and runbooks; test logging post-upgrades for latency/debugging.[2][3]  
**Actionable next step**: Use log rotation, IAM least-privilege, and buffering for scalability; aggregate with ELK for API health dashboards.[2][6]

## SLO-Based Reliability Engineering
Drive observability roadmap from SLOs: 1) Define SLOs for user journeys, 2) Instrument metrics/health, 3) Standardize logging, 4) Add tracing, 5) Alerting/runbooks, 6) Weekly refinement.[3]  
Balance log retention for compliance vs. costs; synchronize node times, isolate multi-tenant logs, monitor agent CPU/memory.[2]  
**Actionable next step**: Enable EKS control plane logging (with cost review); integrate with existing tools and document architecture.[2][3]
