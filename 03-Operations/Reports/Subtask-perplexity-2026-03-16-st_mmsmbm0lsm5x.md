# Subtask Output — Research Time Series Databases
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Data Model Differences

- **InfluxDB**: Uses a schemaless model with **measurements** (like tables), **tags** (indexed key-value pairs for metadata), and **fields** (non-indexed values); tags are indexed for fast filtering while fields are not, impacting query performance.[1][4]
- **TimescaleDB**: Extends PostgreSQL with **hypertables** for automatic time-based partitioning and native compression; supports standard relational schemas with composite indexes on query dimensions; a February 2026 production case study showed 88.6% storage reduction (220GB to 25GB) via compression.[1][2]
- **Prometheus**: Employs a **pull-based model** storing time-series as metric names with labels (key-value pairs); optimized for monitoring with native histograms (stable in v3.8.0, released 2025-11-28); focuses on short-term data with ~72-hour default query limit in InfluxDB 3 Core comparison context.[4][6]

## Query Languages

- **InfluxDB**: Uses **InfluxQL** (SQL-like for v1/v2) or **Flux** (functional scripting); InfluxDB 3 Core (GA 2026) leverages Apache Arrow/DataFusion for vectorized queries on Parquet storage.[1][4]
- **TimescaleDB**: Full **SQL** compatibility via PostgreSQL extension (supports v18 in 2.23.0, released October 29, 2025); includes continuous aggregates, hypertable partitioning, and Bloom filters for millisecond queries on billion-row datasets.[2][4]
- **Prometheus**: **PromQL** (Prometheus Query Language) for aggregations like `rate(http_requests_total[5m])` or `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))`; pulls metrics via /metrics endpoints.[6]

## Scaling Characteristics

| Database    | Ingestion Throughput                  | Storage/Compression                  | Query Performance                     | Notes/Source |
|-------------|---------------------------------------|--------------------------------------|---------------------------------------|-------------|
| **InfluxDB** | 320K rows/sec (InfluxDB 3 Core benchmarks); high-throughput for metrics.[4] | Columnar Parquet; unlimited cardinality in v3.[4] | 17-418x slower than QuestDB in benchmarks.[4] | Native k6 integration; Cloud managed option.[1] |
| **TimescaleDB** | 5,000-10,000 points/sec (Waterbridge IoT); millions/sec (CERN).[2][4] | 84-97% compression; 30%+ savings with UUIDv7 (v2.23.0).[2][4] | 2x faster queries with compression; partition pruning.[1][2] | Hypertables auto-scale; self-hosted or Tiger Cloud.[2] |
| **Prometheus** | Pull-based scraping; 77% CNCF adoption (2026 survey).[6] | Short-term focus; stable native histograms (v3.8.0).[4][6] | PromQL for real-time rates/alerts; Kubernetes-native.[6] | Not for long-term; pair with Thanos/Cortex for scaling.[6] |

**Next Steps**: Benchmark your workload—run InfluxDB 3 Core vs TimescaleDB 2.23.0 ingestion tests using k6 (native InfluxDB support) on a 10GB dataset; check DB-Engines trends for popularity (e.g., time-series DBMS ranking).[1][4][7] For production, evaluate TimescaleDB compression on your metrics volume per the 220GB→25GB case.[1]
