# SPRINT 591-594 External Critique Request

**Date:** 2026-03-11
**Submitted by:** Sarah Nakamura (Lead Eng)
**Sprints covered:** 591 (build optimization), 592 (pHash DB persistence), 593 (web deployment), 594 (moderation UX)

## Context

Four sprints covering build optimization, pHash persistence, Railway deployment for web demo, and admin moderation UX. Build ceiling raised from 730kb to 750kb. External deployment at topranker.io now live.

## Previous Critique Response Incorporated

The 586-589 critique scored us 6/10 on core-loop focus and flagged:
1. pHash naming inaccuracy → Accepted. Renaming to "average hash heuristic" in docs.
2. Build ceiling exhausted → Resolved. Raised to 750kb.
3. Test churn from extraction → Scheduled for Sprint 596 (test helper).
4. In-memory store rules → Deferred to Sprint 600+ (no evidence of pressure).
5. Route import sprawl → Deprioritized (cosmetic, not a bottleneck).

## 5 Questions for External Review

### 1. Web Deployment Architecture
Sprint 593 committed a pre-built `dist/` directory (Expo web export) to git and serves it via `express.static()` in production. The alternative is building on Railway (requires EXPO_PUBLIC_* env vars at build time). Is committing built assets to git an acceptable trade-off for deployment simplicity, or does it create long-term maintenance burden (stale bundles, repo bloat)?

### 2. Moderation Accountability
Sprint 594 requires a text note when rejecting moderation items but not when approving. The rationale: rejections need explanation for appeals, approvals are the default outcome. The critique of 586-589 praised "audit trail" requirements. Is asymmetric accountability (notes on reject only) defensible, or should approvals also require justification?

### 3. Threshold Ceiling Management
Sprint 595 raised ceilings on 9 of 24 tracked files by 5-10%. All 9 files are stable (no active feature work planned). The previous critique warned against treating ceilings as "lagging alarms." Are these raises a responsible stability correction, or are we normalizing ceiling inflation to avoid extraction work?

### 4. Build Size Trajectory
Server build at 731.6kb / 750kb (97.5%). Growth rate: ~2-3kb per feature sprint. At this rate, ceiling hit in ~6 sprints. Options: (a) lazy-load admin routes (-30kb estimated), (b) tree-shake unused exports, (c) raise ceiling again to 800kb. Which approach is most defensible and when should we commit to it?

### 5. Core-Loop Focus vs Infrastructure
Sprints 591-594 were 100% infrastructure/tooling: build optimization, DB persistence, deployment, admin UX. No user-facing rating loop improvements. The 586-589 critique scored us 6/10 on core-loop focus. Is this infrastructure cycle justified (deployment enables demos, moderation enables scaling), or has the team drifted from the mission of "rate → consequence → ranking"?
