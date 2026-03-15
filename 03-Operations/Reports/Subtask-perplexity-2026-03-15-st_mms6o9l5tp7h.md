# Subtask Output — Research Linux Kernel Parameters
## Model: sonar
## Stage: research
## Date: 2026-03-15

# Linux Kernel Parameters for Database Server Performance

Linux kernel parameters directly control how the operating system manages memory, I/O, and network resources—all critical for database performance. Misconfiguration can cause unpredictable latency and stalled backends regardless of hardware quality[2].

## Memory Management Parameters

**vm.swappiness** reduces swap usage, allowing databases to manage their own caching. Set to **10** for database workloads (default is 60)[1].

**vm.dirty_ratio** and **vm.dirty_background_ratio** control when the kernel writes dirty pages to disk. For databases, use **vm.dirty_ratio = 40** and **vm.dirty_background_ratio = 10**[1]. However, percentage-based limits are problematic on high-RAM systems because they scale with memory size rather than storage throughput. For predictable behavior, use absolute byte limits instead: **vm.dirty_background_bytes** and **vm.dirty_bytes**[2].

**vm.dirty_expire_centisecs** and **vm.dirty_writeback_centisecs** control writeback timing. Recommended values are **500** and **100** centiseconds respectively for write-heavy workloads[1].

**kernel.shmmax** and **kernel.shmall** increase shared memory limits for large database buffers. Set **kernel.shmmax = 68719476736** (64 GB) and **kernel.shmall = 4294967296**[1].

## File Descriptor and Network Parameters

**fs.file-max** increases the system-wide file descriptor limit to **2097152** for databases handling many concurrent connections[1].

**net.core.somaxconn** optimizes the listen queue for many concurrent connections. Set to **65535**[1].

## I/O Scheduler and Queue Depth

**elevator** sets the I/O scheduler. For NVMe devices, use **none** (no scheduling overhead); for traditional storage, **mq-deadline** provides balanced latency[3].

**nr_requests** controls queue depth. Use **32** for traditional disks and **1023** for NVMe to balance throughput and latency consistency[1].

**read_ahead_kb** controls read-ahead buffering. Set to **128 KB** for databases that perform random reads rather than sequential scans[1].

## CPU and Memory Optimization

**transparent_hugepage** should be **disabled** (set to `never`) for database workloads because databases manage their own memory more efficiently than the kernel's automatic huge page mechanism[3][4].

Static **hugepages** allocation reduces TLB misses on memory-intensive workloads. For a 16 GB database buffer, allocate approximately **8500 huge pages of 2 MB each**. Calculate as: (desired RAM in GB / 2) × 1024, plus 5-10% overhead[4].

**numa_balancing** should be **disabled** (set to 0) on NUMA systems to prevent automatic memory migration overhead[3].

**processor.max_cstate** and **intel_idle.max_cstate** should be set to **1** to reduce CPU latency by preventing deep sleep states[3].

## PostgreSQL-Specific Settings

Within PostgreSQL configuration, set **effective_io_concurrency = 200** for SSDs (1 for HDDs) to optimize query planning for concurrent I/O[1].

**random_page_cost = 1.1** for SSDs (4.0 for HDDs) adjusts the query planner's cost model[1].

**wal_buffers = 64MB** and **checkpoint_completion_target = 0.9** optimize write-ahead logging and checkpoint behavior[1].

## File System Selection

**XFS and ext4** are the fastest for database workloads. In August 2024 Phoronix benchmarks on Linux 6.11, both ranked as top performers for SQLite concurrent writes, while Btrfs was significantly slower due to its copy-on-write overhead[5].

## Implementation

Apply kernel parameters via `/etc/sysctl.d/90-database.conf` and reload with `sudo sysctl --system`[1]. For boot-time parameters, use `grubby --update-kernel=ALL --args="parameter=value"` and verify with `grubby --info=DEFAULT`[3]. Always benchmark before and after changes to confirm improvements[3].

Source: https://oneuptime.com/blog/post/2026-03-04-optimize-database-storage-performance-rhel-9/view
Source: https://www.sqlpassion.at/archive/2026/02/17/the-linux-page-cache-and-postgresql/
Source: https://oneuptime.com/blog/post/2026-03-04-custom-kernel-parameters-performance-grub2-rhel-9/view
Source: https://oneuptime.com/blog/post/2026-03-04-kernel-huge-pages-database-vm-performance-rhel-9/view
Source: https://commandlinux.com/statistics/file-system-performance-comparison-statistics-ext4-xfs-btrfs-zfs/
