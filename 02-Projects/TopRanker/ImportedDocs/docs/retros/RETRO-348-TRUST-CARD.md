# Retrospective — Sprint 348

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The confidence badge is the most user-facing trust improvement since the trust explainer was introduced. Users can now glance at the badge to know how reliable a ranking is."

**Jordan Blake:** "Trusted rater count is the right level of transparency — aggregate, not individual. No privacy concerns, but meaningful trust signal."

**Sarah Nakamura:** "Clean prop extension. Both new props are optional, so no breaking changes anywhere in the codebase."

## What Could Improve

- **No animation on confidence badge** — Consider a subtle pulse or fade-in for the badge to draw attention.
- **lastRatedDate computed inline** — The `new Date(ratings[0].createdAt).toLocaleDateString(...)` is done at render time. Could be memoized if the ratings array is large.
- **Trusted rater count depends on client-side filtering** — We're filtering ratings by userTier on the client. For businesses with many ratings, this should ideally be a server-computed field.

## Action Items
- [ ] Sprint 349: Profile saved places improvements
- [ ] Sprint 350: SLT Review + Arch Audit #52
- [ ] Future: Server-side trusted rater count computation

## Team Morale: 8/10
Strong trust-focused sprint. The confidence badge and trusted rater count make the trust story much more visible.
