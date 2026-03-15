# Subtask Output — Research PostgreSQL MVCC
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## PostgreSQL MVCC Overview
PostgreSQL uses **Multi-Version Concurrency Control (MVCC)** to manage concurrency by maintaining multiple versions of data rows, allowing readers to access committed versions without blocking writers.[1] Each row includes metadata like transaction IDs (xmin for creation, xmax for deletion/update) to enforce visibility rules: a row version is visible to a transaction if created by a prior committed transaction and not deleted/modified within the transaction's visibility scope.[1]

## Transaction Isolation Levels
PostgreSQL supports standard SQL isolation levels with MVCC snapshots:
- **Read Committed**: Sees changes committed after transaction start on subsequent reads (e.g., Transaction A sees "Y" after Transaction B commits update from "X").[1]
- **Repeatable Read/Snapshot Isolation**: Provides a consistent snapshot from transaction start, ignoring later commits (e.g., Transaction A continues seeing "X").[1]
PostgreSQL 18 (released 2025) enhances this with async I/O support, but MVCC visibility logic remains unchanged.[2][5]

## Dead Tuples and Bloat
Updates/deletes in MVCC create **dead tuples**—non-visible row versions that persist on disk, causing **bloat** (unreclaimed space in tables/indexes).[6] For example, Apache Cloudberry (using PostgreSQL MVCC) shows bloat via queries like `SELECT * FROM gp_toolkit.gp_bloat_expected_pages`, reporting expected vs. actual pages (e.g., relpages=1, exppages=1 for small tables).[6] Benchmarks attribute PostgreSQL's write performance edge (e.g., 21,338 single-row INSERTs/sec vs. MySQL's 4,383 on Ubuntu 24.04, Jan 2026) partly to MVCC handling.[3]

## Vacuum Processes
**VACUUM** reclaims space from dead tuples by marking pages as reusable and updating visibility info, essential during write-heavy ops like bulk inserts.[5][6] It can stall if `vm.dirty_background_ratio` is high (default risks I/O bursts in PostgreSQL 18).[5] In Cloudberry, compacting triggers at 10% threshold per segment via `fillfactor` parameter.[6] PostgreSQL's shared buffers handle MVCC visibility atop Linux page cache; direct I/O in v18 doesn't alter this by default.[5]

## Key Benchmarks and Recent Context (2024-2026)
| Metric | PostgreSQL 18.1 | MySQL 9.5 | Test Date | Hardware |
|--------|-----------------|-----------|-----------|----------|
| Single-row INSERT QPS | 21,338 | 4,383 | Jan 2026 | AMD Ryzen 7 PRO 7840U, 32GB RAM, Ubuntu 24.04[3] |
| Batch INSERT (100 rows, items) QPS | 211 | 200 | Jan 2026 | Same as above[3] |

PostgreSQL holds 55.6% usage in Stack Overflow 2025 Survey; TimescaleDB 2.23.0 (Oct 29, 2025) adds pgvectorscale with 28x lower p95 latency on 10M vectors vs. pgvector.[2]

**Sources**:
- [1] https://www.tencentcloud.com/techpedia/141807 (Mar 6, 2026)
- [2] https://devnewsletter.com/p/state-of-databases-2026/
- [3] https://commandlinux.com/statistics/database-performance-statistics-on-linux-mysql-postgresql-benchmark-data/
- [5] https://www.sqlpassion.at/archive/2026/02/17/the-linux-page-cache-and-postgresql/ (Feb 17, 2026)
- [6] https://cloudberry.apache.org/docs/next/tutorials/best-practices/manage-bloat/
