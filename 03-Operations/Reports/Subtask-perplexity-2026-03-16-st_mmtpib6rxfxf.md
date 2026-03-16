# Subtask Output — Research database connection pooling
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Pool Sizing
Database connection pools are sized to balance application demand against database capacity, typically multiplexing many client connections through fewer database connections. For PgBouncer with Cloud SQL, use `default_pool_size = 25`, `min_pool_size = 5`, and `reserve_pool_size = 5` to handle bursts while keeping the database healthy; for 200 application connections, multiplex through 30 actual database connections.[2][1] HikariCP in Spring Boot 3.x recommends `maximum-pool-size` via formula `connections = ((core_count * 2) + effective_spindle_count)` to avoid CPU context switching from oversized pools.[3]

**Next steps**: Calculate your core_count (e.g., 8 cores → ~20 connections), test with load like 1000 clients, monitor `cl_waiting` in PgBouncer.[1][2]

## Connection Lifecycle
Connections follow a borrow-use-return cycle: application requests a connection, pool lends an idle one, query executes, connection returns to pool. In PgBouncer, `server_idle_timeout = 300` (5 minutes) closes idle connections; `server_connect_timeout = 5` limits new connection attempts.[2] HikariCP reuses connections to skip expensive handshakes/authentication, with lifecycle managed by try-with-resources or `@Transactional`.[3] PgBouncer modes control return timing: transaction mode (recommended, returns post-transaction), session mode (dedicated per session), statement mode (post-statement, for simple CRUD).[1]

**Next steps**: Deploy PgBouncer config with `pool_mode = transaction` and `server_reset_query = DISCARD ALL` for clean returns.[1][2]

## Prepared Statement Caching
Session mode in PgBouncer supports prepared statements by dedicating connections, but transaction/statement modes may break them unless using server-side caching; use session mode only for temp tables/SET commands.[1] HikariCP implicitly benefits from JDBC driver caching but lacks explicit config details here; avoid leaks with proper lifecycle management.[3]

**Next steps**: Test compatibility—start transaction mode (90% apps work), switch to session if prepared statements fail.[1]

## Health Checks
PgBouncer uses `server_check_delay = 10` (seconds), `server_check_query = SELECT 1`, and `server_reset_query_always = 1` to validate connections pre-use and reset on return.[2] Cloud SQL Proxy sets `--max-connections=100` and `--max-sigterm-delay=30s` for draining during failovers.[2] Monitor active connections (e.g., 83 causing P95 latency spike to 847ms) and `cl_waiting` for exhaustion.[1][5]

**Next steps**: Add `log_connections = 1` and `log_pooler_errors = 1` to PgBouncer; alert on `cl_waiting > 0`.[1][2]

## Common Pitfalls in Serverless Environments
Serverless (e.g., GKE pods) risks pool exhaustion from cold starts/spikes, leading to queues/failures; mitigate with PgBouncer sidecar or Cloud SQL Proxy for reconnections.[2][5] Oversized pools degrade performance via context switching; set `max-lifetime` < DB `wait_timeout`.[3] No explicit serverless pitfalls in results, but proxy layers like ProxySQL distribute load across ports/instances.[4] Restart DB (e.g., PostgreSQL Flexible Server) flushes stale connections in exhaustion cases.[5]

**Next steps**: Deploy PgBouncer on GKE with `dns_max_ttl = 15` for failover; use Ansible playbooks for consistent setup.[1][2]

## Key Sources
- **PgBouncer/ProxySQL Production Config (2026-02-21)**: Ansible guide, transaction mode, sizing examples. Source: https://oneuptime.com/blog/post/2026-02-21-ansible-configure-database-connection-pooling/view[1]
- **Cloud SQL PgBouncer Failover (2026-02-17)**: Exact ini settings, health checks. Source: https://oneuptime.com/blog/post/2026-02-17-how-to-implement-connection-draining-and-failover-strategies-for-cloud-sql-high-availability/view[2]
- **HikariCP Spring Boot 3.x (recent)**: Pool formula, lifecycle pitfalls. Source: https://dev.to/manojsatna31/master-hikaricp-in-spring-boot-3x-complete-guide-to-high-performance-database-connection-pooling-3i5n[3]
- **Scaling Example (2026-03-06)**: PgBouncer in high-load like Instagram. Source: https://www.tencentcloud.com/techpedia/142103[4]
- **Pool Exhaustion (recent)**: Metrics, remediation. Source: https://techcommunity.microsoft.com/blog/appsonazureblog/agent-hooks-production-grade-governance-for-azure-sre-agent-agent/4500292[5]
