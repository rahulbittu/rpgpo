# Retro 558: Centralized Threshold Config

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Long-standing pain point resolved. The threshold redirect overhead was flagged in 4 consecutive retros. Now it's a single JSON edit per sprint — no more hunting through old test files."

**Amir Patel:** "The dynamic test generation pattern is elegant. Adding a new file to track is just adding a JSON entry — file-health.test.ts automatically creates the assertion. Zero new code needed."

**Sarah Nakamura:** "26 new tests from two files. The file-health.test.ts alone contributes 15 dynamic tests. This pattern could be extended to check for other health metrics (import depth, circular dependencies)."

## What Could Improve

- **Old per-sprint threshold tests still exist** — They won't cause conflicts (they have their own thresholds) but they're now redundant. Gradual deprecation over future sprints.
- **thresholds.json is manually maintained** — A CI script could auto-update `current` values on each build. Currently requires manual updates.
- **No migration script** — Didn't create a script to update old tests to reference thresholds.json. That's intentional — old tests serve as sprint contracts.

## Action Items

- [ ] Sprint 559: Dashboard hours pre-fill + photo carousel caching — **Owner: Sarah**
- [ ] Sprint 560: Governance (SLT-560 + Arch Audit #70 + Critique) — **Owner: Sarah**
- [ ] Consider CI auto-update for thresholds.json current values — **Owner: Amir**

## Team Morale
**9/10** — Process debt cleared. The team has been requesting this since Sprint 549. Clean implementation with zero test breakage.
