# Subtask Output — Research TCP Congestion Control
## Model: sonar
## Stage: research
## Date: 2026-03-16

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
