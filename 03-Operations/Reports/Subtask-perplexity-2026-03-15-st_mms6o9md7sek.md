# Subtask Output — Research Memory Management Techniques
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Transparent Huge Pages (THP)

**THP** consolidates 4KB pages into 2MB or 1GB pages, reducing TLB misses and page table overhead by up to 50% in memory-intensive database workloads like PostgreSQL or MySQL[1][7]. For databases, enable **always** mode on systems with >64GB RAM to improve random access performance, but test for latency spikes from compaction on write-heavy tables[1].

- **Best practice**: `echo always > /sys/kernel/mm/transparent_hugepage/enabled`; monitor with `cat /sys/kernel/mm/transparent_hugepage/stats` for collapse rates >10M/s[1][7].
- **Database impact**: Reduces PostgreSQL checkpoint I/O by 20-30% on NUMA systems[3][7].

## Memory Compression (zswap/zram)

Kernel compresses inactive pages in RAM using **zswap** (writes to swap-like cache) or **zram** (compressed RAM disk), extending effective memory by 2-4x for memory-constrained database servers[1][2]. Ideal for low-RAM Talos Linux Kubernetes setups running etcd or PostgreSQL, where default swap absence causes OOM kills[2].

- **Best practice**: Set `vm.swappiness=10` and enable zram: `modprobe zram; echo lz4 > /sys/block/zram0/comp_algorithm; echo 50%RAM > /sys/block/zram0/disksize`[2].
- **Tuning**: `vm.vfs_cache_pressure=200` aggressively frees dentries/inodes, prioritizing database page cache[2].

## Page Cache and Dirty Page Writeback

Linux page cache buffers database reads/writes, but poor **dirty page limits** cause stalls in PostgreSQL/SQL Server as kernel throttles apps at 100% dirty ratio[3][7]. On high-RAM (>128GB) servers, percentages scale poorly; use bytes for throughput-independent behavior[3].

| Parameter | Recommended Value | Rationale for Databases | Source |
|-----------|-------------------|--------------------------|--------|
| **vm.dirty_background_bytes** | 1GB (1073741824) | Starts continuous writeback early, prevents bursts | [3] |
| **vm.dirty_bytes** | 4GB (4294967296) | Hard limit; drains in <5s on NVMe SSDs | [3] |
| **vm.dirty_expire_centisecs** | 500 | Expires old dirtiness faster for steady throughput | Prior Subtask |
| **vm.min_free_kbytes** | 16384 (16MB) | Reserves for emergency reclaim, avoids OOM under load | [2] |

- **Best practice**: Apply via sysctl.conf; test with `stress-ng --io 4 --hdd 1 --timeout 60s` and monitor `/proc/meminfo Dirty` <20%[3].
- **Database impact**: Stabilizes PostgreSQL WAL writes, cutting 99th percentile latency by 40%[3].

## Shared Memory and Overcommit

Increase **kernel.shmmax=68719476736** (64GB) and **shmall=4294967296** pages for large PostgreSQL shared_buffers or SQL Server buffer pools[Prior Subtask]. Set **vm.overcommit_memory=1** to allow database memory growth without kills[2][7].

- **Best practice**: `sysctl kernel.shmmax=68719476736 vm.overcommit_memory=1`; verify with `ipcs -lm`[Prior Subtask].

## Monitoring and Troubleshooting

- Tools: `free -h`, `vmstat 1 10`, `/proc/meminfo`, `perf mem record -g` for cache misses[7].
- Next steps: 1) Benchmark current setup with pgbench (scale=1000, 10 clients); 2) Apply top 3 tunings (THP, dirty_bytes, swappiness=10); 3) Retest and measure Dirty/Nr_dirty ratio <5%[3][7].
