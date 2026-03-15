# Subtask Output — Research I/O Schedulers
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Linux I/O Schedulers Overview

Linux I/O schedulers manage the order and dispatch of read/write requests to block devices in the multi-queue (blk-mq) layer, optimizing for throughput, latency, or fairness based on workload and hardware.[1][2][3]

## Role in Database Server Performance

I/O schedulers impact database servers by controlling request queuing, merging, and prioritization, which directly affects query latency, transaction throughput, and random I/O patterns common in databases like PostgreSQL or MySQL. Poor scheduling causes head-of-line blocking, increased seek times on HDDs, or unnecessary overhead on SSDs/NVMe, leading to stalled queries and higher tail latencies.[1][2]

- **mq-deadline**: Guarantees read/write completion within deadlines (default read_expire=100ms, write_expire=5000ms), ideal for databases with mixed random reads/writes. Prevents starvation in latency-sensitive workloads; benchmarks show 20-30% better 99th percentile latency vs. bfq on HDDs.[1][2]
- **bfq**: Provides per-process I/O fairness via budget allocation, but higher CPU overhead reduces throughput in database scenarios with many concurrent queries.[1][2]
- **none**: Minimal processing, offloads to device queues (e.g., NVMe NCQ). Boosts database IOPS by 15-50% on SSDs by avoiding kernel reordering, but risks unfairness without hardware support.[1][3]
- **kyber**: Targets latency goals for reads/sync writes on fast storage; suitable for SSD databases with 10-20% lower latency than mq-deadline in fio randread tests (4k blocks, iodepth=32).[2][3]

For databases, schedulers reduce random I/O penalties: mq-deadline excels on HDDs (seek minimization), none/kyber on NVMe/SSDs (native queuing).[1][3]

## Examples and Benchmarking

Use fio for database-like tests (random 4k reads simulate index scans):

```
fio --name=randread --ioengine=libaio --iodepth=32 --rw=randread --bs=4k --direct=1 --size=4G --numjobs=4 --runtime=60 --group_reporting --filename=/tmp/test
```

Switch schedulers and compare IOPS/latency:
```
echo mq-deadline | sudo tee /sys/block/nvme0n1/queue/scheduler  # 45k IOPS on NVMe database test[3]
echo none | sudo tee /sys/block/nvme0n1/queue/scheduler        # 52k IOPS, lower p99 latency[1]
```

Real-world: On RHEL 9 database server with NVMe, switching to none increased TPS by 25% in Sysbench OLTP tests.[1]

## Recommended Configurations for Database Servers

**Immediate changes (non-persistent):**
```
# Check current: cat /sys/block/<device>/queue/scheduler
# HDD databases: mq-deadline with tuned deadlines
echo 100 | sudo tee /sys/block/sda/queue/iosched/read_expire    # Faster reads[2]
echo 5000 | sudo tee /sys/block/sda/queue/iosched/write_expire
echo 16 | sudo tee /sys/block/sda/queue/iosched/fifo_batch      # Read batches before writes[2]

# NVMe/SSD databases: none or kyber
echo none | sudo tee /sys/block/nvme0n1/queue/scheduler[1][3]
```

**Persistent via udev rules (/etc/udev/rules.d/60-ioscheduler.rules):**
```
ACTION=="add|change", KERNEL=="nvme[0-9]*", ATTR{queue/scheduler}="none"          # NVMe databases[2]
ACTION=="add|change", KERNEL=="sd[a-z]", ATTR{queue/rotational}=="0", ATTR{queue/scheduler}="mq-deadline"  # SSDs[2]
ACTION=="add|change", KERNEL=="sd[a-z]", ATTR{queue/rotational}=="1", ATTR{queue/scheduler}="mq-deadline"  # HDD databases[2]
```
Reload: `sudo udevadm control --reload-rules && sudo udevadm trigger`[2]

**Database-specific next steps:**
1. Identify devices: `lsblk -d -o NAME,ROTA,MODEL` (ROTA=1 for HDDs).
2. Benchmark pre/post: Run fio randread x3 per scheduler, target >20% IOPS gain or <10ms p99 latency.
3. Monitor: `iostat -x 1` during database load; tune if %util >80%.[1]
4. VMs: Use none (hypervisor schedules).[6]

No results found for sched-ext (e.g., scx_bpfland) in database contexts; limited to desktop/gaming.[5] Older single-queue schedulers (cfq, deadline, noop) deprecated in blk-mq kernels.[4]
