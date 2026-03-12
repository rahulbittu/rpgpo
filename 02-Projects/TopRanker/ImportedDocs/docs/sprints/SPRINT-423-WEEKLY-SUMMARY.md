# Sprint 423: Rankings Weekly Summary Card

**Date:** 2026-03-10
**Type:** Enhancement — Rankings UX
**Story Points:** 3

## Mission

Add a weekly summary card to the Rankings tab showing leaderboard movement at a glance: how many businesses climbed or dropped, new entries, and the top climber. This gives users immediate context about ranking dynamics before they scroll through the list.

## Team Discussion

**Priya Sharma (Design):** "The card sits between the welcome banner and the hero card — prime real estate. Green for climbers, red for drops, amber for new entries. The flame icon on the top climber creates urgency and engagement."

**Amir Patel (Architecture):** "computeWeeklySummary is a pure function that derives everything from rankDelta on MappedBusiness. No new API calls needed — we're just presenting existing data more effectively. The card self-hides when there's zero movement."

**Sarah Nakamura (Lead Eng):** "WeeklySummaryCard is 107 LOC in its own file. RankingsListHeader grew from 248→255 LOC with the import and render. index.tsx only needed +1 line to pass the businesses prop. Zero `as any` casts — used IoniconsName type from ComponentProps."

**Marcus Chen (CTO):** "This makes rankings feel alive. Users see 'Halal Guys climbed 3 spots' and immediately want to know why. It drives engagement deeper into the detail pages."

**Jasmine Taylor (Marketing):** "Perfect for WhatsApp shares. 'This week in Dallas: 5 restaurants climbed, 2 new entries.' Weekly movement data is inherently shareable content."

**Rachel Wei (CFO):** "No infrastructure cost — pure client-side computation from existing data. High engagement potential at zero marginal cost."

## Changes

### New Files
- `components/leaderboard/WeeklySummaryCard.tsx` (107 LOC) — WeeklySummary interface, computeWeeklySummary function, StatPill helper, WeeklySummaryCard component

### Modified Files
- `components/leaderboard/RankingsListHeader.tsx` (248→255 LOC, +7) — Import WeeklySummaryCard, added businesses prop, render card before hero
- `app/(tabs)/index.tsx` (421→422 LOC, +1) — Pass businesses={filteredBiz} to RankingsListHeader

### Test Files
- `__tests__/sprint423-weekly-summary.test.ts` — 24 tests: component structure, computeWeeklySummary logic, stat pills, top climber, integration, file health

## Test Results
- **322 files**, **7,654 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades
- 0 `as any` casts added (used IoniconsName type)

## File Health After Sprint 423

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 684 | 800 | 85.5% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 422 | 600 | 70.3% | +1 | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
