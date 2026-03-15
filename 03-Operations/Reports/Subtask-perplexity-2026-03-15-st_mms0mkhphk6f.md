# Subtask Output — Research Event-Driven Architecture Patterns
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Event-Driven Architecture (EDA) Overview
Event-driven architecture decouples producers and consumers via events published to brokers or streams, enabling real-time processing, scalability, and loose coupling. Core patterns include **pub/sub** for broadcasting events to subscribers, **event sourcing** for storing state as event sequences, and **CQRS** for separating read/write models.[1][2][3]

## Pub/Sub Pattern
Publishers send events to topics; multiple subscribers receive and process them independently, supporting scalability without direct dependencies.
- **Practical Example**: Amazon EventBridge in Amazon Key handles 2,000 events/second at 99.99% success rate and p90 latency of 80ms; uses single-bus multi-account pattern for routing across services, cutting onboarding from 48 to 4 hours.[5]
- **Trade-offs**: High scalability and resilience (failed consumer doesn't block producer); eventual consistency requires idempotent handlers and ordering via partition keys.[4]
- **Common Mistakes**: Ignoring schema validation, leading to deserialization errors; fixed by centralized schema repos and client libraries.[5]

Source: https://www.infoq.com/news/2026/02/amazon-key-event-driven-platform/[5]

## Event Sourcing
State is derived by replaying immutable event streams rather than storing current state, providing full audit trails.
- **Practical Example**: Define immutable events like `OrderPlacedEvent` with `eventId`, `timestamp`, `aggregateId`, `payload` (e.g., order items, totalAmount), and metadata (correlationId); use for microservices resilience.[4]
- **Trade-offs**: Excellent auditability and scalability (independent consumer scaling); higher storage/compute for replays, eventual consistency needs sagas or compensation events.[4]
- **Common Mistakes**: Non-idempotent consumers causing duplicate effects; ensure ordering guarantees and compensation for failures.[4]

Source: https://oneuptime.com/blog/post/2026-02-20-event-driven-architecture-guide/view[4]

## CQRS (Command Query Responsibility Segregation)
Separates write (commands updating event-sourced state) from read (queries on materialized views) models, optimizing each path.
- **Practical Example**: In microservices, commands publish events to broker; separate query services subscribe, build read-optimized views (e.g., for dashboards).[4]
- **Trade-offs**: Independent scaling of reads/writes boosts performance; added complexity in syncing views via events, eventual consistency.[4]
- **Common Mistakes**: Tight coupling via direct calls instead of events; use pub/sub to avoid blocking.[1][4]

Source: https://oneuptime.com/blog/post/2026-02-20-event-driven-architecture-guide/view[4]; https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven[1]

## Key Trade-offs and When to Use
| Aspect | Benefits | Challenges |
|--------|----------|------------|
| **Scalability** | Independent scaling; handles high-volume IoT/data (e.g., broker topology).[1][2] | Eventual consistency; needs idempotency, sagas.[4] |
| **Resilience** | Decoupled; failures isolated.[1][4] | Workflow coordination hard without orchestration.[3] |
| **Use Cases** | Real-time apps, microservices integration (e.g., Salesforce Platform Events).[7] | Avoid if strict ACID transactions needed.[3] |

## Common Mistakes Across Patterns
- No ordering/partitioning, causing out-of-order processing.[4]
- Schema drift without governance, inflating integration time (e.g., Amazon fixed via repos).[5]
- Overlooking observability; monitor latency, success rates (target 99.99%).[5]

## Concrete Next Steps
1. Prototype pub/sub with Amazon EventBridge: Deploy sample `OrderPlacedEvent` schema, test 1k events/sec locally (use AWS CDK).[5]
2. Implement CQRS/Event Sourcing in Node.js: Use Kafka for streams, add idempotent handlers with event versioning.[4]
3. Audit current system: Check for tight coupling (e.g., >10ms synchronous calls), migrate one service to EDA.[1]
4. Read full guides: Start with Microsoft EDA style for topology decisions.[1]

No results found for recent (post-2026-02) specific CQRS/event sourcing case studies beyond cited; refined search "CQRS event sourcing 2026 examples" yielded general overviews.
