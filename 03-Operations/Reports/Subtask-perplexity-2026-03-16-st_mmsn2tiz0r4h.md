# Subtask Output — Research Microservice Communication Patterns
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Synchronous REST/HTTP

REST uses HTTP methods and JSON payloads for request-response communication, where the caller blocks until a response arrives[1].

- **Use cases**: Common for simple API interactions like user authentication or product queries in e-commerce systems; user requests pass through an API gateway to services like authentication then product services[1][2].
- **Benefits**: Widely supported, human-readable JSON, easy debugging with standard tools[1].
- **Drawbacks**: Higher latency due to HTTP overhead, less efficient for high-performance needs or streaming[1].
- **When to use**: When immediate responses are needed without extreme performance demands; default for most synchronous inter-service calls[1].

## gRPC

gRPC employs Protocol Buffers for serialization and HTTP/2 for transport, enabling faster performance and bidirectional streaming[1][2].

- **Use cases**: High-throughput scenarios like real-time data processing or internal service-to-service calls in scalable apps; services communicate via gRPC for low-latency needs[1][2].
- **Benefits**: 5-10x faster than REST in benchmarks due to binary serialization and multiplexing; supports unary, server/client/bidirectional streaming[1].
- **Drawbacks**: Steeper learning curve with Protobuf schemas; less browser-friendly without proxies[1].
- **When to use**: High-performance synchronous needs with immediate responses; choose over REST if speed is critical[1].

## GraphQL Federation

GraphQL enables querying multiple services via a federated gateway, aggregating data in a single request (mentioned as synchronous pattern)[1].

- **Use cases**: Complex queries spanning services, like fetching user profile with orders and recommendations; reduces over-fetching in frontends[1].
- **Benefits**: Flexible querying, single endpoint reduces chattiness via API gateways[1][4].
- **Drawbacks**: Query complexity can lead to N+1 problems if not optimized; higher cognitive load for schema management[1].
- **When to use**: When clients need data from multiple services in one call; pair with API gateway for control[1][4].

## Asynchronous Events (Message Queues, Pub/Sub, Event Streaming)

Async patterns decouple services: sender publishes events (e.g., via Kafka, SQS) without waiting, enabling resilience and graceful degradation[1][3].

- **Use cases**: Reliable delivery like order processing (queue for payment service) or broadcasting (pub/sub for notifications); emit events and move on when dependencies might fail[1][3].
- **Benefits**: Fault isolation (one service down doesn't block others), scalability via independent scaling, eventual consistency via sagas[1][3].
- **Drawbacks**: Eventual consistency complicates debugging; requires observability like OpenTelemetry for tracing[3].
- **When to use**: No immediate response needed, or for broadcasting/reliable delivery; prefer queues for ordered tasks, pub/sub for fan-out[1][3].

## Choosing Patterns: Decision Framework

Use this flowchart logic from recent guides[1]:

| Need | Decision Path | Recommended Pattern |
|------|---------------|---------------------|
| Immediate response? Yes, high perf? | gRPC | gRPC[1] |
| Immediate response? Yes, standard? | REST/HTTP or GraphQL | REST (simple), GraphQL (aggregated queries)[1] |
| No immediate response? Reliable delivery? | Message Queue (e.g., SQS/Kafka) | Queues or Streaming[1][3] |
| Broadcasting? | Pub/Sub | Pub/Sub[1] |

**Enterprise trade-offs in 2026**: Avoid synchronous-heavy "distributed monoliths" by favoring async for resilience; use API gateways to centralize routing/security[2][3][4]. For teams <50 developers, consider modular monoliths first[3].

**Next steps**:
- Implement API gateway (e.g., Kong or AWS API Gateway) for all patterns[4].
- Add OpenTelemetry for distributed tracing in async setups[3].
- Prototype with gRPC for perf-critical paths using official docs.

Sources:  
[1] https://oneuptime.com/blog/post/2026-02-20-microservices-communication-patterns/view (Feb 20, 2026)  
[2] https://hyscaler.com/insights/microservices-vs-monolith/  
[3] https://wishtreetech.com/blogs/digital-product-engineering/microservices-architecture-for-enterprise-benefits-trade-offs/  
[4] https://itnext.io/api-gateway-the-control-hub-of-microservices-383e2a84c1b9
