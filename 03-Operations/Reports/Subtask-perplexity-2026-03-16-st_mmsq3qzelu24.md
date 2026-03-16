# Subtask Output — Research Event Sourcing with PostgreSQL
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Event Store Design with PostgreSQL

PostgreSQL supports event sourcing by leveraging its **JSONB** data type for storing immutable event streams and **GIN indexes** for efficient querying. A typical event table schema uses columns like `aggregate_id` (UUID), `sequence` (BIGINT for ordering), `event_type` (TEXT), `data` (JSONB), and `timestamp` (TIMESTAMPTZ).

```
CREATE INDEX idx_metadata ON events USING gin (metadata);
SELECT * FROM events WHERE metadata @> '{"source": "api", "version": 2}';
```
This indexes nested JSONB for fast lookups on event metadata, enabling queries by source or version[3].

**Marten** (.NET library on PostgreSQL) implements a document/event store with direct event appending:
```
session.Events.Append(command.OrderId, new OrderSubmitted(command.OrderId, command.CustomerId, command.Items));
await session.SaveChangesAsync(ct);
```
It handles streams per aggregate ID without repositories[6].

## Projections

Projections build read models from event streams using **CQRS** patterns: live (real-time), catch-up (replay from checkpoint), and persistent (materialized views).

- **Projection Patterns skill** automates transforming streams into read models, search indexes, and dashboards with checkpointing for scalability[5].
- Use PostgreSQL **window functions** for aggregated projections like running totals:
```
sum(revenue) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7_day_revenue
```
This supports efficient read-side views[3].

In **Mars Enterprise Kit Lite** (Spring Boot 4.0, PostgreSQL 16, Redpanda/Kafka), projections update via outbox pattern: events in Kafka trigger JPA updates in PostgreSQL, verified by consuming `order.created` and checking `orders` table status[2][8].

## Snapshots

No direct 2026 examples found in results for snapshots (periodic aggregate state saves to reduce replay). Marten supports snapshots implicitly via its `AggregateStreamAsync<Order>` which loads from events, recommending snapshots for large streams (e.g., every 1000 events)[6]. Infer from general practice: store in separate `snapshots` table with `aggregate_id`, `version`, `state` (JSONB).

## Replay Strategies

Replay rebuilds state by sequencing events per aggregate, using PostgreSQL **WAL** for ordered, commit-consistent capture.

- **WAL-based logical decoding** (via CDC tools like Striim) extracts INSERT/UPDATE/DELETE as events from WAL, enabling ordered replays without table scans. Delivers row-level changes near real-time for event-driven workflows[4].
- Marten replay: `session.Events.AggregateStreamAsync<Order>(orderId)` replays stream to hydrate aggregate[6].
- **Chaos testing in Mars Kit**: Replay phantom events (Kafka has event, PostgreSQL rolled back) via `/chaos/phantom-event` endpoint; verify with `rpk topic consume order.created` and `SELECT * FROM orders` (0 rows)[2].

**Storevent** framework manages reducers for replay across stores like PostgreSQL[7].

## Relevant Tools and Libraries

| Tool/Library | Stack | Key Features | Example Use |
|--------------|--------|--------------|-------------|
| **Marten** | .NET, PostgreSQL | Event store, append/load streams, unit-of-work | `session.Events.Append` for orders[6] |
| **Mars Enterprise Kit Lite** | Java 25, Spring Boot 4.0, PostgreSQL 16, Redpanda v24.3.1 | EDA with outbox, Flyway schema, TestContainers | `POST /orders` → Kafka event → projection[2] |
| **Striim CDC** | PostgreSQL WAL | Real-time event capture for replays | Logical decoding for DML events[4] |
| **Storevent** | Multi-store | Entity reducers, event management | Simplifies sourcing/replay[7] |

## Concrete Next Steps
1. Clone Mars Kit: Run `docker compose up -d` (PostgreSQL 16 + Redpanda), test order flow with `POST /orders`, verify projection via `GET /orders/{id}`[2]. Source: https://www.programmingonmars.io/labs/event-driven-kafka-postgres-spring-boot
2. Install Marten: Add to .NET project, implement `OrderCommandHandler` for append/replay[6]. Source: https://bradjolicoeur.com/article/we-need-to-talk-about-your-repository-pattern
3. Prototype event table: Create `events` with GIN on JSONB `metadata`, insert/test replay query[3]. Source: https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-in-2026-performance-features-and-when-to-use-each-3g7e
4. Add CDC: Enable PostgreSQL logical replication (`wal_level = logical`), pipe to Striim for WAL replays[4]. Source: https://www.striim.com/blog/change-data-capture-postgres-real-time-integration-guide/
