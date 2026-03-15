# Write a technical architecture decision record (ADR) for choosing PostgreSQL ove

**Domain:** writing | **Date:** 2026-03-15 | **Subtasks:** 2



## Research PostgreSQL vs MongoDB for Real-Time Ranking
## PostgreSQL Advantages for Real-Time Ranking Systems
PostgreSQL excels in complex queries and mixed workloads critical for ranking (e.g., joins, aggregations, window functions), with extensions like pgvector enabling vector similarity search for AI-driven rankings. TimescaleDB 2.23.0 (released before March 2026) delivers 30%+ storage savings and 2x faster queries on time-series data via UUIDv7 compression, supporting real-time metric ingestion at millions per second (e.g., CERN use case).[3][6]  
- **Superior analytics**: Handles multi-table queries with parallel execution, hash/merge joins; outperforms MongoDB in cross-document analytics.[1]  
- **Vector search**: pgvector (PostgreSQL 18 native) with HNSW/IVFFlat indexes; pgvectorscale achieves 28× lower p95 latency on 10M-vector benchmarks vs. vanilla pgvector.[3][4]  
- **JSONB support**: GIN-indexed binary JSON acts as a document store inside relational DB, ideal for flexible ranking data.[2]  
Source: https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-vs-mongodb-the-definitive-database-comparison-1fan[1]; https://devnewsletter.com/p/state-of-databases-2026/[3]; https://www.tigerdata.com/learn/time-series-database-what-it-is-how-it-works-and-when-you-need-one[6]

## PostgreSQL Disadvantages for Real-Time Ranking Systems
MVCC creates dead tuples requiring autovacuum, adding operational overhead that impacts high-concurrency writes; process model limits massive write throughput vs. MongoDB's document-level locking.[1][2] At billions of rows (e.g., 850M rows/day from 1,000 servers), vacuum and index maintenance degrade insert throughput and query latency without TimescaleDB extensions.[6]  
Source: https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-vs-mongodb-the-definitive-database-comparison-1fan[1]; https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-vs-sqlite-choosing-the-right-database-for-your-project-2pf1[2]; https://www.tigerdata.com/learn/time-series-database-what-it-is-how-it-works-and-when-you-need-one[6]

## MongoDB Advantages for Real-Time Ranking Systems
MongoDB 8.0 (late 2024) offers 36% better read throughput, 56% faster bulk writes, and ~200% faster time-series aggregations; 8.1 adds aggregation/security gains and self-managed vector search (no longer Atlas-only).[3] Single I/O fetches entire documents, minimizing latency for read-heavy ranking fetches without joins.[1]  
- **High-concurrency writes**: Document-level locking supports massive throughput for real-time updates.[1]  
- **Vector search integration**: Atlas Vector Search for AI "memory," suitable for light workloads in ecosystems.[3][4]  
Source: https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-vs-mongodb-the-definitive-database-comparison-1fan[1]; https://devnewsletter.com/p/state-of-databases-2026/[3]; https://www.shakudo.io/blog/top-9-vector-databases[4]

## MongoDB Disadvantages for Real-Time Ranking Systems
Lags in high-scale vector workloads (accuracy/flexibility behind dedicated VectorDBs); general-purpose storage hurts dense vector indexing efficiency for ranking similarity searches.[4] Less mature for complex analytics/joins vs. PostgreSQL; time-series collections newer and outperformed by TimescaleDB.[1][3] Costly for large datasets via Atlas managed services.[4]  
Source: https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-vs-mongodb-the-definitive-database-comparison-1fan[1]; https://devnewsletter.com/p/state-of-databases-2026/[3]; https://www.shakudo.io/blog/top-9-vector-databases[4]

## Comparison Table: PostgreSQL vs. MongoDB for Real-Time Ranking Workloads (2026 Data)

| Workload Type              | PostgreSQL Winner Scenarios                  | MongoDB Winner Scenarios                  | Key Metric/Note                          |
|----------------------------|----------------------------------------------|-------------------------------------------|------------------------------------------|
| Complex Ranking Analytics | Joins, CTEs, window functions; parallel query| N/A                                      | PostgreSQL superior per 2026 benchmarks[1]|
| Document Reads (Ranking Fetch) | N/A                                        | Single I/O, no joins                     | Lowest latency for read-heavy[1]        |
| Vector Similarity Ranking | pgvector HNSW: 28× lower p95 latency (10M vecs)| Light workloads; self-managed now        | TimescaleDB/pgvector > MongoDB accuracy[3][4]|
| High-Concurrency Updates  | MVCC but vacuum overhead                    | Document locking, 56% faster bulk writes | MongoDB for massive writes[1][3]        |
| Time-Series Ranking       | TimescaleDB: 2x faster queries, 30% savings | ~200% faster aggregations (Mongo 8.0)    | PostgreSQL extensions more mature[3][6] |

No direct 2026 benchmarks for pure "real-time ranking systems" found; data synthesized from analytics, vector, and time-series workloads relevant to leaderboards/scoring. For custom benchmarks, test pgvector vs. MongoD

## Synthesize ADR Document
## Key Findings

1. **Superior Query Capabilities**: PostgreSQL's ability to handle complex queries, such as multi-table joins and aggregations, makes it ideal for real-time ranking systems that require sophisticated analytics and data processing. The use of extensions like pgvector enhances its capabilities for AI-driven rankings.

2. **Efficient Time-Series Data Handling**: With TimescaleDB 2.23.0, PostgreSQL offers significant storage savings and faster query performance for time-series data, which is crucial for real-time metric ingestion.

3. **JSONB Support**: PostgreSQL's JSONB capabilities allow for flexible data storage and retrieval, similar to a document store, which can be advantageous for managing dynamic ranking data.

4. **Operational Overhead**: The use of MVCC (Multi-Version Concurrency Control) in PostgreSQL can lead to operational overhead due to the need for autovacuuming, which might impact high-concurrency write operations.

## Detailed Analysis

### Context
The decision to choose PostgreSQL over MongoDB for a real-time ranking system is influenced by the need for complex query processing, efficient handling of time-series data, and flexibility in data storage. The system must support high-throughput data ingestion and provide fast, accurate ranking results.

### Decision Rationale
- **Complex Query Handling**: PostgreSQL's advanced query capabilities, including parallel execution and support for complex joins and aggregations, make it more suitable for systems requiring detailed analytics and data manipulation.
- **AI-Driven Features**: The pgvector extension provides efficient vector similarity search, enhancing PostgreSQL's ability to support AI-driven ranking algorithms.
- **Time-Series Optimization**: TimescaleDB's enhancements improve PostgreSQL's performance for time-series data, crucial for real-time systems that process large volumes of temporal data.
- **Flexibility with JSONB**: The ability to store and index JSONB data allows PostgreSQL to manage semi-structured data efficiently, providing flexibility similar to MongoDB's document model.

### Consequences
- **Performance**: PostgreSQL will likely provide better performance for complex queries and AI-driven ranking tasks, but may require careful management of autovacuum processes to maintain write performance.
- **Scalability**: While PostgreSQL handles complex queries well, MongoDB might offer better scalability for simple, high-volume write operations due to its document-level locking mechanism.

### Alternatives Considered
- **MongoDB**: Considered for its document-oriented model and high write throughput, but lacks the advanced query capabilities and AI-driven features of PostgreSQL.
- **Hybrid Approach**: Combining both databases to leverage PostgreSQL's query capabilities and MongoDB's write throughput was considered, but complexity and integration overhead were deterrents.

## Recommended Actions

1. **Implement PostgreSQL with TimescaleDB**: Utilize PostgreSQL with TimescaleDB for its superior query capabilities and time-series optimizations. This setup will enhance the system's ability to handle complex ranking algorithms and real-time data ingestion.
   - **First Step**: Set up a PostgreSQL instance with TimescaleDB and pgvector extensions to test query performance and storage efficiency.

2. **Optimize Autovacuum Settings**: To mitigate the operational overhead of MVCC, configure autovacuum settings to balance performance with maintenance needs.
   - **First Step**: Analyze write patterns and adjust autovacuum thresholds and frequency to minimize impact on system performance.

3. **Leverage JSONB for Flexibility**: Use PostgreSQL's JSONB support to manage semi-structured ranking data efficiently, providing the flexibility needed for dynamic data models.
   - **First Step**: Design data models that utilize JSONB for parts of the ranking data that require flexibility and rapid schema evolution.

4. **Monitor and Adjust System Performance**: Continuously monitor system performance, particularly during peak loads, to ensure that PostgreSQL meets the real-time requirements.
   - **First Step**: Implement monitoring tools to track query performance, latency, and system resource utilization, adjusting configurations as necessary.