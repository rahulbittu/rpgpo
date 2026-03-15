# Subtask Output — Research Connection Pooling
## Model: sonar
## Stage: research
## Date: 2026-03-15

## PgBouncer
PgBouncer is a lightweight PostgreSQL connection pooler that acts as a proxy between applications and the database, supporting transaction, session, and statement pooling modes for efficient connection reuse across services.[2]

- **Sizing Formula/Example**: Use `default_pool_size = 20` for base connections to PostgreSQL, with `reserve_pool_size = 5` for traffic spikes and `reserve_pool_timeout = 3` seconds. Set `max_client_conn = 500` for maximum client connections.[2]
- **Configuration Snippet** (from pgbouncer.ini, dated 2026-02-20):
  ```
  [pgbouncer]
  pool_mode = transaction
  default_pool_size = 20
  reserve_pool_size = 5
  ```
- **Monitoring**: Enable `log_connections = 1` and `log_disconnections = 1` for debugging; track pool usage metrics like exhaustion and idle timeouts (`server_idle_timeout = 300` seconds).[2]
- **Source**: https://oneuptime.com/blog/post/2026-02-20-database-connection-management/view[2]

## pgpool
No specific recent results (last 30 days from 2026-03-15) found for pgpool sizing formulas, monitoring techniques, or configurations. Searches returned general PostgreSQL pooling discussions but no pgpool-II details with numbers/dates. Refine query to "pgpool-II sizing formula 2026" for targeted results.

## Application-Level Pooling
Application-level pooling (e.g., HikariCP in Spring Boot 3.x, or Python/FastAPI pools) creates per-process pools, which total more connections than shared proxies like PgBouncer—e.g., 3 local pools average 23 connections vs. 14 for one shared pool at 20 RPS per process (~25ms query latency).[1][3]

- **Sizing Formulas**:
  - HikariCP: `maximum-pool-size = ((core_count * 2) + effective_spindle_count)` to avoid CPU contention.[1]
  - General: For 40 FastAPI workers, optimal shared pool size is 20 (3.7% throughput gain over no pooling, half the connections of 80).[4]
  - Multi-process: At 200 RPS total, single shared pool needs ~5 active connections; 3 local pools need 23 total.[3]
- **Monitoring Techniques**: Track pool usage, exhaustion alerts, connection leaks, timeouts; monitor used/idle connections over time (e.g., 5-min simulations show spikes).[2][3][4]
- **Performance Notes**: Shared pooling saves during restarts (reuses TLS/authenticated connections); local pools spike to 48 connections across processes at lower per-process load.[3]
- **Sources**:
  - HikariCP: https://dev.to/manojsatna31/master-hikaricp-in-spring-boot-3x-complete-guide-to-high-performance-database-connection-pooling-3i5n (2026)[1]
  - Local vs Shared: https://thomwright.co.uk/2026/02/21/local-vs-shared-pool/ (2026-02-21)[3]
  - FastAPI/Python: https://blogs.oracle.com/machinelearning/boosting-select-ai-for-python-concurrency-with-connection-pooling (recent)[4]

## Next Steps
- Deploy PgBouncer with the [2] config on a test cluster; simulate 20 RPS load using pgbench to validate pool_size=20 covers 95th percentile latency.
- For apps, audit HikariCP via `spring.datasource.hikari.maximum-pool-size` using the core_count formula on your hardware (e.g., 8-core: ~18).[1]
- Monitor with Prometheus exporter for PgBouncer (query "pgbouncer pools" docs) or Hikari metrics endpoint; alert on >80% utilization.
