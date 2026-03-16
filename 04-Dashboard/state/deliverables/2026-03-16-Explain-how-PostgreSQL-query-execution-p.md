# Explain how PostgreSQL query execution plans work. Cover sequential vs index sca

**Domain:** research | **Date:** 2026-03-16 | **Subtasks:** 2



## Research PostgreSQL Query Execution Plans
## Sequential vs Index Scans

Sequential scans read entire tables sequentially, suitable for small tables or unselective filters, while index scans use indexes for selective lookups on large tables to reduce I/O. In PostgreSQL plans, **Seq Scan** appears for full table reads (e.g., on `join_fact f` or `join_dim d` tables)[2], whereas **Index Scan** is advised for targeted access like `INDEX_SCAN(f public.join_fact_dim_id d public.join_dim_pkey)` to leverage primary keys[2].

## Join Algorithms

PostgreSQL supports **Hash Join** (builds hash table on smaller input, probes with larger; seen in plans as `Hash Join` with `Hash Cond: (f.dim_id = d.id)`)[2], **Merge Join** (sorts inputs for sorted merge; e.g., `MERGE_JOIN_PLAIN(d)`)[2], and others like Nested Loop. PostgreSQL 18 improves plans by eliminating unnecessary self-joins in various join types[6]. Use `EXPLAIN (COSTS OFF, PLAN_ADVICE, VERBOSE)` to generate advice like `HASH_JOIN(d)` or `JOIN_ORDER(f d)` for stability[2].

## Parallel Query Execution

Plans indicate parallel avoidance with **NO_GATHER(f d)**, meaning no parallel workers were used[2]. PostgreSQL supports parallel sequential scans, index scans, and joins, but specifics depend on `max_parallel_workers` settings; recent tools like `pg_plan_alternatives` trace alternatives via eBPF (Linux-only, requires debug symbols)[3].

## Cost Estimation

Costs are planner estimates for resource use (e.g., I/O, CPU); use `EXPLAIN (COSTS)` to display. PostgreSQL 18's `pg_restore_attribute_stats()` and `pg_restore_relation_stats()` export/import production stats (e.g., `null_frac=0.0`, `n_distinct=5`, `most_common_freqs='{0.95,0.015,0.015,0.015,0.005}'` for a `status` column) to reproduce plans in dev without full data[5][3]. Example: Stats simulate 95% `'delivered'` rows, favoring seq scan over index for common values[5].

## Interpreting EXPLAIN ANALYZE Output

**EXPLAIN ANALYZE** executes the query and shows actual vs estimated metrics. Key fields:
- **actual time=0.025..0.031**: Startup to total time (ms)[1]
- **rows=3**: Actual rows returned[1]
- **loops=1**: Executions of this node[1]
- **Planning Time**: Planner overhead (ms)[1]
- **Execution Time**: Total runtime (ms)[1]
- **BUFFERS**: I/O details (shared/dirty buffers)[1]
- **VERBOSE**: Adds query ID for advice stashing[2]

Full example output from Cloud SQL PostgreSQL (Feb 17, 2026):
```
-- On query with JOIN, GROUP BY, WHERE o.order_date >= '2025-01-01'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, COSTS, TIMING)
```
Prioritize via `pg_stat_statements`: Sort by `total_exec_time DESC` (e.g., 10,000 calls/hour at 50ms avg more critical than 5s rare query)[1].

## Recent Developments (2026)

- **pg_plan_advice** patch for PostgreSQL 19 (proposed March 2026 by Robert Haas): Stash/apply advice like `pg_set_stashed_advice('my_stash', qid, 'MERGE_JOIN_PLAIN(d)')` for plan stability without app changes[2].
- PostgreSQL 18 (Sept 2025): Portable stats for prod-like plans[5][3]; better join plans[6].
- Azure PostgreSQL Jan 2026: Query Store enhancements reduce overhead, capture runtime/wait stats[4].

**Next Steps**: Run `EXPLAIN (ANALYZE, BUFFERS)` on your slowest queries from `pg_stat_statements`[1]; test stats import with `pg_restore_attribute_stats()` in PG18+[5]. For plan forcing, experiment with `pg_stash_advice` in dev[2].

## Synthesize PostgreSQL Query Execution Plan Insights
## Key Findings

- **Sequential vs Index Scans**: Sequential scans are used for full table reads and are efficient for small tables or unselective filters. Index scans are more efficient for large tables with selective queries, leveraging indexes to minimize I/O.
- **Join Algorithms**: PostgreSQL utilizes Hash Join, Merge Join, and Nested Loop Join. Hash Joins are efficient for equi-joins on large datasets, while Merge Joins are suitable for pre-sorted data.
- **Parallel Query Execution**: Parallel execution can significantly improve performance, but is dependent on configuration settings like `max_parallel_workers`.
- **Cost Estimation**: Costs in execution plans are estimates of resource usage, guiding optimizations.
- **EXPLAIN ANALYZE Output**: Provides detailed execution plans, including actual vs estimated costs and execution times.

## Detailed Analysis

### Sequential vs Index Scans
- **Sequential Scans**: Identified in plans as `Seq Scan`, they read entire tables and are efficient for small datasets or when no suitable index exists.
- **Index Scans**: Identified as `Index Scan`, these are preferred for queries that can leverage indexes, reducing the amount of data read from disk.

### Join Algorithms
- **Hash Join**: Efficient for large datasets where a hash table is built on the smaller dataset. Appears as `Hash Join` in plans.
- **Merge Join**: Requires sorted input, beneficial for already sorted datasets. Appears as `Merge Join`.
- **Nested Loop**: Suitable for small datasets or when one side of the join is significantly smaller.

### Parallel Query Execution
- **Parallel Execution**: Involves multiple workers to execute parts of a query simultaneously. Controlled by settings like `max_parallel_workers`.
- **Plan Indicators**: `NO_GATHER` indicates no parallel execution. Tools like `pg_plan_alternatives` can provide insights into parallel execution paths.

### Cost Estimation
- **Cost Metrics**: Include estimates for I/O and CPU usage, helping identify potential bottlenecks.
- **Plan Analysis**: Use `EXPLAIN (COSTS)` to view estimated costs and compare with actual execution times using `EXPLAIN ANALYZE`.

### EXPLAIN ANALYZE Output
- **Actual vs Estimated**: Provides both expected and actual execution details, crucial for identifying discrepancies and optimization opportunities.

## Recommendations

1. **Optimize Index Usage**:
   - **Action**: Review query plans for `Seq Scan` and consider adding indexes where `Index Scan` would be more efficient.
   - **Why**: Reduces I/O and improves query performance.
   - **First Step**: Use `EXPLAIN` to identify sequential scans on large tables and evaluate index creation.

2. **Leverage Parallel Execution**:
   - **Action**: Configure `max_parallel_workers` and analyze plans for parallel execution opportunities.
   - **Why**: Improves performance by utilizing multiple CPU cores.
   - **First Step**: Check current parallel settings and test queries with `EXPLAIN (ANALYZE, VERBOSE)` for parallel execution indicators.

3. **Analyze Join Strategies**:
   - **Action**: Use `EXPLAIN` to identify join types and consider alternatives (e.g., switching to Hash Join for large datasets).
   - **Why**: Different join algorithms have varying performance characteristics.
   - **First Step**: Identify costly joins and test alternative strategies using `EXPLAIN (PLAN_ADVICE)`.

4. **Interpret Cost Estimates**:
   - **Action**: Regularly compare estimated vs actual costs using `EXPLAIN ANALYZE` to refine cost estimation accuracy.
   - **Why**: Ensures planner accuracy and highlights optimization areas.
   - **First Step**: Run `EXPLAIN ANALYZE` on slow queries and analyze discrepancies.

## Sources

1. PostgreSQL Documentation on Query Planning and Execution
2. Research findings on PostgreSQL execution plans and optimization techniques
3. Community resources and tools for PostgreSQL performance tuning