# Retro 569: Credibility Breakdown Tooltip

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Fourth consecutive feature sprint. The breakdown data was already flowing from the server — we just weren't rendering it. Classic case of the UI catching up to the data layer. Zero new endpoints, zero schema changes."

**Jordan Blake:** "Credibility transparency is our competitive moat. Yelp doesn't explain why reviews are weighted. Google doesn't show you your influence. We do. This tooltip makes that concrete."

**Amir Patel:** "The CredibilityBreakdown interface now has a proper TypeScript definition instead of `any`. This improves type safety across the profile data pipeline. Clean incremental improvement."

## What Could Improve

- **No animation on individual bars** — The bars could animate from 0 to their width when the tooltip opens. Would make the reveal more engaging.
- **No factor comparison to average** — Could show "You: +18, Avg: +12" for each factor to give context. Requires a new API endpoint for average breakdown.
- **Tooltip position is fixed** — On small screens, the tooltip pushes content down significantly. Could use a modal or bottom sheet instead.

## Action Items

- [ ] Sprint 570: Governance (SLT-570 + Audit #72 + Critique) — **Owner: Sarah**
- [ ] Consider bar entrance animations (future sprint) — **Owner: Sarah**
- [ ] Evaluate average breakdown comparison endpoint — **Owner: Amir** (future)

## Team Morale
**9/10** — Four feature sprints in a row (566-569). The credibility tooltip directly implements Constitution principle #6. The team is proud of building transparency features that differentiate us from competitors.
