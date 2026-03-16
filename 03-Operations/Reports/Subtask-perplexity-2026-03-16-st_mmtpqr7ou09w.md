# Subtask Output — Research PostgreSQL Monitoring Best Practices
## Model: sonar
## Stage: research
## Date: 2026-03-16

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
