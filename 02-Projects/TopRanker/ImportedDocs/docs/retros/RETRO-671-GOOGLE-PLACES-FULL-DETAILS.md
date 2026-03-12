# Retro 671: Google Places Full Details Enrichment

**Date:** 2026-03-11
**Duration:** 6 min
**Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well
- **Amir Patel:** "The Google Places API (New) field mask system is clean. One request gives us 7 fields. The 24-hour cache TTL balances freshness with API cost."
- **Sarah Nakamura:** "Fire-and-forget pattern from Sprint 662 worked perfectly again. The user never waits for the enrichment — it happens in the background."
- **Rachel Wei:** "At $17/1000 requests with 24h caching, this feature costs almost nothing. Real business value for pennies."
- **Marcus Chen:** "Real-time 'OPEN NOW' status is a killer feature for local discovery. This puts us ahead of static directory apps."

## What Could Improve
- Google Places API doesn't provide structured menu data (individual dishes + prices). We're using the website URL as a menu fallback, which isn't ideal.
- Service flags (servesBreakfast, servesBeer, etc.) are fetched but not stored or displayed yet. Should add a "Features" section to business cards.
- The batch admin endpoint has no progress indicator — admin hits the button and waits.

## Action Items
- [ ] Display service flags (breakfast/lunch/dinner/beer/wine) on business profile (Owner: Sarah, future sprint)
- [ ] Add progress indicator to admin batch enrichment (Owner: Amir, future sprint)
- [ ] Research third-party menu APIs for structured dish data (Owner: Amir, future sprint)

## Team Morale
8/10 — Solid enrichment sprint. The auto-refresh pattern is clean and efficient. Ready for more Google Places integration.
