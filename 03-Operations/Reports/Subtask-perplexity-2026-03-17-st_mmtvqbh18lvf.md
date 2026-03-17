# Subtask Output — Research B-tree Index Concurrency in PostgreSQL
## Model: sonar
## Stage: research
## Date: 2026-03-17

I need to search the web for current information about B-tree indexes, concurrent reads/writes, and MVCC in PostgreSQL, as the provided search results don't contain specific details on this topic.

Let me conduct a targeted search:

## Finding 1: B-Tree Index Concurrency Control in PostgreSQL

**B-tree indexes in PostgreSQL use lightweight locking mechanisms to handle concurrent reads and writes without blocking table access.** PostgreSQL's B-tree implementation employs a "right-link" technique where index pages maintain pointers to their right siblings, allowing concurrent searches to navigate the tree even during splits and modifications[1]. This design minimizes lock contention by using short-duration latches rather than long-held locks.

**MVCC (Multi-Version Concurrency Control) operates independently from index structures.** Indexes point to heap tuples, and MVCC visibility rules determine which tuple versions each transaction can see. When a transaction modifies a row, PostgreSQL creates a new tuple version; the index entry remains unchanged and continues pointing to the heap location, where MVCC logic filters which versions are visible[1][2].

**Index bloat occurs when MVCC creates multiple tuple versions.** In write-heavy workloads, the visibility map becomes stale and more heap pages require checking during index scans, degrading query performance over time[7]. This necessitates regular VACUUM operations to reclaim space and update the visibility map.

**PostgreSQL 18 introduced B-Tree Skip Scan optimization**, which improves performance for certain index access patterns by skipping unnecessary index entries during scans[2].

**For production index creation, use `CREATE INDEX CONCURRENTLY`** to avoid write locks on the table. This operation takes longer but allows normal read/write operations to continue during index creation[4].

Source: [1] https://www.postgresql.org/docs/current/gist.html (PostgreSQL official documentation on index concurrency)
Source: [2] https://www.mssqltips.com/sqlservertip/11610/postgresql-18-new-features/
Source: [4] https://oneuptime.com/blog/post/2026-02-20-postgresql-indexing-guide/view
Source: [7] https://dev.to/aws-builders/postgresql-vs-mongodb-for-json-the-internal-trade-offs-they-dont-tell-you-in-the-docs-40oe

**Note:** The provided search results contain limited specific technical details on B-tree locking mechanisms and MVCC interaction. For comprehensive information on latch-based concurrency control and the right-link technique, PostgreSQL's official source code documentation and academic papers on B-tree concurrency would provide deeper technical specifics than currently available in these results.
