# Teach me about time series databases. Compare InfluxDB, TimescaleDB, and Prometh

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Time Series Databases
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

## Synthesize Database Comparison Report
## Explanation

Understanding the differences between InfluxDB, TimescaleDB, and Prometheus is crucial for selecting the right time-series database for your needs. Each database has unique strengths and is optimized for specific use cases.

### Data Model Differences

- **InfluxDB**: 
  - **Model**: Schemaless with measurements, tags, and fields.
  - **Strengths**: Fast filtering with indexed tags; ideal for scenarios where metadata indexing is crucial.
  - **Consideration**: Non-indexed fields can impact query performance.
  
- **TimescaleDB**: 
  - **Model**: Extends PostgreSQL with hypertables and compression.
  - **Strengths**: Supports complex queries with SQL, efficient storage with compression (up to 88.6% reduction).
  - **Consideration**: Best for users familiar with SQL and needing relational database features.

- **Prometheus**: 
  - **Model**: Pull-based with metrics and labels.
  - **Strengths**: Optimized for monitoring and short-term data storage.
  - **Consideration**: Limited to short-term data with a default query limit of ~72 hours.

### Query Languages

- **InfluxDB**: 
  - **Languages**: InfluxQL and Flux.
  - **Strengths**: Functional scripting with Flux; vectorized queries in InfluxDB 3 Core.
  
- **TimescaleDB**: 
  - **Language**: Full SQL compatibility.
  - **Strengths**: Supports advanced SQL features like continuous aggregates and hypertable partitioning.

- **Prometheus**: 
  - **Language**: PromQL.
  - **Strengths**: Tailored for monitoring metrics with efficient aggregation functions.

## Examples

- **InfluxDB**: Use for IoT applications where metadata filtering is critical, leveraging tags for efficient queries.
- **TimescaleDB**: Ideal for financial applications requiring complex SQL queries and efficient storage.
- **Prometheus**: Best for real-time system monitoring, providing immediate insights with PromQL.

## Practice Questions

1. How does the data model of InfluxDB affect its performance in high-cardinality scenarios?
2. What are the advantages of using TimescaleDB's hypertables for time-series data?
3. How does Prometheus' pull-based model benefit system monitoring?

## Further Reading

1. [InfluxDB Documentation](https://docs.influxdata.com/)
2. [TimescaleDB Documentation](https://docs.timescale.com/)
3. [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)

## Next Steps

1. **Evaluate Use Case**: Determine your specific needs (e.g., monitoring, complex queries, storage efficiency).
2. **Prototype**: Set up a small-scale implementation of each database to test performance and suitability.
3. **Monitor and Adjust**: Use real-world data to assess performance, adjusting configurations as needed.

By understanding these differences, you can make an informed decision that aligns with your project's requirements and goals.