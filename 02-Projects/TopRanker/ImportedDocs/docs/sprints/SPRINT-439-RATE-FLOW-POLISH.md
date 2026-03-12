# Sprint 439: Rate Flow UX Polish — Dimension Tooltips

**Date:** 2026-03-10
**Type:** Feature — Conversion Optimization
**Story Points:** 2

## Mission

Add dimension tooltips to the rating flow that explain what each scoring dimension means, its weight in the composite score, and provide example questions to guide users. Reduces friction for first-time raters by making the scoring criteria transparent. Directly supports Constitution #6 (Credibility is Transparent) and Rating Integrity's visit type separation.

## Team Discussion

**Marcus Chen (CTO):** "First-time raters often don't know what 'Service' or 'Vibe & Atmosphere' actually means in our scoring context. The tooltips with weight percentages and example questions reduce cognitive load and increase completion rates. This is subtle but high-value conversion optimization."

**Priya Sharma (Design):** "The info icon is small and non-intrusive — it doesn't clutter the scoring interface. Tapping it reveals a card with weight badge, description, and italic examples. Only one tooltip can be active at a time (tapping another closes the first). The amber highlight on the active icon draws attention without being distracting."

**Sarah Nakamura (Lead Eng):** "The tooltip data lives in VisitTypeStep.tsx alongside getDimensionLabels — same file, same source of truth. The DIMENSION_TOOLTIPS record mirrors the Rating Integrity doc's visit type weights exactly: dine-in 50/25/25, delivery 60/25/15, takeaway 65/20/15. Single state variable (activeTooltip) with null=closed, 0/1/2=which dimension."

**Amir Patel (Architecture):** "VisitTypeStep grew from 110 to 216 LOC — still well-proportioned for tooltip data + component. rate/[id].tsx grew from 554 to 567 LOC (81% of threshold). The labelWithTooltip wrapper style is clean — flexDirection row with gap 6."

**Rachel Wei (CFO):** "Rating completion rate is our most important conversion metric. Every user who starts a rating but abandons due to confusion is a lost signal. Tooltips are the cheapest possible intervention for this."

**Nadia Kaur (Security):** "No new data exposure. Tooltip content is static text embedded in the client. No API calls, no user data involved."

## Changes

### Modified Files
- `components/rate/VisitTypeStep.tsx` (110→216 LOC) — Added DIMENSION_TOOLTIPS data (3 visit types × 3 dimensions with label/description/weight/examples), getDimensionTooltips(), DimensionTooltipData interface, DimensionTooltip component with toggle/card UI
- `app/rate/[id].tsx` (554→567 LOC) — Import getDimensionTooltips + DimensionTooltip, activeTooltip state, wrap dimension labels with tooltip icons, labelWithTooltip style
- `__tests__/sprint411-visit-type-extraction.test.ts` — Updated import assertion for expanded import line

### Test Files
- `__tests__/sprint439-rate-flow-polish.test.ts` — 35 tests: tooltip data structure, visit-type-specific content (weights verified), DimensionTooltip component, rate flow integration, file health

## Tooltip Content

### Dine-in (50/25/25)
| Dimension | Weight | Examples |
|-----------|--------|----------|
| Food Quality | 50% | Was the biryani flavorful? Was the naan fresh? |
| Service | 25% | Were you greeted? Was water refilled? How long did you wait? |
| Vibe & Atmosphere | 25% | Was it clean? Good lighting? Comfortable seating? |

### Delivery (60/25/15)
| Dimension | Weight | Examples |
|-----------|--------|----------|
| Food Quality | 60% | Was the food still hot? Did flavors hold up during transit? |
| Packaging Quality | 25% | No spills? Containers sealed? Food separated properly? |
| Value for Money | 15% | Fair portions? Worth the delivery premium? |

### Takeaway (65/20/15)
| Dimension | Weight | Examples |
|-----------|--------|----------|
| Food Quality | 65% | Was the food ready and hot? Fresh ingredients? |
| Wait Time Accuracy | 20% | Was it ready on time? Did you wait long? |
| Value for Money | 15% | Fair portions? Good value compared to dine-in? |

## Test Results
- **334 files**, **7,985 tests**, all passing
- Server build: **608.6kb**, 31 tables
- 1 test file update (sprint411 import assertion)
