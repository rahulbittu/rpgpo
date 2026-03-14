# Part 32: Enterprise Audit Hub + Compliance Export + Policy History

## Overview
Part 32 adds enterprise-grade audit, compliance export, and policy versioning on top of the artifact registry, evidence chain, and traceability ledger.

## Architecture
```
Audit Hub → filtered views over registry + ledger + evidence
Compliance Export → deterministic scoped bundles (graph/dossier/project/release)
Policy History → version tracking + change records + diffs for all policy types
```

## Key Principle
Everything auditable. Everything exportable. Every policy change versioned.
