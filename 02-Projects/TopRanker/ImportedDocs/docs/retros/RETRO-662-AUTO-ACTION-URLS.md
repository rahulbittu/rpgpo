# Retro 662: Auto-Fetch Action URLs

**Date:** 2026-03-11
**Duration:** 8 min
**Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well
- **Jasmine Taylor:** "Every business page now has DoorDash/UberEats/Menu/Maps buttons from day one. No owner input required. This makes the product feel complete."
- **Amir Patel:** "Clean architecture. Enrichment is lazy (on first view), cached (stored in DB), and non-blocking (fire-and-forget). No performance impact."
- **Marcus Chen:** "This is exactly what the CEO asked for. Pull data from APIs, don't wait for owners. The constructed search URLs are a smart fallback."
- **Nadia Kaur:** "No new API keys needed. Reuses existing Google Maps API key. DoorDash/Uber Eats links are public search URLs, no auth required."

## What Could Improve
- DoorDash/UberEats search URLs may not always find the exact restaurant. Consider scraping or using their APIs for exact deep links in a future sprint.
- Should add a rate limit on the Google Places enrichment to avoid hitting API quotas when many businesses are viewed.
- The enrichment only triggers on business detail view — should consider a batch enrichment job for all businesses.

## Action Items
- [ ] Consider batch enrichment cron job for all businesses with googlePlaceId (Owner: Amir)
- [ ] Investigate DoorDash/Uber Eats affiliate APIs for exact deep links (Owner: Rachel)
- [ ] Add Google Places API quota monitoring (Owner: Nadia)

## Team Morale
9/10 — High-impact feature that makes every business page useful. CEO-requested, delivered same day.
