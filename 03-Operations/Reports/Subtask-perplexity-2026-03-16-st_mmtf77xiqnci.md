# Subtask Output — Research Database Indexing Techniques
## Model: sonar
## Stage: research
## Date: 2026-03-16

# PostgreSQL Database Indexing Techniques: Current Best Practices

## Finding 1: Index Skip Scan in PostgreSQL 18 — Performance Breakthrough

**Index Skip Scan** is a major planner improvement in PostgreSQL 18 that dramatically accelerates queries on composite indexes by skipping unnecessary portions of the index rather than scanning every matching row[1].

**How it works:** Instead of scanning all index entries matching a filter condition, PostgreSQL now:
- Finds the first row for a specific leading-column value
- Applies the filter condition
- Jumps directly to the next distinct leading-column value
- Repeats the process

**Real-world impact:** Queries that previously took several minutes can drop to seconds. In large datasets, this can reduce I/O, CPU usage, and execution time significantly by reading only one or a few index entries per distinct value instead of millions of rows[1].

**Example:** For a composite index on `(tenant_id, created_at)`, a query filtering only on `created_at` would previously require scanning millions of index entries. With Index Skip Scan, PostgreSQL intelligently navigates the index by jumping between distinct `tenant_id` values[1].

Source: https://genexdbs.com/how-to-unlock-faster-queries-in-postgresql-18-with-index-skip-scan/

---

## Finding 2: Composite Index Column Ordering — Left-to-Right Rule

**Column order is critical in composite indexes.** PostgreSQL evaluates composite indexes strictly left-to-right, meaning the leftmost columns must match your query's filter conditions for the index to be effective[2][6].

**Best practice:** Structure composite indexes to match your query patterns. For queries that both filter and sort on different columns, use composite indexes with the filter column first, then the sort column[2].

**Example:** For the query `SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC;`, a composite index on `(status, created_at)` allows PostgreSQL to both filter by status AND sort by date in a single index operation. Without it, PostgreSQL would filter first, then sort separately—an expensive operation on large tables[2].

Source: https://baransel.dev/post/database-indexing-explained-with-postgresql/

---

## Finding 3: Covering Indexes — Zero Table Lookups

**Covering indexes** include all columns needed to answer a query without accessing the main table, eliminating expensive table lookups[6].

This technique is particularly valuable for read-heavy workloads where you want to satisfy queries entirely from the index.

Source: https://rizqimulki.com/15-postgresql-indexing-techniques-that-separate-amateurs-from-experts-03fadeb3991a

---

## Finding 4: Partial Indexes — Targeted Performance

**Partial indexes** index only a subset of rows matching a condition, reducing index size and improving query speed for specific use cases[2].

**Common applications:**
- Active users only
- Published posts (excluding drafts/archived)
- Recent transactions

**Benefit:** Queries targeting the indexed subset are faster, and queries on excluded data won't use the index—which is acceptable if those queries are rare[2].

Source: https://baransel.dev/post/database-indexing-explained-with-postgresql/

---

## Finding 5: GiST Indexes — Beyond B-tree for Specialized Data

**GiST (Generalized Search Tree)** indexes are balanced, tree-structured indexes ideal for specialized data types beyond standard B-tree capabilities[4].

**Use cases:**
- Full-text search and JSONB columns (use GIN indexes instead for these)
- Geometric data types
- Range queries
- Tree-like structures (`ltree`)
- Text similarity using trigram matching (`pg_trgm`)
- Float ranges (`seg`)[4]

**Build optimization:** PostgreSQL supports sorted and buffered build modes. The buffered method dramatically reduces random I/O for non-ordered datasets by batching insertions rather than inserting tuples one-by-one[4].

Source: https://www.postgresql.org/docs/current/gist.html

---

## Finding 6: EXPLAIN ANALYZE — Diagnostic Workflow for Slow Queries

**EXPLAIN ANALYZE** is the primary tool for diagnosing query performance issues. The recommended diagnostic workflow is[5]:

1. **Run EXPLAIN ANALYZE** on the slow query
2. **Check for missing indexes** — if the plan shows sequential scans on large tables, create appropriate indexes
3. **Verify statistics** — if statistics are stale, run `ANALYZE` on the table
4. **Evaluate plan quality** — if the plan is suboptimal despite indexes and statistics, rewrite the query
5. **Tune configuration** — if all else fails, adjust PostgreSQL settings

**Key metrics to monitor:**
- **Cache hit ratio** (should be >99%): Indicates how often PostgreSQL serves data from memory vs. disk
- **Index usage ratio** (should be >95% for OLTP): Shows whether queries are using indexes effectively
- **Table bloat** (dead tuple ratio): Identifies when `VACUUM` or `REINDEX` is needed[5]

**SQL queries for diagnostics:**

```sql
-- Cache hit ratio
SELECT
    sum(heap_blks_read) as disk_reads,
    sum(heap_blks_hit) as cache_hits,
    round(
        sum(heap_blks_hit)::numeric /
        (sum(heap_blks_hit) + sum(heap_blks_read)) * 100, 2
    ) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Index usage
SELECT
    relname,
    seq_scan,
    idx_scan,
    round(
        idx_scan::numeric / (seq_scan + idx_scan) * 100, 2
    ) as index_usage_percent
FROM pg_stat_user_tables
WHERE seq_scan + idx_scan > 0
ORDER BY seq_scan DESC;

-- Table bloat
SELECT
    relname,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup::numeric / GREATEST(n_live_tup, 1) * 100, 2) as dead_ratio
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

Source: https://oneuptime.com/blog/post/2026-02-20-postgresql-performance-tuning/view

---

## Finding 7: B-tree Index Structure — Depth and Performance

**B-tree index performance is inversely proportional to depth** (number of levels). Fewer levels = faster searches[3].

Index depth depends on:
- **Fan-out** (entries per index page): Larger fan-out reduces depth
- **Index page size**: Fixed at 8KB in PostgreSQL
- **Entry size**: Smaller entries pack more densely, increasing fan-out

**Monitoring index health:** Use `pgstattuple` extension to check index fragmentation and density[3]:

```sql
CREATE EXTENSION pgstattuple;
SELECT tree_level, deleted_pages, avg_leaf_density, leaf_fragmentation
FROM pgstatindex('index_name');
```

**Range scans:** When many rows match a search condition or when supporting `ORDER BY`, PostgreSQL performs a range scan—drilling down to the range start, then scanning linked leaf pages sequentially until the range end[3].

Source: https://www.cybertec-postgresql.com/en/should-i-rebuild-my-postgresql-index/

---

## Finding 8: Indexing Rules for Production Systems

**Practical indexing guidelines:**

1. **Index every column you filter on in WHERE clauses** (for tables with >few thousand rows)
2. **Index foreign keys** — JOINs on unindexed foreign keys are expensive
3. **Use composite indexes for filter + sort queries** on different columns
4. **Avoid indexing low-cardinality columns** (e.g., booleans) — the index overhead exceeds benefits
5. **Monitor actual index usage** with `pg_stat_user_indexes` to identify unused indexes[2]

Source: https://baransel.dev/post/database-indexing-explained-with-postgresql/
