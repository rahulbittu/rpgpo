# Design a comprehensive monitoring and alerting strategy for a PostgreSQL databas

**Domain:** health | **Date:** 2026-03-16 | **Subtasks:** 2



## Research PostgreSQL Monitoring Best Practices
## WAL Lag Monitoring
Monitor **WAL lag** using replication slots to prevent disk exhaustion from unprocessed WAL files. Key query from primary: `SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn, pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_lag_bytes FROM pg_stat_replication;`. Alert if lag exceeds **10 seconds for 5 minutes** via Google Cloud Monitoring: `gcloud monitoring policies create --display-name="PG Replica Lag Alert" --condition-filter='resource.type="cloudsql_database" AND metric.type="cloudsql.googleapis.com/database/replication/replica_lag"' --condition-threshold-value=10 --condition-threshold-duration=300s --notification-channels=projects/my-project/notificationChannels/12345`.[3]

- Track `pg_replication_slots` and WAL size immediately for Debezium CDC; use `max_slot_wal_keep_size` (PostgreSQL 13+) as safeguard, but monitor to avoid slot invalidation.[5]
- Azure metrics: **Max Logical Replication Lag** (`logical_replication_delay_in_bytes`, bytes); **Max Physical Replication Lag** (`physical_replication_delay_in_bytes`, bytes); **Read Replica Lag** (`physical_replication_delay_in_seconds`, seconds).[7]
- Netdata metrics: `postgres.replication_app_wal_lag_size` (sent_lag, write_lag, flush_lag, replay_lag in bytes); `postgres.replication_app_wal_lag_time` (write_lag, flush_lag, replay_lag in seconds).[6]
- Standby recovery rate: **40 MB/s** typically, up to **200 MB/s** for larger versions; exceeding causes extended failover.[2]
- Best practice: Proactively drop unused slots to avoid indefinite WAL retention leading to outages.[4]

## Connection Pool Health
Set `max_replication_slots` and `max_wal_senders` to **21** in Azure for HA (4 for HA + replicas/slots).[2] Monitor replication status continuously; growing lag indicates stale data on replicas.[3]

- Replica sizing: Ensure CPU for WAL replay (single-threaded) + reads, memory for buffers/queries, SSD for I/O, sufficient network bandwidth.[3]
- Use private IP for replicas to avoid public internet routing.[3]

## Query Performance Tracking
Use Netdata for per-database/table/index stats: execution counts, timing, I/O, resource use. Identify slow queries by total time, high shared block reads (I/O optimization), temp block usage (memory tuning).[6]

- Key metrics: `postgres_db_transactions_rollback_ratio` (aborted tx % over 5min); `postgres_db_deadlocks_rate` (deadlocks/min); `postgres_table_cache_io_ratio` (cache hit ratio/min).[6]
- pg_stat_monitor extension: Track by application, error patterns.[6]

## Alerting System Integration
Integrate with Google Cloud Monitoring for replica lag alerts as shown above.[3] Azure HA health status monitoring provides real-time primary/standby insights (degraded performance, network blocking) with alerts on status changes.[2]

- Avoid long-running transactions to prevent WAL buildup; use multiple streams per table set to isolate high-volume tables and prevent head-of-line blocking.[4]

## Additional Best Practices
- Monitor slots continuously; retain WAL until consumer confirms (risk: disk fill if consumer lags).[1]
- Test replica failover regularly in staging.[3]
- For CDC (Striim/Debezium/Datastream): WAL-based logical decoding for low-impact capture; heartbeat messages for freshness.[1][4]

Sources:  
[1] https://www.striim.com/blog/change-data-capture-postgres-real-time-integration-guide/  
[2] https://learn.microsoft.com/en-us/azure/reliability/reliability-azure-database-postgresql  
[3] https://oneuptime.com/blog/post/2026-02-17-how-to-create-and-manage-read-replicas-in-cloud-sql-for-postgresql/view  
[4] https://docs.cloud.google.com/datastream/docs/sources-postgresql  
[5] https://streamkap.com/resources-and-guides/self-managed-debezium-pain-points  
[6] https://learn.netdata.cloud/docs/collecting-metrics/databases/postgresql  
[7] https://docs.azure.cn/en-us/postgresql/monitor/concepts-monitoring

## Synthesize Monitoring Strategy Document
## Plan

### Week 1: Establish Monitoring Infrastructure
- **Set up Google Cloud Monitoring**: Integrate PostgreSQL metrics with Google Cloud Monitoring to track WAL lag and other key metrics.
  - **Action**: Use the provided command to create a policy for WAL lag alerts.
  - **Outcome**: Immediate alerts if WAL lag exceeds 10 seconds for 5 minutes.
- **Configure Replication Slot Monitoring**: Monitor `pg_replication_slots` and WAL size.
  - **Action**: Implement scripts to regularly check `pg_replication_slots` and set `max_slot_wal_keep_size` to prevent slot invalidation.
  - **Outcome**: Prevent disk exhaustion and ensure replication slots remain valid.

### Week 2: Implement Query Performance Tracking
- **Set up Query Performance Monitoring**: Use PostgreSQL's `pg_stat_statements` to track query performance.
  - **Action**: Enable the `pg_stat_statements` extension and configure it to log slow queries.
  - **Outcome**: Identify and optimize slow-running queries to improve database performance.
- **Integrate with Netdata**: Use Netdata for real-time monitoring of query performance.
  - **Action**: Configure Netdata to track `postgres.replication_app_wal_lag_size` and `postgres.replication_app_wal_lag_time`.
  - **Outcome**: Gain insights into query execution times and replication lag.

### Week 3: Monitor Connection Pool Health
- **Connection Pool Monitoring**: Track connection pool metrics to ensure optimal performance.
  - **Action**: Use tools like `pgbouncer` or `pgpool` to manage and monitor connection pools.
  - **Outcome**: Maintain efficient connection management and prevent overloading the database.
- **Alert Configuration**: Set up alerts for connection pool saturation.
  - **Action**: Define thresholds for connection pool usage and configure alerts in Google Cloud Monitoring.
  - **Outcome**: Receive alerts when connection pool usage approaches critical levels.

### Week 4: Integrate with PagerDuty
- **PagerDuty Integration**: Ensure all critical alerts are integrated with PagerDuty for immediate response.
  - **Action**: Configure Google Cloud Monitoring to send alerts to PagerDuty notification channels.
  - **Outcome**: Quick response to critical issues, minimizing downtime and impact.

## Evidence Basis

- **WAL Lag Monitoring**: Critical for preventing disk exhaustion and ensuring replication health. Alerts configured via Google Cloud Monitoring (source [3]).
- **Replication Slot Monitoring**: Essential for maintaining data consistency and preventing slot invalidation (source [5]).
- **Query Performance Tracking**: Using `pg_stat_statements` and Netdata helps identify performance bottlenecks (source [6]).
- **Connection Pool Health**: Managing connections efficiently prevents database overloads and maintains performance.
- **PagerDuty Integration**: Ensures timely response to critical alerts, reducing downtime.

## Progression

- **Initial Setup**: Focus on establishing a robust monitoring infrastructure.
- **Performance Optimization**: Use insights from monitoring to optimize database performance.
- **Alert Responsiveness**: Ensure alerts are actionable and lead to quick resolutions.

## Safety Notes

- **Replication Slot Configuration**: Incorrect settings can lead to data loss. Carefully monitor and adjust `max_slot_wal_keep_size`.
- **Alert Thresholds**: Set realistic thresholds to avoid alert fatigue and ensure meaningful notifications.
- **Integration Testing**: Test all integrations with PagerDuty to ensure alerts are received and actionable.