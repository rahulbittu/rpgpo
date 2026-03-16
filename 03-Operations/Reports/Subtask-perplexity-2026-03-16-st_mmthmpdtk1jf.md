# Subtask Output — Research PostgreSQL MVCC
## Model: sonar
## Stage: research
## Date: 2026-03-16

# PostgreSQL MVCC: Transaction Isolation, Snapshots, and Vacuum Management

## Finding 1: Transaction Isolation Levels and Search Result Visibility

PostgreSQL implements four SQL:1992 standard isolation levels that determine how concurrent transactions affect database retrieval[1][2]:

**Read Uncommitted** allows transactions to read uncommitted changes from other transactions (dirty reads), potentially returning inaccurate or inconsistent data[1].

**Read Committed** prevents dirty reads by only reading committed data, but permits non-repeatable reads where the same query executed twice within a transaction returns different results if another transaction commits changes between executions[1][2].

**Repeatable Read** guarantees that a transaction sees the same data each time it reads the same row, even if other transactions modify that row and commit. However, phantom reads can still occur—new rows matching search criteria may appear if another transaction inserts them and commits[1][2].

**Serializable** is the highest isolation level, preventing dirty reads, non-repeatable reads, and phantom reads by executing transactions as if they occurred sequentially rather than concurrently. This ensures consistent and reliable search results but significantly impacts performance due to increased locking overhead[1][2].

Source: https://www.tencentcloud.com/techpedia/141795
Source: https://docs.aws.amazon.com/neptune/latest/userguide/transactions-isolation-levels.html

## Finding 2: MVCC Snapshot Visibility Rules and Read Views

PostgreSQL's MVCC implementation uses **visibility rules** to determine which row versions are accessible to each transaction[3]. When a transaction begins, it establishes a "read view" or snapshot that reflects the database state at the transaction start (for Repeatable Read) or at query execution time (for Read Committed)[3].

A row version is visible to a reading transaction if[3]:
- It was created by a transaction that committed before the reading transaction started
- It has not been deleted or modified by a subsequent committed transaction within the reading transaction's visibility scope

**Practical example**: If Transaction A reads a record with value "X", and Transaction B updates it to "Y" and commits while Transaction A is running, Transaction A using Read Committed isolation will see the updated value "Y" on subsequent reads. However, Transaction A using Repeatable Read or snapshot isolation continues seeing "X" because MVCC provides a consistent snapshot from transaction start[3].

Source: https://www.tencentcloud.com/techpedia/141807

## Finding 3: PostgreSQL MVCC Architecture and Dead Tuple Accumulation

PostgreSQL's MVCC stores **multiple physical versions of each row directly in the table heap**[4][5]. When a row is updated, PostgreSQL writes a new version and marks the old one as dead. Both versions remain in the table until `VACUUM` reclaims the dead tuple[4][5].

This architecture guarantees that **readers never block writers and writers never block readers**—each transaction sees a consistent snapshot based on transaction IDs[4]. However, this comes with a maintenance cost: dead tuples accumulate, causing table bloat and performance degradation if vacuum falls behind[5].

This is architecturally different from MySQL/InnoDB, which uses an undo log approach where the current row version lives in the table and undo records in a separate rollback segment reconstruct older versions. MySQL avoids table bloat but incurs undo log traversal overhead for long-running read transactions[5].

Source: https://mrcloudbook.com/postgresql-performance-tuning-deep-dive-stop-restarting/
Source: https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-in-2026-performance-features-and-when-to-use-each-3g7e

## Finding 4: Transaction ID Wraparound and Autovacuum Prevention

PostgreSQL uses **32-bit unsigned integers for transaction IDs**, providing approximately **4.2 billion** possible values[4]. Using modular arithmetic, PostgreSQL considers XIDs within approximately **2 billion** of the current XID as "in the past" (visible) and everything else as "in the future" (invisible)[4].

When enough transactions have occurred that old, unfrozen XIDs approach the 2 billion boundary, PostgreSQL must intervene or committed data becomes invisible[4]. Autovacuum cannot freeze tuples newer than the oldest active transaction's XID[4].

**Critical failure scenario**: A transaction left open for 11 days caused severe issues because[4]:
- Its XID remained "in-flight"
- Autovacuum could not freeze any tuple newer than this XID
- The "oldest XID that must remain visible" (relfrozenxid) could not advance
- `VACUUM FREEZE` ran but could not freeze tuples, as they might still be needed by the long-running transaction

The default autovacuum threshold is **200 million transactions**, but if autovacuum is blocked by long-running transactions, this freeze point cannot be reached[4].

Source: https://mrcloudbook.com/postgresql-performance-tuning-deep-dive-stop-restarting/

## Finding 5: Autovacuum Operational Requirements

PostgreSQL requires **autovacuum running continuously** to manage dead tuples[5]. Autovacuum checks each tuple's xmax (transaction ID marking deletion) against the oldest active transaction. If all active transactions can no longer see the old version, it's safe to reclaim[4].

The single biggest operational concern with PostgreSQL is that **dead tuples accumulate and tables bloat if vacuum falls behind**—this is the issue that most commonly trips up teams migrating from MySQL[5].

Source: https://dev.to/philip_mcclarence_2ef9475/postgresql-vs-mysql-in-2026-performance-features-and-when-to-use-each-3g7e
Source: https://mrcloudbook.com/postgresql-performance-tuning-deep-dive-stop-restarting/
