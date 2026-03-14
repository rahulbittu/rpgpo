# Part 30: Provider Reliability Scoring + Cost/Latency Governance

## Overview

Part 30 adds operational governance for AI providers: reliability scoring from evidence, cost-aware routing, and latency-aware fallback decisions.

## Architecture

```
Provider Selection (registry + governance)
├── Provider Reliability (evidence-based health)
│   ├── Metrics: success/failure/retry/override/escalation rates
│   ├── Health: healthy / watch / degraded / unstable
│   └── Incidents: repeated failures, latency spikes, cost spikes
│
├── Cost Governance (budget-aware)
│   ├── Cost profiles per provider
│   ├── Budget windows from autonomy budgets
│   ├── Decisions: allow / warn / soft_block / hard_block / fallback
│   └── Free providers (Claude) always allowed
│
├── Latency Governance (SLA-aware)
│   ├── Latency profiles per provider
│   ├── Lane thresholds: dev 10s, beta 5s, prod 3s
│   ├── Decisions: proceed / warn / reroute / fallback / block
│   └── Local providers (Claude) always proceed
│
└── chooseProviderWithGovernance()
    └── Registry selection + reliability + cost + latency filtering
```
