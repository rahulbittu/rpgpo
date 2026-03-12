# Sprint 678 — Service Flags Display

**Date:** 2026-03-11
**Theme:** Service Flags on Business Page
**Story Points:** 3

---

## Mission Alignment

Google Places enrichment (Sprint 671) already fetches 5 service flags — breakfast, lunch, dinner, beer, wine — but they weren't stored or displayed. This sprint adds the schema columns, saves them during enrichment, and displays them as pill-shaped chips on the business detail page. Users can instantly see what a restaurant serves without scrolling through hours or descriptions.

---

## Team Discussion

**Marcus Chen (CTO):** "This completes the enrichment pipeline from API fetch through database storage to UI display. The data was already being fetched in Sprint 671 but discarded — now it flows all the way through."

**Amir Patel (Architecture):** "Five boolean columns add 5 LOC to the schema, bringing it to 910/950. Still healthy headroom. The enrichment function update is minimal — just passing through what we already had."

**Sarah Nakamura (Lead Eng):** "The service flags row uses Ionicons with the amber brand color — sunny for breakfast, restaurant for lunch, moon for dinner, beer and wine icons. Pill-shaped chips with cardDark background. Only renders if at least one flag is true, so empty data doesn't waste space."

**Jasmine Taylor (Marketing):** "This is a user-facing win. When someone opens a business page and immediately sees 'Breakfast · Lunch · Dinner · Beer · Wine' in visual chips, it answers 'what do they serve?' without any extra taps. Great for decision-making."

**Rachel Wei (CFO):** "No additional API cost — we're already paying for the Places API call. This is pure value extraction from data we already fetch."

---

## Changes

### Schema

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `serves_breakfast` | boolean | false | From Google Places |
| `serves_lunch` | boolean | false | From Google Places |
| `serves_dinner` | boolean | false | From Google Places |
| `serves_beer` | boolean | false | From Google Places |
| `serves_wine` | boolean | false | From Google Places |

### Modified Files

| File | Delta | Change |
|------|-------|--------|
| `shared/schema.ts` | +5 | 5 boolean columns on businesses table |
| `server/google-places.ts` | +5 | Save service flags in enrichBusinessFullDetails |
| `app/business/[id].tsx` | +12 | Service flags row with Ionicons + pill chips |
| `__tests__/sprint619-build-pruning.test.ts` | threshold | Build size ceiling 660→665kb |
| `__tests__/sprint589-business-detail-extraction.test.ts` | threshold | Business page LOC 420→435 |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 660.9kb / 750kb (88.1%) |
| Tests | 11,763 pass / 502 files |
| Schema | 910 / 950 LOC |
| Tracked files | 33, 0 violations |

---

## What's Next (Sprint 679)

Rating reminder notification — prompt users to rate a place they visited yesterday.
