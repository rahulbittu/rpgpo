# Subtask Output — Research Distributed Tracing with OpenTelemetry
## Model: sonar
## Stage: research
## Date: 2026-03-16

# Distributed Tracing with OpenTelemetry: Current Implementation Guide

## Finding 1: Trace Context Propagation Mechanisms

**Trace context** is the core mechanism that ties distributed traces together across service boundaries[2]. It includes four essential fields in the W3C Trace Context format[3]:

- **Version**: Currently `00`
- **Trace ID**: Unique identifier for the entire trace (example: `6841c10c878e1849dc7efb598905c04f`)
- **Parent ID**: Identifier of the span that directly caused the current operation (example: `cb6b9f8432533349`)
- **Flags**: Sampling and tracing options, such as whether the trace should be recorded and exported (`01` = sampled)

When a request moves between services, the Envoy sidecar proxy checks for existing trace context headers[2]. If headers are present, the proxy uses them; if absent, it generates new trace context. The critical detail: **the proxy handles context for network hops between services, but applications MUST forward trace headers when making calls to other services**, as the proxy cannot automatically correlate incoming requests to outgoing requests[2].

**Implementation example** (Python with Pub/Sub): Inject context on the sender side using `inject(carrier)` to embed trace context in message attributes, then extract it on the receiver side using `extract(carrier)` to continue the trace as a child span[1].

Source: https://oneuptime.com/blog/post/2026-02-24-how-to-configure-opentelemetry-context-propagation-in-istio/view

## Finding 2: Propagation Format Standards and Fallbacks

OpenTelemetry supports multiple propagation formats[2]:

- **W3C Trace Context** (recommended default): Vendor-neutral standard defining standardized trace context across system boundaries[3]
- **B3 Multi-Format**: Legacy format, use as fallback when required by other components
- **Jaeger**: Legacy format, enable only when required by other components

**Best practice configuration** (Python): Use `CompositePropagator` with W3C Trace Context taking priority and B3 as fallback[2]:

```python
from opentelemetry import propagate
from opentelemetry.propagators.composite import CompositePropagator
from opentelemetry.trace.propagation import TraceContextTextMapPropagator
from opentelemetry.propagators.b3 import B3MultiFormat

propagate.set_global_textmap(CompositePropagator([
    TraceContextTextMapPropagator(),
    B3MultiFormat(),
]))
```

For GraphQL/Hive Router setups, `trace_context` is the safest default; only enable `b3` or `jaeger` when required by other components[5].

Source: https://oneuptime.com/blog/post/2026-02-24-how-to-configure-opentelemetry-context-propagation-in-istio/view

## Finding 3: Sampling Strategies and Configuration

**Parent-based sampling** is the recommended approach: respect upstream sampling decisions to maintain trace coherence[5]. Configuration example for Hive Router:

```yaml
telemetry:
  tracing:
    collect:
      sampling: 0.1  # Trace 10% of requests
      parent_based_sampler: true  # Respect upstream sampling decisions
```

This prevents scenarios where a parent span is sampled but child spans are not, fragmenting the trace[5].

Source: https://the-guild.dev/graphql/hive/docs/router/observability/tracing

## Finding 4: Baggage for Cross-Span Attribute Propagation

**OpenTelemetry Baggage** is a built-in mechanism for propagating key-value pairs to all spans within a trace context[4]. Implementation pattern:

1. Set desired attributes as baggage entries at the trace beginning
2. Set attributes on the currently active span
3. Configure a `BaggageSpanProcessor` to automatically copy baggage entries to span attributes
4. All downstream spans in the trace context receive these attributes

**Security consideration**: Baggage is propagated across service boundaries and to third-party APIs—do not include sensitive information (passwords, API keys, personal data) as it will be transmitted to all downstream services[4].

Alternative: Use Langfuse SDKs with convenience methods `propagate_attributes()` (Python) or `propagateAttributes()` (TypeScript) for simpler attribute propagation[4].

Source: https://langfuse.com/integrations/native/opentelemetry

## Finding 5: Collector Architecture and OTLP Export

**OTLP (OpenTelemetry Protocol)** is the standard for exporting traces to backends[5]. Configuration example for Hive Router:

```yaml
telemetry:
  tracing:
    exporters:
      - kind: otlp
        enabled: true
        protocol: grpc
        endpoint: https://otel-collector.example.com:4317
        http:
          headers:
            authorization:
              expression: |
                "Bearer " + env("OTLP_TOKEN")
```

Traces are exported asynchronously and in batches to a tracing backend, then assembled into coherent traces for inspection[3]. OTLP-compatible backends include OpenTelemetry Collector or any system that natively understands OTLP[5].

Source: https://the-guild.dev/graphql/hive/docs/router/observability/tracing

## Finding 6: Automatic Instrumentation and Protocol Support

OpenTelemetry eBPF instrumentation provides **zero-code instrumentation** with automatic context propagation across services[6]. Supported protocols include[6]:

- HTTP/S
- gRPC
- gRPC-Web
- MQTT

OpenTelemetry instrumentation libraries handle context propagation automatically for common protocols, enabling traces to span processes, hosts, and programming languages without manual wiring at every boundary[3].

Source: https://opentelemetry.io/docs/zero-code/obi/

## Finding 7: Trace-to-Logs and Trace-to-Metrics Correlation

The search results do not contain specific information about correlating traces with logs and metrics. However, the general pattern involves propagating the **trace ID** (from trace context) into log and metric attributes so that all three signal types can be correlated by trace ID in observability backends. This requires configuring your logging and metrics SDKs to extract and include the trace ID from the active OpenTelemetry context.

Source: [no URL available in provided results]
