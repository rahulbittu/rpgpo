# Retro 468: Dimension Tooltip Scoring Tips

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Score calibration is a subtle but important rating integrity improvement. If two users both understand '10 = exceptional dish you'd recommend,' their 10s mean the same thing. This improves the signal quality of every rating submitted."

**Amir Patel:** "Minimal code change, maximal UX impact. One new field, 9 strings, one render line, one style. The existing DimensionTooltip component and tooltip data structure were designed to be extensible, and this sprint proved it."

**Sarah Nakamura:** "The 10/5/1 anchor format tested well in concept. Users immediately understand the scale when given concrete examples at the endpoints and midpoint."

## What Could Improve

- **No A/B testing** — We can't measure whether scoring tips actually reduce score variance. Would need before/after analysis of score distribution per dimension.
- **Tips are long** — Some scoring tips are ~80 characters. On smaller screens, the tooltip card might get crowded with description + examples + scoring tip. Consider collapsible sections.
- **Static tips** — The scoring tips are hardcoded. In the future, they could be generated based on the specific business type or cuisine.

## Action Items

- [ ] Begin Sprint 469 (Search filter presets) — **Owner: Sarah**
- [ ] Analyze score distribution variance before/after scoring tips — **Owner: Marcus** (post-launch)
- [ ] Consider collapsible tooltip sections for smaller screens — **Owner: Amir** (low priority)

## Team Morale
**8/10** — Good sprint. The scoring tips fill a real gap in the rating UX. Users now have guidance at the point of decision. The team is energized by the quality-of-life improvements across the rating flow this cycle.
