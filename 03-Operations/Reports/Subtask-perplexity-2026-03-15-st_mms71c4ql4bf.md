# Subtask Output — Research Event-Driven Microservices
## Model: sonar
## Stage: research
## Date: 2026-03-15

# Event-Driven Microservices Patterns: Choreography, Orchestration, and Saga Patterns

Based on the search results provided, here's what I found on event-driven microservices patterns:

## Core Architecture Patterns

**Event-driven architecture (EDA)** decouples services through event communication rather than direct synchronous calls[1]. Services publish events to a broker, and interested consumers react independently[1].

Two primary communication models exist:

**Pub/Sub Model**: Messages broadcast to a common topic where any number of consumers can subscribe and receive notifications[3]. This enables loose coupling and independent scaling of workloads[3].

**Event Streaming**: Events are written to a log with strict ordering within partitions and durability[4]. Clients can read from any point in the stream, join at any time, and replay events—supporting recovery scenarios and reprocessing after bug fixes[4].

## Event Broker Comparison

The choice of broker depends on your throughput and latency requirements[1]:

| Broker | Best For | Ordering | Retention |
|--|--|--|--|
| Apache Kafka | High throughput, log-based | Per partition | Configurable |
| RabbitMQ | Flexible routing, low latency | Per queue | Until consumed |
| Amazon SNS/SQS | AWS-native, serverless | FIFO queues | 14 days max |
| NATS | Lightweight, cloud-native | Per subject | Configurable |

## Event Sourcing and Eventual Consistency

In financial services implementations, **event sourcing** enables replaying the complete history of customer interactions[2]. For example, when a customer opens a checking account and deposits money, each action relates to events that can be replayed to reconstruct system state[2]. This approach supports both creating systems of record outside legacy mainframes and maintaining audit trails[2].

One financial institution implemented event sourcing and event streaming across five critical business processes, with plans to expand distributed solutions as the system of record[2].

## Key Benefits and Challenges

**Benefits**[1][4]:
- Loose coupling between producers and consumers
- Independent scaling of consumers based on event volume
- Resilience—failed consumers don't block producers
- Natural audit trails through event history
- No point-to-point integrations; new consumers can be added without modifying existing services

**Common Pitfalls**[1]:
- Event storms (cascading events overwhelming the system)
- Schema evolution without breaking existing consumers
- Lost events from insufficient persistence
- Debugging difficulty across asynchronous services

**Performance Consideration**: The presence of a broker between producer and consumer can occasionally slow performance compared to direct service-to-service channels[3].

## Observability Requirements

For resilient event-driven systems, **observability and traceability are foundational requirements** to provide visibility and pinpoint failures across dozens of microservices[2].

---

**Note**: The search results provided comprehensive information on event-driven architecture fundamentals, but did not contain specific details on choreography vs. orchestration patterns or detailed saga pattern implementations with concrete examples, numbers, or recent case studies. To provide the specific, actionable data you requested (real names, numbers, dates, URLs), I would need to conduct additional targeted searches on those specific patterns.
