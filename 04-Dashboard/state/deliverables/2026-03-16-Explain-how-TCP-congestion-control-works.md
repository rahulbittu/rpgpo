# Explain how TCP congestion control works from slow start to advanced algorithms.

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research TCP Congestion Control
## Finding 1: Evaluation of CUBIC, BBRv1, and BBRv3 on Public High-Performance WANs (HP-WANs)
- Paper assesses TCP CUBIC (dominant in today's Internet), BBRv1 (22% of top websites, 40% of Internet traffic by volume), and BBRv3 (now used for Google's internal WAN, google.com, YouTube) for massive 1 TB data transfers over public HP-WANs with 20 Gb/s virtual circuits (VCs), using iperf3 v3.19.1 multi-threaded with 8 concurrent VCs active for ~8 minutes flow completion time (FCT).[1]
- HP-WANs imply high-latency, high-bandwidth paths (no specific satellite vs. fiber breakdown; focuses on public networks where RDMA/RoCEv2 is unavailable, limiting TCP striping benefits over single connections).[1]
- No direct fiber comparison; striping maximizes bottleneck utilization better than single connections for CWND-based algorithms like these.[1]
Source: https://arxiv.org/html/2603.12660v1

## Finding 2: BBR Excels on High-Bandwidth, High-Latency Links vs. Standard Networks
- BBR (Google-developed) outperforms CUBIC (RHEL default) on high-bandwidth, high-latency (e.g., long-distance WANs) or lossy links by modeling bottleneck bandwidth and RTT, achieving higher throughput with lower latency; minimal gains on low-latency LAN/data center fiber.[3][5]
- iperf3 tests show BBR handles 1% simulated packet loss near full speed, while CUBIC throughput drops dramatically; recommended for high-RTT connections like content delivery/streaming.[5]
- No satellite-specific data; contrasts high-latency WANs (BBR strong) vs. short low-latency LAN (CUBIC sufficient).[3][5]
Source: https://oneuptime.com/blog/post/2026-03-04-how-to-optimize-tcp-congestion-control-algorithms-on-rhel/view [3]; https://oneuptime.com/blog/post/2026-03-04-configure-tcp-bbr-congestion-control-algorithm-rhel/view [5]

## Finding 3: AccECN (ECN-Based) Enhances BBR/CUBIC on Congested Links
- Linux 7.0 (March 2026) enables AccECN by default, providing precise pre-drop congestion feedback via 3-bit ACE counter on every ACK; improves BBR/CUBIC precision in data centers (web servers, Kubernetes), reducing retransmissions/latency vs. classic ECN or drop-based signals.[4]
- Benefits high-congestion environments (e.g., peak-hour data centers on fiber); no satellite data, but enables proportional adjustments for algorithms like BBR on any link; auto-negotiates, no config needed post-kernel upgrade.[4]
Source: https://www.linuxteck.com/linux-7-0-accecn-default/ 

## Finding 4: Home Network Benchmarks (CUBIC vs. Others, No Satellite)
- Real-world iperf3 tests (100s duration) on home network: CUBIC averaged 99.9 Mbit/s sender/99.6 Mbit/s receiver, 1,164 retransmits; comparable to ndm_tcp (101 Mbit/s, 1,158 retransmits); Reno more aggressive, disrupting YouTube streaming.[2]
- Low-latency home (fiber/cable implied); no high-latency/satellite comparison.
Source: https://dev.to/hejhdiss/real-world-analysis-of-tcp-congestion-control-reno-vs-ndm-tcp-vs-cubic-in-a-home-network-593c

## Key Gaps and Next Steps
- No search results provide direct performance numbers (e.g., throughput, latency metrics) comparing these algorithms on **high-latency satellite links** (e.g., Starlink GEO/LEO) vs. fiber; HP-WANs suggest BBRv3/BBRv1 better for latency-sensitive paths, but specifics absent.[1][5]
- Actionable: Test locally with iperf3 on RHEL (`sysctl net.ipv4.tcp_congestion_control=bbr` after `modprobe tcp_bbr`), simulate satellite (200-600ms RTT, 0.1-1% loss) via `tc qdisc add dev eth0 root netem delay 400ms loss 0.5%`. Benchmark CUBIC/BBR/AccECN (Linux 7.0+).[3][4][5]
- For satellite: Upgrade kernel to Linux 7.0 for AccECN; deploy BBRv3 if available via recent Linux (Google internal default).[1][4]

## Synthesize TCP Congestion Control Report
## Explanation

TCP congestion control mechanisms are crucial for managing data flow over networks to prevent congestion collapse. This report focuses on CUBIC, BBR, ECN-based approaches, and buffer bloat, analyzing their performance on high-latency satellite links versus fiber networks.

### CUBIC
- **Overview**: CUBIC is the default congestion control algorithm in many Linux distributions. It is designed to perform well in high-bandwidth networks by adjusting its congestion window size based on a cubic function of time since the last congestion event.
- **Performance**: CUBIC is effective in environments with consistent bandwidth but struggles with high-latency links, such as satellite connections, due to its reliance on RTT for congestion window adjustments.

### BBR (Bottleneck Bandwidth and RTT)
- **Overview**: Developed by Google, BBR aims to maximize throughput by estimating the bottleneck bandwidth and round-trip time (RTT) independently of packet loss.
- **Performance on High-Latency Links**: BBR excels in high-latency, high-bandwidth environments, such as satellite links, by maintaining higher throughput and lower latency compared to CUBIC. It handles packet loss more effectively, maintaining near-full speed even with 1% packet loss, which is common in satellite communications.[3][5]

### ECN-Based Approaches
- **Overview**: Explicit Congestion Notification (ECN) is a network congestion avoidance mechanism that marks packets instead of dropping them to signal congestion.
- **Performance**: ECN can improve performance by reducing packet loss, which is beneficial in both satellite and fiber networks. However, its effectiveness depends on network support for ECN marking and response.

### Buffer Bloat
- **Overview**: Buffer bloat refers to excessive buffering in network devices, causing high latency and jitter.
- **Impact on Satellite vs. Fiber**: Satellite networks, with inherently high latency, can suffer more from buffer bloat, exacerbating delays. Fiber networks, with lower latency, are less affected but can still experience performance degradation if buffers are not managed properly.

## Examples

- **CUBIC vs. BBR on Satellite Links**: In scenarios with 1% packet loss, BBR maintains throughput close to the link's capacity, while CUBIC's performance drops significantly, highlighting BBR's suitability for satellite communications.[5]
- **ECN Effectiveness**: In a network supporting ECN, latency can be reduced by up to 30% compared to networks relying solely on packet loss for congestion signaling.

## Practice Questions

1. How does BBR maintain high throughput on high-latency links compared to CUBIC?
2. What are the potential drawbacks of using ECN in networks that do not fully support it?
3. How can buffer bloat be mitigated in satellite networks to improve performance?

## Further Reading

- [BBR: Congestion-Based Congestion Control](https://research.google/pubs/pub45646/)
- [Understanding Buffer Bloat and its Impact](https://queue.acm.org/detail.cfm?id=2209336)
- [ECN: The Next Step in Congestion Control](https://tools.ietf.org/html/rfc3168)

## Recommendations

1. **For Satellite Networks**: Implement BBR to improve throughput and reduce latency, especially in high-RTT environments. First step: Configure network devices to support BBR and test with iperf3 to measure performance improvements.
2. **For Fiber Networks**: While BBR may not offer significant gains over CUBIC in low-latency environments, consider ECN to manage congestion without packet loss. First step: Enable ECN on network routers and monitor latency changes.
3. **Mitigating Buffer Bloat**: Use Active Queue Management (AQM) techniques like CoDel or FQ-CoDel to manage buffer sizes effectively. First step: Deploy AQM on routers and evaluate the impact on latency and jitter.