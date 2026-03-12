# Retrospective — Sprint 253: Business Response System (Owners Reply to Reviews)

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 13
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura (Lead Engineer):** "The dual-map pattern gave us O(1) lookups for both response ID and review ID without any architectural gymnastics. Following our established module patterns meant Cole could focus on business logic instead of boilerplate. 38 tests in one sprint with zero flakiness -- the in-memory store keeps tests fast and deterministic."

**Cole Anderson (Backend):** "Content validation bounds (10-2000 chars) and the 1:1 review constraint caught edge cases at the module level, not the route level. That separation of concerns paid off immediately -- the route handlers are thin and readable. The tagged logger integration was a one-liner."

**Jordan Blake (Compliance):** "Having flag and hide as separate operations from day one is the right call. Too many platforms ship responses without moderation and then scramble to add it under regulatory pressure. We are ahead of the curve on DSA compliance here."

**Amir Patel (Architecture):** "Clean separation between business-responses.ts (domain logic) and routes-owner-responses.ts (HTTP layer) sets a good precedent. When we move to persistent storage, we only need to swap out the Map-based implementation -- the route layer stays untouched."

---

## What Could Improve

- The admin endpoints (flag/hide/stats) use requireAuth but do not verify admin email. Same gap as the city health routes -- should be addressed in Sprint 254 across all admin routes.
- No rate limiting on owner response creation. An owner could theoretically respond to thousands of reviews in rapid succession. Should add per-owner rate limits.
- The eviction logic (oldest response removed at MAX_RESPONSES) is simple but could remove a response that is still actively viewed. Need a smarter eviction strategy or persistent storage before scaling.
- No notification sent to the review author when a business responds. This is a key engagement feature that should be wired in when we build the frontend.

---

## Action Items

| Action | Owner | Target Sprint |
|--------|-------|---------------|
| Add isAdminEmail check to response admin routes | Nadia Kaur | 254 |
| Add per-owner rate limiting for response creation | Cole Anderson | 255 |
| Add reason field to flagResponse for compliance audit trail | Jordan Blake | 256 |
| Build frontend owner response compose UI | Sarah Nakamura | 256 |
| Notify review author when business responds | Cole Anderson | 257 |
| Evaluate persistent storage for responses | Amir Patel | 258 |

---

## Team Morale: 8/10

Solid sprint with well-scoped deliverables. The business response system fills a clear product gap and the team is energized about the Business Pro upsell potential Rachel outlined. No blockers, clean implementation, strong test coverage. The only tension is the growing list of "add admin email checks" action items -- the team wants a single sweep sprint to close that gap uniformly.
