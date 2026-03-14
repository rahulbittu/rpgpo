# Part 25: Exception Analytics + Governance Drift Detection + Adaptive Policy Tuning

## Overview

Part 25 closes the governance feedback loop: the system observes its own governance behavior, detects drift from intended policy, and recommends evidence-backed adjustments.

## Architecture

```
Governance State (overrides, enforcement, escalations, simulations, reviews)
  │
  ├── Exception Analytics
  │     ├── Harvests events from all governance modules
  │     ├── Aggregates by category, severity, lane, domain, provider
  │     └── Surfaces hotspots and trends
  │
  ├── Governance Drift Detection
  │     ├── Detects repeated overrides, chronic warnings, promotion blocks
  │     ├── Flags provider mismatches, documentation gaps, exception trends
  │     └── Produces drift signals and grouped reports
  │
  ├── Adaptive Policy Tuning
  │     ├── Generates recommendations: tighten, loosen, add, deprecate, rescope
  │     ├── Targets: policies, budgets, rules, docs, promotions, enforcement, provider fits
  │     ├── Evidence-backed with rationale, impact, risk
  │     └── Requires explicit operator approval before applying
  │
  └── Governance Health Snapshot
        ├── Exception count, drift signals, pending tuning
        ├── Override rate, enforcement block rate
        └── Health: healthy / drifting / degraded / critical
```

## Key Principle

All analytics are read-only. All drift detection is observational. All tuning recommendations are advisory until explicitly approved by the operator. Nothing auto-applies.
