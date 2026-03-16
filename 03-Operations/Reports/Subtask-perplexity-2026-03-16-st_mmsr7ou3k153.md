# Subtask Output — Research B-tree and LSM-tree storage engines
## Model: sonar
## Stage: research
## Date: 2026-03-16

# B-Tree vs LSM-Tree Storage Engines: Architecture, Tradeoffs, and Real-World Applications

## Architecture and Core Design

**B-trees** organize data in a balanced tree structure where each node can contain multiple keys and pointers to child nodes. In contrast, **LSM-trees (Log-Structured Merge trees)** use a fundamentally different approach: new data lands in an in-memory sorted structure called a memtable, which flushes to disk as immutable SSTables (Sorted String Tables) when full, with background merging to consolidate multiple levels[5].

The key architectural difference lies in write optimization. LSM-trees convert random writes into sequential writes by appending data to small files and asynchronously compacting them into larger files[2]. B-trees, by contrast, perform in-place updates, which requires complex locking and more overhead[5].

## Read/Write Performance Tradeoffs

**Write Performance:**
LSM-trees excel at writes because they minimize write amplification through sequential I/O. However, this comes at a cost to reads. When a read operation occurs, it must first search the memtable, then scan SSTables sequentially from lower to higher levels[1]. When compaction is delayed and redundant or unsorted keys accumulate, lookup time increases significantly, and reads must traverse numerous SSTables, causing steep performance drops[1].

**Read Performance:**
B-trees provide more consistent read performance because data is organized in a single, balanced structure. LSM-trees can suffer during compaction backlogs—when reads must touch many files, foreground writes are often paused to prevent further degradation, leading to write stalls[1].

LSM compaction keeps writes fast while limiting how many files a read must touch by maintaining metadata describing minimum and maximum keys in each file[2].

## Space Amplification and Compression

**LSM-trees** are more space-efficient than B-trees. LSM-trees store data in a compact, sorted format, and because SSTables are immutable and written in a single pass, they compress exceptionally well—the database never updates them in place[3][4]. This immutability enables better compression algorithms.

**B-trees** require in-place updates, which limits compression effectiveness and can lead to higher space overhead, particularly as tables grow past hundreds of millions of rows[5].

## Real-World Implementations

### RocksDB (LSM-Tree Based)

**Resystance optimization on RocksDB v10.1.3:** A recent research implementation demonstrates LSM-tree performance improvements. Compared to baseline RocksDB, Resystance reduces the average number of system calls during compaction by **99%** and shortens compaction latency by **50%**[1].

RocksDB uses block-based SSTables to achieve both write and read efficiency. During flush or compaction, data are written sequentially across contiguous regions, which effectively utilizes the file system's and SSD's internal buffers and parallel channels, improving throughput and mitigating write amplification[1].

### PostgreSQL (B-Tree Based)

PostgreSQL uses B-tree indexes as its primary index structure. While the search results do not provide specific performance metrics for PostgreSQL's B-tree implementation, they indicate that as tables grow past hundreds of millions of rows, B-tree indexes become less effective—the index grows large, and range scans across wide time windows touch many pages[5].

### Time-Series Databases

**Turbopuffer** uses LSM-trees for full-text search and time-series workloads. The platform stores all indexed data in LSM-tree structures with SSTables on object storage. Current p90 full-text search latencies on 5M-document namespaces are approximately **5-10ms on a hot cache**[2]. A scan benchmark with 100,000 values runs in approximately **110 microseconds**, achieving **60× faster performance** than previous implementations[2].

**ArcadeDB** implements LSM-tree variants for both standard indexing and vector search. Its LSMVectorIndex combines the HNSW (hierarchical navigable small world) algorithm with LSM-tree architecture, providing automatic compaction and high write efficiency at scale[3].

## Use Case Differentiation

**LSM-trees excel in:**
- Write-heavy workloads (time-series databases, logging systems, sensor data collection)
- Append-only storage patterns where data is not updated after insertion[5]
- Systems requiring high throughput on NVMe SSDs where software I/O optimization is critical[1]

**B-trees excel in:**
- Workloads requiring consistent read performance
- Transactional systems where read latency predictability matters
- Databases where in-place updates are frequent

## Storage Device Impact

The development of high-speed storage devices such as NVMe SSDs has shifted the primary I/O bottleneck from hardware to software[1]. This shift has made LSM-tree optimizations increasingly valuable, as they address software-level inefficiencies in system calls and I/O patterns rather than relying on hardware speed improvements.

---

**Sources:**
- [1] https://arxiv.org/html/2603.05162v1
- [2] https://turbopuffer.com/blog/zero-cost
- [3] https://docs.arcadedb.com
- [4] https://noahtigner.com/articles/database-internals-chapter-7/
- [5] https://www.tigerdata.com/learn/time-series-database-what-it-is-how-it-works-and-when-you-need-one
