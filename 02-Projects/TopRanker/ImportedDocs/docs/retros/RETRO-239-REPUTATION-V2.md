# Retrospective — Sprint 239

**Date**: 2026-03-09
**Duration**: 1 session
**Story Points**: 8
**Facilitator**: Sarah Nakamura

---

## What Went Well

**Marcus Chen**: "The 7-signal weight vector with explicit normalization thresholds
gives us something we have never had: an explainable reputation model. When a user
asks 'why does my vote count less?', we can point to specific signals and thresholds.
This is a major step toward the TrustMe brand promise of transparent rankings."

**Sarah Nakamura**: "The implementation landed in under 120 lines of core logic. The
normalization function is a simple switch statement — easy to read, easy to test, easy
to extend. The test suite covers both boundary conditions (zero signals, max signals)
and the negative penalty path. Integration into routes.ts was the usual two-line change."

**Amir Patel**: "The weight sum invariant test is a great example of property-based
testing embedded in a unit test suite. If anyone changes signal weights without
rebalancing, the test catches it immediately. The contiguous tier threshold test is
another structural invariant that prevents gaps in the tier assignment logic."

**Jasmine Taylor**: "The tier naming is immediately usable for marketing. I can start
designing badge assets and tier-upgrade email templates without waiting for another
sprint. The naming convention — newcomer to authority — maps cleanly to our user
journey narrative."

---

## What Could Improve

- **No auth on admin reputation endpoints** — Following the same pattern as claim
  verification routes, the reputation admin routes lack requireAuth middleware. This
  needs to be addressed before production deployment, consistent with Nadia's Sprint
  238 action item for a unified admin auth pass.
- **Linear normalization may undervalue mid-range contributors** — The linear scaling
  from 0 to threshold means a member with 25 ratings gets exactly 0.5 normalized score.
  A logarithmic curve might better reward the jump from 0 to 10 ratings vs 40 to 50.
  Worth revisiting once we have real distribution data.
- **No persistence** — In-memory cache with FIFO eviction means reputation scores are
  lost on server restart. Acceptable for beta but needs database backing before launch.

---

## Action Items

| Action | Owner | Sprint |
|--------|-------|--------|
| Unified admin auth middleware pass (reputation + claims + rate limits) | Nadia Kaur | 240 |
| Tier badge designs and color palette | Jasmine Taylor | 240 |
| Tier progression UI in onboarding flow | Cole Anderson | 240 |
| Evaluate logarithmic normalization curves | Sarah Nakamura | 241 |
| Revenue model for tier-based upsell | Rachel Wei | 241 |

---

## Team Morale

**8/10** — Strong sprint delivering core infrastructure that the entire team recognizes
as foundational. The reputation engine is the kind of feature that touches every part
of the product — rankings, profiles, marketing, revenue — and the team feels aligned
on its importance. The recurring admin auth gap is a minor frustration, but having a
unified fix planned for Sprint 240 keeps confidence high.
