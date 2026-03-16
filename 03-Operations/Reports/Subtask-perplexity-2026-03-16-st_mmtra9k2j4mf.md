# Subtask Output — Research PostgreSQL Query Execution Plans
## Model: sonar
## Stage: research
## Date: 2026-03-16

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
