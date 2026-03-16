# Subtask Output — Research Consensus Algorithms
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Proof of Work (PoW)

No specific recent data (post-2026-02-14) found on PoW energy consumption or security tradeoffs in provided search results. PoW is referenced indirectly in blockchain consensus discussions but lacks quantitative metrics here[1][3].

## Proof of Stake (PoS)

No direct mentions or data on PoS energy consumption or security tradeoffs in results. Broader consensus comparisons note PoS variants in sharding contexts but provide no numbers, dates, or specifics[2].

## Delegated Proof of Stake (DPoS)

No explicit coverage of DPoS. Results focus on private blockchain protocols like PBFT, Raft, and PoET, excluding public DPoS details on energy or security[1].

## Key Tradeoffs from Recent Consensus Research (March 2026)

Search results emphasize private/permissioned blockchains over public PoW/PoS/DPoS, highlighting energy/security via performance metrics in adversarial vs. non-adversarial settings[1].

- **Energy/Performance Tradeoffs**:
  | Protocol | Throughput (TPS) | Latency | Energy Proxy (via Complexity) | Fault Tolerance |
  |----------|------------------|---------|-------------------------------|-----------------|
  | PBFT    | Medium (100s–1000s) | Very Low (<1 sec) | O(n²) messages (high energy in adversarial) | BFT |
  | Raft    | High (10K–50K) | Very Low (<1 sec) | O(n) messages (low energy in non-Byzantine) | CFT |
  | Kafka   | Very High (100K+) | Very Low (<1 sec) | O(n) (centralized, low energy) | CFT |
  | PoET    | High (10K+) | Very Low (<1 sec) | O(n), SGX-dependent (low but trusted hardware) | CFT - Trusted Hardware |
  | YAC     | Medium (10K+) | Low (<3 sec) | Medium permissioned (balanced) | BFT |
  | Paxos   | Medium (100s–1000s) | Very Low (<1 sec) | O(n) cluster-based (low-medium) | CFT | [1]

- **Security Insights**:
  - BFT protocols (PBFT, YAC) secure against Byzantine faults but incur higher O(n²) communication/energy costs[1].
  - CFT protocols (Raft, Kafka) offer low energy O(n) complexity but fail in adversarial environments (no Byzantine tolerance)[1].
  - PoET relies on trusted hardware (SGX) for security, reducing energy but introducing centralization risks[1].

**Sources**:
- [1] https://arxiv.org/html/2603.08629v1 (arXiv paper "Why No Consensus on Consensus?", March 2026, compares private protocols' energy via TPS/latency/complexity).
- [2] https://www.token2049.com/previous-sessions/token2049---boson-consensus-a-scalable-blockchain-sharding-consensus---qi-zhou-quarkchain (TOKEN2049 talk on Boson Consensus supporting multiple algos, no PoW/PoS/DPoS specifics).
- [3] https://arxiv.org/pdf/2603.08629 (PDF version of [1]).
- [4] https://ietresearch.onlinelibrary.wiley.com/doi/abs/10.1049/blc2.70034 (PoTS paper on energy inefficiencies, no direct PoW/PoS/DPoS data).

**Next Steps**:
- Review full arXiv paper [1] for public blockchain extensions (mentions PoW/PoS indirectly).
- Search "Bitcoin Ethereum PoW PoS energy consumption 2026" for updated public chain stats (e.g., Cambridge Bitcoin Electricity Consumption Index).
- Test DPoS in EOS/Arbitrum via their 2026 whitepapers for real TPS/energy benchmarks.
