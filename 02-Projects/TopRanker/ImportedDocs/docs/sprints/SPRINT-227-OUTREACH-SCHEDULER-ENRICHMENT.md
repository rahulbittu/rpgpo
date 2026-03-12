# Sprint 227 — Owner Outreach Scheduler + Google Place Enrichment + Beta Badge UI

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

---

## Mission Alignment

Sprint 227 automates the B2B revenue pipeline. The outreach scheduler auto-sends Pro upgrade emails to qualified claimed businesses weekly. Google Place enrichment links seed data to Google's ecosystem for photo imports. The CityBadge component visually distinguishes beta markets.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The outreach scheduler follows the same setInterval pattern as drip-scheduler and notification-triggers. Weekly on Wednesdays, 10am UTC. Per-business error isolation. It queries claimed businesses with 10+ ratings, no Pro subscription, and sends the upgrade email."

**David Okonkwo (VP Product):** "Google Place enrichment is critical for OKC. Seed data has no photos from Google — just Unsplash placeholders. The enrichment script fetches Place IDs, ratings, and photo references. Run it once for OKC, and all 10 businesses get real Google data."

**Jasmine Taylor (Marketing):** "CityBadge is small but important for user trust. When OKC shows in the city picker, the amber 'BETA' badge sets expectations. Users know it's new, which explains fewer ratings."

**Marcus Chen (CTO):** "4 schedulers now: challenger hourly, weekly digest, daily drip, weekly outreach. All follow the same setTimeout/setInterval pattern with graceful shutdown cleanup. Consistent infrastructure."

**Rachel Wei (CFO):** "The outreach scheduler is our automated B2B engine. Every Wednesday it scans for qualified businesses and sends Pro upgrade emails. At $49/mo conversion, each send is a potential $588 ARR."

**Nadia Kaur (Security):** "Google Place enrichment uses the same API key pattern as google-places.ts. Rate limited with 200ms delays. No PII exposure — just business metadata."

**Amir Patel (Architecture):** "Scheduler count is 4 now. All in server/, all under 100 LOC, all following the same pattern. No consolidation needed yet — they run at different intervals and serve different purposes."

---

## Deliverables

### Owner Outreach Scheduler (`server/outreach-scheduler.ts`)
- Weekly on Wednesdays at 10am UTC
- Scans claimed businesses with ownerId, no Pro subscription, 10+ ratings
- Sends sendOwnerProUpgradeEmail with owner's email, business stats
- Logs unclaimed business candidates for manual outreach
- Wired into index.ts with graceful shutdown

### Google Place Enrichment (`server/google-place-enrichment.ts`)
- findGooglePlaceId(name, city) — calls Google Places Text Search API
- enrichBusinesses(city?) — batch-enriches businesses with null googlePlaceId
- 200ms delay between API calls, per-business error isolation
- CLI runner: `npx tsx server/google-place-enrichment.ts "Oklahoma City"`

### City Badge Component (`components/CityBadge.tsx`)
- Renders amber "BETA" badge for beta cities
- Renders gray "COMING SOON" for planned cities
- Returns null for active/unknown cities
- Uses getCityBadge() from shared/city-config.ts

---

## Tests

- **25 new tests** in sprint227-outreach-scheduler-enrichment.test.ts
- **Full suite:** 4,163+ tests across 157 files, all passing
