# Sprint 468: Dimension Tooltip Scoring Tips

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Enhance dimension tooltips in the rating flow with scoring guidance. When users tap the info icon next to a dimension (Food Quality, Service, etc.), the tooltip now includes a "scoring tip" — a concrete 10/5/1 scale anchor that helps users understand what each score means for that specific dimension and visit type.

## Team Discussion

**Marcus Chen (CTO):** "This directly addresses a key insight from our rating integrity research: users interpret score scales differently. One person's 7 is another's 9. By anchoring with concrete examples — '10 = exceptional dish you'd recommend' — we calibrate user understanding. This makes scores more comparable across raters."

**Amir Patel (Architect):** "Clean addition: one new field (`scoringTip`) on the existing `DimensionTooltipData` interface, 9 new data strings (3 dimensions × 3 visit types), one new UI element, one new style. No new components, no new state, no API changes."

**Rachel Wei (CFO):** "Score calibration is one of those invisible quality improvements. Users won't know why their ratings feel more meaningful, but the aggregate data quality improves. This makes our leaderboard rankings more accurate, which is the core product."

**Sarah Nakamura (Lead Eng):** "The 10/5/1 format was chosen because it's the same format users see on the slider. '10 = exceptional' maps directly to sliding to 10. '5 = average, nothing special' maps to the midpoint. '1 = inedible' maps to the bottom. No cognitive translation needed."

**Jasmine Taylor (Marketing):** "When we show example ratings in campaigns, the scoring tips help new users understand the system immediately. 'What does a 7 mean?' becomes obvious when you see '10 = felt like a VIP, 5 = functional but forgettable.'"

## Changes

### Modified: `components/rate/VisitTypeStep.tsx` (+15 LOC)
- Added `scoringTip: string` to `DimensionTooltipData` interface
- Added 9 scoring tips across all visit types:
  - Dine-in: food (exceptional→inedible), service (VIP→ignored), vibe (perfect→dirty)
  - Delivery: food (hot→cold), packaging (intact→spills), value (great deal→overpriced)
  - Takeaway: food (hot→stale), wait (on time→30+ min), value (saves time→overpriced)
- Added `{tooltip.scoringTip}` render in DimensionTooltip component
- Added `tooltipScoringTip` style: amber text, separated by a subtle divider

## Test Coverage
- 14 tests across 4 describe blocks
- Validates: field definition, content per visit type, UI rendering, docs
