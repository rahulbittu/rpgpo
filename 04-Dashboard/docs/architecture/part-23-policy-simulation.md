# Part 23: Policy Simulation + Governance Testing + Release Readiness

## Overview

Part 23 adds three capabilities that let the operator preview governance outcomes before committing:

1. **Policy Simulation** — Run governance checks under any lane/override scenario
2. **Governance Testing** — Reusable what-if test cases for graphs and dossiers
3. **Release Readiness Scoring** — Multi-category scoring with blockers/warnings/recommendation

## Flow

```
Entity (graph/dossier/release)
  │
  ├── Policy Simulation → pass / warn / block
  │     └── Checks: policies, budgets, escalation, docs, reviews
  │
  ├── Governance Tests → N test cases, each pass/fail
  │     └── Built-in: beta sim, prod sim, missing docs, low confidence, strict review, failed review
  │
  └── Release Readiness → score 0-100, recommendation
        └── Categories: policy, reviews, docs, escalation, providers, mission, risks
```

## Integration

- Simulation + readiness attach to execution graph panels
- Dossier API exposes `/simulate` and `/readiness` endpoints
- Memory Viewer exposes simulation results and readiness scores
- Chief of Staff orchestrates all three through unified methods
