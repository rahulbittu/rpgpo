# Subtask Output — Research Monitoring Tools
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: Prometheus + Grafana + cAdvisor for Linux Containerized Database Monitoring
Prometheus scrapes metrics from Linux exporters like node_exporter (system CPU, memory, disk I/O) and mysqld_exporter/postgres_exporter (database-specific queries/sec, connections, buffer cache hit ratio); cAdvisor provides per-container CPU/memory/network/disk for Dockerized databases like MySQL/PostgreSQL on Linux. Use to monitor performance by setting alerts on >80% CPU or <95% cache hit ratio, improving throughput via Grafana dashboards showing query latency trends—benchmarks show 20-50% IOPS gains on SSDs by identifying I/O bottlenecks.[2]

Source: https://www.dash0.com/comparisons/best-docker-monitoring-tools

## Finding 2: Netdata for Real-Time Linux System and Database Metrics
Netdata auto-discovers Linux processes/containers via cgroups, collecting per-second metrics like database I/O wait times, swap usage, and PostgreSQL/MySQL locks; install with `wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh && sh /tmp/netdata-kickstart.sh` on Ubuntu/Debian. Improves performance by alerting on high vm.swappiness-induced stalls or dirty page writeback latency, with dashboards pinpointing top slow queries—zero-config setup monitors 1000s of metrics/node.[2][4]

Source: https://www.dash0.com/comparisons/best-docker-monitoring-tools  
Source: https://uptrace.dev/tools/network-monitoring-tools

## Finding 3: Zabbix for Database Server Infrastructure Monitoring
Zabbix deploys Linux agents to monitor MySQL/PostgreSQL/Oracle servers via SQL queries (e.g., active connections, replication lag, InnoDB buffer pool usage), SNMP for network/disk, and triggers for >90% disk utilization. Supports distributed proxies for remote Linux hosts; recent 7.2.x update adds NVIDIA GPU monitoring and VMware integration for DB VMs—use low-level discovery to auto-add tables/indexes, reducing query latency by 15-30% via trend-based alerts.[1][4][5]

Source: https://www.knowledgehut.com/blog/devops/monitoring-tools-in-devops  
Source: https://uptrace.dev/tools/network-monitoring-tools  
Source: https://www.comparitech.com/net-admin/open-source-network-monitoring-tools/

## Finding 4: Sensu for Linux Server and Application Monitoring
Sensu runs on Linux with checks for HTTP/TCP connectivity to database ports, log parsing for slow query errors, and process monitoring (e.g., mysqld daemon uptime); integrates with PostgreSQL via custom plugins for WAL I/O rates. Detects issues pre-impact via event handlers alerting to PagerDuty/Slack, improving performance by correlating kernel metrics (e.g., vm.dirty_ratio stalls) with DB load—scales to 10,000s of Linux nodes.[1]

Source: https://www.knowledgehut.com/blog/devops/monitoring-tools-in-devops

## Finding 5: dbForge Edge Session Manager for Real-Time Database Performance
dbForge Edge's Session Manager monitors live SQL Server/MySQL/MariaDB/Oracle/PostgreSQL processes on Linux via ODBC/JDBC, showing query execution time, CPU/memory per session, and blocking locks; kill problematic queries directly. Improves performance by identifying top resource hogs (e.g., unindexed joins causing 500ms+ latency), with schema sync for rapid fixes—supports task automation for nightly checks.[3]

Source: https://www.devart.com/dbforge/best-sql-ides.html

No results found for Linux-specific kernel-integrated DB monitoring tools (e.g., perf + eBPF for MySQL traces) in last 30 days; refine to "eBPF database monitoring Linux 2026". VictoriaMetrics recommended as Prometheus drop-in for high-volume DB time-series at scale.[2]
