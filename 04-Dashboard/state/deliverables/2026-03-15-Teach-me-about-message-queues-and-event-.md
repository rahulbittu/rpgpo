# Teach me about message queues and event streaming. Compare RabbitMQ, Apache Kafk

**Domain:** learning | **Date:** 2026-03-15 | **Subtasks:** 2



## Research Message Queues and Event Streaming
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

## Synthesize Information into a Report
## Key Findings

1. **RabbitMQ**: 
   - **Features**: Supports multiple protocols, flexible routing, low latency, ordering per queue, and retention until consumed. It is lightweight and suitable for both on-premises and cloud deployments.
   - **Use Cases**: Ideal for asynchronous job queuing, such as sending emails or generating reports, and for event-driven microservices.
   - **Architecture**: Utilizes a push-based model where messages are pushed to consumers up to a prefetch limit. It supports pub/sub but is not a true streaming log.

2. **Apache Kafka**:
   - **Features**: High throughput, log-based system, ordering per partition, and configurable retention. Known for its reliability and ability to handle high-ingress data streams.
   - **Use Cases**: Suitable for event sourcing, CQRS, and decoupling services in event-driven architectures. It excels in environments requiring high data throughput and real-time processing.
   - **Architecture**: Employs a pull-based model with log appends. Messages are stored in partitions, allowing for ordered processing and replay capabilities.

3. **AWS SQS**:
   - **Features**: Managed service with automatic scaling, message retention, and at-least-once delivery. Offers both standard and FIFO queues.
   - **Use Cases**: Best for decoupling microservices, handling asynchronous tasks, and scaling applications without managing infrastructure.
   - **Architecture**: Fully managed service with a queue-based architecture. Messages are sent and received via API calls, simplifying integration with AWS services.

## Detailed Analysis

### RabbitMQ
- **Architecture**: RabbitMQ is designed around a broker architecture where producers send messages to exchanges, which then route them to queues based on routing rules. Consumers then fetch messages from these queues. The system supports multiple messaging protocols, such as AMQP, MQTT, and STOMP.
- **Use Cases**: Commonly used for tasks that require complex routing and reliable message delivery, such as in financial services for transaction processing or in retail for order management systems.
- **Diagrams**: Imagine a central broker with multiple queues and exchanges. Producers send messages to exchanges, which route them to the appropriate queues based on routing keys.

### Apache Kafka
- **Architecture**: Kafka uses a distributed architecture with a cluster of brokers. Producers send messages to topics, which are divided into partitions. Each partition is an ordered log of messages. Consumers read messages from these partitions.
- **Use Cases**: Kafka is favored in scenarios requiring high throughput and fault-tolerant systems, such as real-time analytics, monitoring, and data integration pipelines.
- **Diagrams**: Visualize a series of brokers each with multiple partitions. Producers write to topics, and consumers read from these partitions, often in parallel for scalability.

### AWS SQS
- **Architecture**: SQS is a serverless queue system where messages are sent to a queue and are processed asynchronously by consumers. It supports both standard queues (offering high throughput) and FIFO queues (ensuring message order).
- **Use Cases**: Ideal for cloud-native applications, facilitating communication between distributed systems and services without managing the underlying infrastructure.
- **Diagrams**: Picture a cloud-based queue where messages are sent by producers and retrieved by consumers via API calls, with AWS managing the scaling and reliability.

## Recommended Actions

1. **Evaluate Use Case Requirements**:
   - **What to Do**: Identify the specific needs of your application, such as the required throughput, latency, and message ordering.
   - **Why**: Different systems excel under different conditions; matching the tool to the task ensures efficiency and reliability.
   - **Expected Outcome**: Optimized performance and resource utilization.
   - **First Step**: List the key requirements of your application and compare them with the capabilities of RabbitMQ, Kafka, and SQS.

2. **Consider Infrastructure and Management**:
   - **What to Do**: Decide between a managed service (AWS SQS) and self-managed solutions (RabbitMQ, Kafka).
   - **Why**: Managed services reduce operational overhead, while self-managed solutions offer more control and customization.
   - **Expected Outcome**: A balance between operational efficiency and control.
   - **First Step**: Assess your team’s capacity for managing infrastructure versus the need for customization.

3. **Prototype and Test**:
   - **What to Do**: Develop a prototype using the selected messaging system to test its integration with your existing architecture.
   - **Why**: Prototyping allows you to identify potential issues early and ensure compatibility.
   - **Expected Outcome**: Reduced risk of integration issues and smoother deployment.
   - **First Step**: Set up a small-scale test environment and implement basic message flows.

By following these steps, you can make an