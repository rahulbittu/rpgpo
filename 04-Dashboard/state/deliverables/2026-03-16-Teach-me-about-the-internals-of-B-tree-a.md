# Teach me about the internals of B-tree and LSM-tree storage engines. Compare the

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research B-tree and LSM-tree storage engines
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

The development of high-speed storage devices such as NVMe SSDs has shifted the primary I/O bottleneck from hardware to software[1]. This shift has made LSM-tree optimizations increasingly valuable, as they address software-level inefficiencies in system calls and I/O patterns rather than relying on hardwa

## Synthesize comparison report
## Explanation

### B-Tree Storage Engine

- **Architecture**: B-trees use a balanced tree structure where each node contains multiple keys and pointers. This allows for efficient in-place updates and consistent read performance.
- **Write Performance**: B-trees perform in-place updates, which can be slower due to the need for complex locking mechanisms and more overhead.
- **Read Performance**: Offers consistent read performance as data is organized in a single, balanced structure.

### LSM-Tree Storage Engine

- **Architecture**: LSM-trees use an in-memory sorted structure (memtable) that flushes to disk as immutable SSTables, with background merging to consolidate data.
- **Write Performance**: LSM-trees excel in write operations by converting random writes into sequential writes. This reduces write amplification and improves performance.
- **Read Performance**: Read operations can be slower due to the need to search through multiple SSTables, especially if compaction is delayed.

### Space Amplification

- **B-trees**: Typically have lower space amplification as data is stored in-place, but fragmentation can occur over time.
- **LSM-trees**: Higher space amplification due to the storage of multiple versions of data and the need for compaction.

## Examples

### Use Cases in PostgreSQL

- **B-tree**: PostgreSQL primarily uses B-trees for indexing due to their balanced read and write performance and lower space amplification, making them suitable for OLTP workloads where read consistency is crucial.

### Use Cases in RocksDB

- **LSM-tree**: RocksDB, built on the LSM-tree model, is optimized for high write throughput, making it ideal for write-heavy applications like logging and time-series data.

## Practice Questions

1. What are the primary architectural differences between B-trees and LSM-trees?
2. How do LSM-trees achieve better write performance compared to B-trees?
3. Why might a database choose to use a B-tree over an LSM-tree for indexing?

## Further Reading

- [B-trees and LSM-trees: A Comparison](https://example.com/btree-vs-lsm)
- [PostgreSQL Documentation on Indexing](https://www.postgresql.org/docs/current/indexes-types.html)
- [RocksDB Architecture Overview](https://rocksdb.org/)

## Recommendations

### For PostgreSQL Users

- **What to Do**: Use B-trees for indexing in OLTP systems to ensure consistent read performance and efficient storage use.
- **Why**: B-trees offer balanced read/write performance and lower space amplification, which is crucial for transactional systems.
- **Expected Outcome**: Improved query performance and efficient storage management.
- **First Step**: Evaluate current indexing strategies and consider B-tree indexes for tables with frequent read operations.

### For RocksDB Users

- **What to Do**: Leverage LSM-trees for applications with high write throughput requirements.
- **Why**: LSM-trees are optimized for sequential writes, reducing write amplification and improving performance.
- **Expected Outcome**: Enhanced write performance and scalability for write-heavy workloads.
- **First Step**: Analyze write patterns and adjust compaction settings to optimize performance.