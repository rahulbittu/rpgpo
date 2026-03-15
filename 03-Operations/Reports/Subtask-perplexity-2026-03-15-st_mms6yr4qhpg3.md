# Subtask Output — Research Distributed Tracing with OpenTelemetry
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: OpenTelemetry Traces and Spans Structure
OpenTelemetry traces consist of spans with fields including **Trace ID** (unique identifier shared across all spans), **Span ID** (unique per span), **Parent Span ID** (links to creating span, empty for root), **Name** (operation description), **Start/End Time**, **Status** (OK/ERROR/UNSET), **Attributes** (key-value metadata), **Events** (timestamped logs), and **Links** (references to other traces). Python example creates spans with links: `tracer.start_as_current_span("process_batch", links=[Link(previous_span_context, {"relationship": "triggered_by"})])`. Published February 20, 2026.  
**Source:** https://oneuptime.com/blog/post/2026-02-20-opentelemetry-traces-spans-guide/view[2]

## Finding 2: Context Propagation on GCP with Pub/Sub
Manual injection (sender): Use `inject(carrier)` to add `traceparent` (trace ID, parent span ID, flags) and `tracestate` (vendor data like GCP project) as Pub/Sub attributes: `publisher.publish(topic_path, data=message.encode('utf-8'), **carrier)`. Extraction (receiver): `ctx = extract(dict(message.attributes))`; start child span with `tracer.start_as_current_span('process-message', context=ctx)`. Sets attributes like `messaging.system: pubsub`. Published February 17, 2026.  
**Source:** https://oneuptime.com/blog/post/2026-02-17-how-to-implement-context-propagation-across-microservices-with-opentelemetry-on-gcp/view[1]

## Finding 3: Automatic Propagation in Python HTTP Requests
Install `opentelemetry-instrumentation-requests`; `RequestsInstrumentor().instrument()` auto-injects `traceparent` header. Example: `requests.post("http://payment-service/charge", json={"order_id": order_id})` propagates context, sets `order.id` attribute. Uses W3C Trace Context standard across service boundaries like HTTP/gRPC/queues.  
**Source:** https://oneuptime.com/blog/post/2026-02-20-opentelemetry-traces-spans-guide/view[2]

## Finding 4: Istio Configuration for Multi-Format Propagation
Istio Envoy proxy handles propagation: extracts headers on ingress, generates if absent, creates spans, forwards to app, and propagates outbound. App config: `CompositePropagator([TraceContextTextMapPropagator(), B3MultiFormat()])` prioritizes W3C, falls back to B3. Supports HTTP/gRPC/message queues. Published February 24, 2026.  
**Source:** https://oneuptime.com/blog/post/2026-02-24-how-to-configure-opentelemetry-context-propagation-in-istio/view[3]

## Finding 5: Go HTTP Propagation Example
Frontend: `otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(backendReq.Header))` injects context into backend request headers. Backend extracts: `ctx := otel.GetTextMapPropagator().Extract(r.Context(), propagation.HeaderCarrier(r.Header))`; starts `tracer.Start(ctx, "backend-process-data")` as child span. Uses W3C/Baggage propagators via `initTracer()`.  
**Source:** https://dev.to/godofgeeks/trace-context-propagation-3lpb[6]

## Finding 6: Solace PubSub Tracing with .NET OpenTelemetry
Client creates span with `TraceID`; Solace injects into message. Broker/receiver generate spans with same `TraceID`; collector exports to backend forming end-to-end trace. Manual instrumentation adds baggage/trace states. Spans include attributes (key-value pairs) for event mesh visualization. Without propagation, spans unlink.  
**Source:** https://docs.solace.com/API/API-Developer-Guide-NET/NET-API-Context-Propagation-Distributed-Tracing.htm[4]  
**Source:** https://docs.solace.com/Features/Distributed-Tracing/Distributed-Tracing-OTEL-Span-Fields.htm[5]

## Finding 7: General Mechanism and W3C Standard
**Trace context** includes trace/span IDs; injected into HTTP headers/message attributes on outbound calls. Receivers extract to attach spans. OpenTelemetry auto-handles HTTP/gRPC; defaults to W3C Trace Context. eBPF adds zero-code propagation for HTTP/S, gRPC, MQTT.  
**Source:** https://www.dash0.com/knowledge/what-is-distributed-tracing[7]  
**Source:** https://opentelemetry.io/docs/zero-code/obi/[8]

**Note on Jaeger Visualization:** No results found for OpenTelemetry + Jaeger specifics in last 30 days (post-2026-02-15). Searches returned general OpenTelemetry docs without Jaeger integration examples, numbers, or dates. Refine query to "OpenTelemetry Jaeger setup tutorial 2026" for updates.
