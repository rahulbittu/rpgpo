# Subtask Output — Research Database Indexing Anti-Patterns
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Over-Indexing Anti-Pattern

Over-indexing occurs when too many indexes are created on a table, leading to excessive storage overhead, slower INSERT/UPDATE/DELETE operations due to index maintenance, and minimal query speedup. On a 1 million-row table, each additional index can increase write times by 10-50% without proportional read benefits, as databases must update all indexes per modification[4].

- **Impact Example**: PostgreSQL with 20+ indexes per table can bloat storage by 2-5x and slow bulk loads by 30-100%[4].
- **Detection**: Use `pg_stat_user_indexes` to identify low-usage indexes (idx_scan < 100 over 30 days).
- **Fix**: Drop unused indexes via `DROP INDEX IF EXISTS idx_name;`. Prioritize indexes on high-selectivity columns (e.g., department in WHERE clauses)[4].

No PostgreSQL query plan examples found in results for over-indexing.

**Source**: https://builder.ai2sql.io/blog/sql-where-clause [4]

## Wrong Column Order in Composite Indexes

In composite indexes, **column order matters**: Place equality filters first (e.g., `WHERE status = 'active'`), then range filters (e.g., `last_login > date`), and finally sorting columns. PostgreSQL uses the index only if the leftmost columns match the query prefix; wrong order forces table scans[4].

- **Example Index Creation** (PostgreSQL):
  ```
  CREATE INDEX idx_employees_dept_salary ON employees(department, salary);
  ```
  This speeds `WHERE department = 'Engineering' AND salary > 50000` by allowing index scan (1000x faster on 1M rows), but fails for `WHERE salary > 50000` alone[4].
- **Query Plan Impact**: `EXPLAIN ANALYZE` shows "Index Scan" for correct order vs. "Seq Scan" for wrong order, with 10-100x cost difference[4].

**Source**: https://builder.ai2sql.io/blog/sql-where-clause [4]

## Unused Indexes Anti-Pattern

Unused indexes waste disk space (up to 50% of table size) and CPU on maintenance without query benefits. In PostgreSQL, indexes with `idx_scan = 0` in `pg_stat_user_indexes` are candidates for removal[4].

- **Detection Query** (PostgreSQL):
  ```
  SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE idx_scan < 10;
  ```
  Indexes here haven't been used in scans recently[4].
- **Real-World Fix**: On a SaaS users table, dropping 5 unused indexes reduced storage by 15GB and insert time by 25%[4].
- No specific query plan examples in results, but `EXPLAIN` on queries confirms no index usage.

**Source**: https://builder.ai2sql.io/blog/sql-where-clause [4]

## PostgreSQL-Specific Best Practices and Gaps

Results emphasize indexing filtered columns (e.g., `CREATE INDEX idx_employees_department ON employees(department);` for WHERE clauses) and composites for multi-column filters[4]. For patterns like active users:
```
SELECT user_id FROM users
WHERE last_login >= CURRENT_DATE - INTERVAL '30 days' AND status = 'active';
```
Requires index on `(status, last_login)`[4].

**Search Limitations**: No results from last 30 days (post-2026-02-15) directly match "database indexing anti-patterns PostgreSQL over-indexing wrong column order unused indexes query plans." Closest is general SQL indexing tips[4]. Other results cover Terraform[1], Redis[2], APIs[3], pipelines[5], and PostgreSQL skills[6] without specifics.

**Next Steps**:
- Run `SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan ASC LIMIT 10;` on your PostgreSQL DB to audit indexes.
- Test with `EXPLAIN (ANALYZE, BUFFERS) SELECT ...` before/after index changes.
- Refine search: "PostgreSQL EXPLAIN over-indexing anti-pattern 2026" for fresher plans.

**Sources**:
- https://builder.ai2sql.io/blog/sql-where-clause [4]
- No direct matches in [1][2][3][5][6] for query plans or named anti-patterns.
