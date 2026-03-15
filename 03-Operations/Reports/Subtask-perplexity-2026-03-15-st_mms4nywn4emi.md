# Subtask Output — Research Message Queues and Event Streaming
## Model: sonar
## Stage: research
## Date: 2026-03-15

## RabbitMQ
RabbitMQ is the most widely deployed open-source message broker, lightweight for on-prem and cloud, supporting multiple protocols with high availability via distributed/federated configs.[2] Consumers set prefetch limits for message pushing.[2] Used by T-Mobile and Runtastic.[2]

**Features**: Flexible routing, low latency, ordering per queue, retention until consumed.[1]
**Use Cases**: Queue jobs asynchronously (e.g., emails, reports) to avoid blocking user responses; event-driven microservices.[3]
**Architecture**: Push-based to consumers up to prefetch limit; supports pub/sub but not a true streaming log.[2]

## Apache Kafka
Apache Kafka is a pub/sub message bus for high-ingress data streams and replay, appending messages to a log until read or retention limit.[2] Pull-based for batch requests and high throughput; used by 10.3% of Stack Overflow survey respondents.[2] Trusted by Goldman Sachs, Target, Cisco; Stripe handles 250M API requests/day with Kafka event streaming (99.999% uptime, <5 min downtime/year).[3]

**Features**: High throughput, log-based, ordering per partition, configurable retention.[1]
**Use Cases**: Event sourcing (append events to store, replay for state); CQRS (write/read separation via events); decoupling services in event-driven architecture (e.g., order.created event triggers inventory/notifications).[1][3]
**Architecture**: Log appends (not queue); partitions for ordering; event projector replays to read DB (see CQRS Mermaid diagram in [1]).

```
graph TB
    subgraph Write Side
        A[Command Handler] --> B[Domain Model]
        B --> C[Event Store]
    end
    subgraph Read Side
        C --> D[Event Projector]
        D --> E[Read Database]
        F[Query Handler] --> E
    end
    G[Client] -->|Commands| A
    G -->|Queries| F
    style C fill:#e65100,stroke:#bf360c,color:#fff
```

## AWS SQS
AWS SQS (Simple Queue Service) is a pub/sub message broker for auto-scaling in AWS, with FIFO queues; retention max 14 days; expensive outside AWS.[1][2] Used by Cigna, Amtrak, Tableau.[2]

**Features**: AWS-native/serverless, ordering in FIFO queues, 14-day retention max.[1]
**Use Cases**: Asynchronous job queuing (e.g., slow tasks like video processing) without blocking responses.[3]
**Architecture**: No external hosting; scales up/down natively in AWS.[2] No diagrams in results.

## Comparisons
| Broker       | Best For                  | Ordering       | Retention          | Notes |
|--------------|---------------------------|----------------|---------------------|-------|
| **RabbitMQ** | Flexible routing, low latency | Per queue     | Until consumed     | Easier ops (add nodes fast vs Kafka features); push-based.[1][4][2] |
| **Kafka**    | High throughput, log-based | Per partition | Configurable       | Pull-based, streaming; harder setup (1 month vs RabbitMQ scaling).[1][2][4] |
| **SQS**      | AWS-native, serverless    | FIFO queues   | 14 days max        | AWS-only, costly elsewhere.[1][2] |

**Key Tradeoffs**: Kafka for streams/replay (e.g., 250M req/day at Stripe); RabbitMQ for quick scaling/low latency; SQS for serverless AWS queues. Eventual consistency handled via idempotency, partitions, sagas.[1] No 2026-specific updates (last 30 days) beyond 2026 guides; results from Feb 2026.[1]

**Sources**:
- [1] https://oneuptime.com/blog/post/2026-02-20-event-driven-architecture-guide/view
- [2] https://www.boot.dev/blog/backend/top-backend-technologies/
- [3] https://www.articsledge.com/post/backend-development
- [4] https://gist.github.com/ThatRendle/26e423b6597685757732?permalink_comment_id=2161033
