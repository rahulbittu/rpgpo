# Subtask Output — Research PostgreSQL Query Optimization Techniques
## Model: sonar
## Stage: research
## Date: 2026-03-16

## EXPLAIN Plans
EXPLAIN (ANALYZE, BUFFERS) reveals actual execution times, row estimates vs. actuals, and cache hits/misses to identify bottlenecks like sequential scans on large tables or disk-based sorts.[1][2]  
- Run `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, COSTS, TIMING)` on queries like `SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_date >= '2025-01-01' GROUP BY c.name ORDER BY total_spent DESC LIMIT 20;` to spot high "actual time" nodes, sequential scans (Seq Scan), buffer reads indicating cache misses, or external merge sorts.[2]  
- Warning signs: Sequential scans on large tables, large estimated vs. actual row differences (run ANALYZE), high buffer reads (tune shared_buffers), disk sorts (increase work_mem).[1][2]  
- Use pg_stat_statements extension: `SELECT calls, total_exec_time, mean_exec_time, query FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;` to prioritize queries by total time (e.g., a 50ms avg query run 10,000x/hour).[1][2]  
Source: https://oneuptime.com/blog/post/2026-02-20-postgresql-performance-tuning/view [1]; https://oneuptime.com/blog/post/2026-02-17-how-to-analyze-query-plans-in-cloud-sql-postgresql-using-explain-analyze/view [2]; https://www.postgresql.org/docs/current/performance-tips.html [4]

## Index Strategies
Create indexes on join columns (e.g., user_id) or filter columns to eliminate sequential scans; check EXPLAIN for missing indexes on large tables.[1][2]  
- Workflow: After EXPLAIN ANALYZE shows Seq Scan, add index like `CREATE INDEX ON orders(user_id);` then re-run to confirm Index Scan usage.[2]  
- For sorts, index to match ORDER BY (e.g., on created_at) to avoid disk sorts; monitor buffer stats for cold cache issues.[1]  
Source: https://oneuptime.com/blog/post/2026-02-20-postgresql-performance-tuning/view [1]; https://oneuptime.com/blog/post/2026-02-17-how-to-analyze-query-plans-in-cloud-sql-postgresql-using-explain-analyze/view [2]

## Query Rewriting
Rewrite suboptimal plans identified in EXPLAIN by using explicit JOIN clauses or adjusting conditions to leverage indexes better; official docs recommend explicit JOINs to control planner.[4]  
- Example workflow: If EXPLAIN shows bad estimates or plans, rewrite query structure after checking statistics (run ANALYZE); e.g., transform subqueries or reorder joins.[1]  
Source: https://oneuptime.com/blog/post/2026-02-20-postgresql-performance-tuning/view [1]; https://www.postgresql.org/docs/current/performance-tips.html [4]

## Materialized Views
No specific recent examples (last 30 days) found in search results for materialized views in PostgreSQL optimization; official docs cover general performance tips but not this topic directly here.[4]  
Source: https://www.postgresql.org/docs/current/performance-tips.html [4]  
Next steps: Run pg_stat_statements query above on your DB to identify top slow queries, then apply EXPLAIN (ANALYZE, BUFFERS) workflow from [1][2]; test index on highest-impact join/filter columns.
