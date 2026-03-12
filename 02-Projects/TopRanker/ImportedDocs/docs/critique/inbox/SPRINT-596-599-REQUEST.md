# SPRINT 596-599 External Critique Request

**Date:** 2026-03-11
**Submitted by:** Sarah Nakamura (Lead Eng)
**Sprints covered:** 596 (test helper), 597 (schema compression), 598 (search.tsx compression), 599 (dashboard extraction)

## Context

Four maintenance/compression sprints. No functional changes to the product. Focus was on freeing LOC headroom across critical files and reducing test authoring friction. Combined with sprints 591-594, this makes 8 consecutive non-user-facing sprints.

## Previous Critique Response Incorporated

The 591-594 critique request is pending response. Questions covered: git-committed dist assets, asymmetric moderation accountability, threshold ceiling management, build size trajectory, and core-loop focus drift.

## 5 Questions for External Review

### 1. Compression vs Extraction
Sprints 597-598 compressed files by removing comments (schema: -42 LOC, search: -28 LOC). Sprint 599 extracted a component (-105 LOC). Comment removal is zero-risk but the headroom is artificial — the code complexity is unchanged. Is comment stripping a legitimate capacity management strategy, or should we only count structural extraction (component/function moves) as real headroom?

### 2. Dead Code Lifecycle
Sprint 599 removed MiniChart, dead since Sprint 487 (112 sprints ago). The retro flagged it for removal but no one acted for 112 sprints. How should dead code flagging work? Options: (a) lint rule for unused local functions, (b) dead code section in arch audits, (c) automated detection via coverage analysis.

### 3. Infrastructure Sprint Streak
8 consecutive infrastructure sprints (591-599): build optimization, pHash persistence, deployment, moderation UX, test helper, 3x compression. No user-facing rating loop improvements. SLT-600 mandates return to core loop in Sprint 602. Is 8 infrastructure sprints defensible given we were capacity-constrained and deploying for the first time, or did the team use infrastructure as an avoidance pattern?

### 4. Test Helper Adoption Strategy
Sprint 596 created shared test utilities (readFile, countLines, etc.) to address 977 duplications across 162 test files. Strategy: adopt in new tests, no bulk migration. The critique of 586-589 flagged test churn as a problem. Is "adopt forward" sufficient, or should we invest a sprint in bulk migration to prevent ongoing duplication?

### 5. Threshold Policy Post-Compression
After 3 compression sprints, tracked files now have 50-123 lines of headroom (vs 2-17 before). Should we: (a) lower ceilings to the new post-compression levels (preventing bloat regrowth), (b) keep current ceilings (preserving headroom for feature work), or (c) remove ceilings on compressed files and rely on arch audits for growth monitoring?
