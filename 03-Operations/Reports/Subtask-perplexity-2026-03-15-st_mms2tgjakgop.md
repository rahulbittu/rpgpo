# Subtask Output — Research Event Sourcing and CQRS
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Event Sourcing and CQRS Overview
**Event Sourcing** stores application state as a sequence of immutable events in an append-only log, rebuilding current state by replaying events. **CQRS** (Command Query Responsibility Segregation) separates write operations (commands) from read operations (queries), enabling independent scaling of read/write models.[1][2]

## Key Differences
| Aspect | CQRS | Event Sourcing |
|--------|------|----------------|
| Core Focus | Separates read/write models | Stores state as event sequence |
| State Storage | Direct current state | Reconstructed via event replay |
| Scaling | Independent read/write scaling | Via event management/replay |
| Complexity | Moderate | Higher due to event handling |
| Auditability | Limited | Full change history[1] |

## Practical Examples
- **eCommerce System (March 6, 2026)**: Uses Event Sourcing + CQRS with three services for customer/product/order data. Materialized views include denormalized joins (customer/product/order), aggregations (order stats), and real-time inventory. Implemented via Hazelcast Jet pipeline with 6 stages: PendingEvents map → EventStore persist → view updates → event bus publish. Existing code reviewed solid, recommending correlation IDs and observability additions.[5]
- **Clinic ASR Dashboard (arxiv paper, Feb 2026)**: ESAA architecture with 4 concurrent LLM agents (Claude Sonnet 4.6, Codex GPT-5, Antigravity/Gemini 3 Pro, Claude Opus 4.6). Generated 50 tasks, 86 events, 8 phases. Event store coordinates multi-agent orchestration; CQRS separates writes (agent intentions/diffs) from reads (derived state).[4]
- **Microservices Event-Driven Flow**: Write side: Command Handler → Domain Model → Event Store. Read side: Event Projector → Read Database → Query Handler. Uses idempotent consumers, partition keys for ordering, compensation events, Saga pattern for eventual consistency.[2]

## Common Pitfalls
- Event store grows indefinitely, complicating size management.[1]
- Event replay requires handling schema evolution for old events mismatched to new logic.[1]
- Higher complexity in event handling vs. snapshot state management.[1][6]
- Eventual consistency demands idempotent consumers and ordering guarantees (e.g., Kafka partition keys).[2]

## Relation to Microservices
In microservices, Event Sourcing + CQRS enables event-driven architecture with separate write/read optimization per service. Event brokers like **Apache Kafka** (high throughput, per-partition ordering, configurable retention) or **Amazon SNS/SQS** (serverless, 14-day retention max) publish events for cross-service consistency via Sagas. Example: Services append events instead of DB updates, projecting to read-optimized stores.[2]

**Next Steps**:
- Prototype eCommerce views using Hazelcast Jet: Define 3 view types, implement 6-pipeline stages (code from [5]).
- Test multi-agent setup: Replicate clinic-asr with 4 LLMs, target 50+ tasks/80+ events (arxiv code implied in [4]).
- Benchmark brokers: Kafka for >1M events/day throughput per [2].
