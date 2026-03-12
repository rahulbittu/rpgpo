# Critique Request — Sprints 746-749

**Date:** 2026-03-12
**Requesting:** External critique of hardening cycle completion + launch readiness

---

## Context

Sprints 746-749 completed the second wave of security hardening. Combined with 741-745, this represents 9 consecutive sprints of systematic code quality improvement without any new features. The team believes the codebase is now production-ready.

**Key numbers:** 12,920 tests, 664.3kb build, 34 tracked files, 22+ pre-submit checks, 0 known security findings.

---

### 1. Diminishing Returns on Hardening

The team spent 9 sprints on hardening (741-749). At what point does continued internal hardening become avoidance of external validation? Is there a risk that the team is polishing the engine while the car hasn't left the garage? What signals would indicate it's time to stop hardening and ship?

### 2. Pre-Submit vs CI

Sprint 748 added 7 checks to `scripts/pre-submit-check.sh`, bringing it to 22+ checks. But this script runs manually — it's not in CI. Is a manual deployment gate sufficient for a production app, or does the lack of CI automation represent a meaningful gap? What's the cost/benefit of CI integration before beta vs after?

### 3. Boolean Strictness as Security Layer

Sprint 746 introduced `=== true` validation for `isReceipt` and anti-gaming flags (q1-q5). This prevents truthy string exploitation. Is this the right level of defense, or should we consider schema validation (e.g., Zod) at the API boundary instead of per-field checks? Does the per-field approach scale as the API surface grows?

### 4. Threshold Governance Drift

Sprint 749 revealed that thresholds.json had drifted by 17% on test count (10,800 → 12,800 actual). The file count also drifted (33 → 34). Should threshold updates be automated (e.g., a script that reads actual values and updates the JSON), or does manual updating serve as a useful forcing function for the team to review what changed?

### 5. Single-Developer Bus Factor

All 9 hardening sprints were executed by one developer in one session. The sprint docs include team discussions, but the code was written by a single agent. What are the risks of this approach as the product moves toward production? How should the team prepare for handoff or onboarding of additional contributors?
