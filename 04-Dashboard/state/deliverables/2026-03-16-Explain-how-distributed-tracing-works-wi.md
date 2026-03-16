# Explain how distributed tracing works with OpenTelemetry. Cover trace context pr

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Distributed Tracing with OpenTelemetry
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

## Finding 6: Automatic I

## Synthesize Explanation of Distributed Tracing with OpenTelemetry
## Explanation

### Distributed Tracing with OpenTelemetry

Distributed tracing is a method used to track requests as they move through various services in a distributed system. OpenTelemetry is an open-source framework that provides the tools needed to implement distributed tracing.

### Trace Context Propagation

**Trace context propagation** is crucial for maintaining the continuity of a trace across service boundaries. It ensures that each part of a request is linked together, forming a complete picture of the transaction.

- **Version**: Indicates the version of the trace context format. Currently set to `00`.
- **Trace ID**: A unique identifier for the entire trace. This ID remains constant throughout the lifecycle of a trace.
- **Parent ID**: Identifies the span that directly caused the current operation, helping to establish a parent-child relationship between spans.
- **Flags**: Indicate sampling and tracing options, such as whether the trace should be recorded.

When a request passes between services, the Envoy sidecar proxy checks for existing trace context headers. If they are absent, new ones are generated. However, applications must forward these headers when making calls to other services to maintain trace continuity.

### Span Relationships

Spans represent individual units of work within a trace. They have a hierarchical relationship, forming a tree-like structure:

- **Root Span**: The first span in a trace, representing the initial request.
- **Child Spans**: Subsequent spans that represent operations caused by the root span or other child spans.

### Sampling Strategies

Sampling is used to control the amount of data collected:

- **Always On**: Collects all traces, useful for debugging but can be resource-intensive.
- **Always Off**: Collects no traces, useful for production environments where tracing is not needed.
- **Probabilistic Sampling**: Collects a percentage of traces, balancing data collection with resource usage.

### Collector Architecture

The OpenTelemetry Collector is a vendor-agnostic service that receives, processes, and exports telemetry data. It can be deployed as an agent or a gateway, offering flexibility in handling data:

- **Agent**: Runs on the same host as the application, collecting and forwarding telemetry data.
- **Gateway**: Centralized service that aggregates data from multiple agents.

### Correlating Traces with Logs and Metrics

Correlating traces with logs and metrics provides a comprehensive view of system performance:

- **Traces**: Show the path and timing of requests.
- **Logs**: Provide detailed event data.
- **Metrics**: Offer numerical data about system performance.

To correlate these, ensure that trace IDs are included in logs and metrics. This allows you to link related data across different observability tools.

## Examples

- **Trace Context Propagation in Python**: Use `inject(carrier)` to add trace context to message attributes and `extract(carrier)` to continue the trace on the receiving end.
- **Sampling Strategy**: Implement probabilistic sampling to collect 10% of traces, reducing overhead while maintaining visibility.

## Practice Questions

1. How does trace context propagation ensure continuity in distributed tracing?
2. What are the benefits of using probabilistic sampling in a production environment?
3. How can you correlate traces with logs and metrics in OpenTelemetry?

## Further Reading

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)
- [Envoy Proxy and OpenTelemetry Integration](https://www.envoyproxy.io/docs/envoy/latest/start/quick-start-otlp) 

By understanding these concepts, you can effectively implement distributed tracing with OpenTelemetry, gaining valuable insights into your system's performance.