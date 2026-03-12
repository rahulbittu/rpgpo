# Sprint 224 — Oklahoma City Seed Data + Email Tracking

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

---

## Mission Alignment

Sprint 224 expands TopRanker's geographic footprint to Oklahoma City — our first market outside Texas. The beta launch tests our expansion playbook: seed 10 curated restaurants, activate the city in beta, monitor engagement. Email delivery tracking enables data-driven optimization of our entire email pipeline.

---

## Team Discussion

**David Okonkwo (VP Product):** "OKC is the ideal first expansion market. It's close to DFW culturally, shares the Central time zone, and has a thriving food scene. 10 seed businesses cover all 6 categories — restaurant, cafe, bar, bakery, street_food, fast_food. Beta status means it shows in the city picker but with a 'Beta' badge."

**Marcus Chen (CTO):** "Beta status in city-config.ts means getActiveCities() won't include OKC yet, but a new getBetaCities() query would. This gives us a clean launch gate — flip to 'active' when engagement metrics hit threshold."

**Jasmine Taylor (Marketing):** "Email tracking is the missing link. We send 5 drip emails, 3 owner outreach templates, and weekly digests — but we've been blind on opens and clicks. trackEmailSent/Opened/Clicked gives us the funnel visibility to optimize subject lines and CTAs."

**Rachel Wei (CFO):** "OKC is a low-cost expansion test. Seed data costs nothing. If we see 50+ signups in week 1, that validates our expansion model for New Orleans, Memphis, and beyond."

**Sarah Nakamura (Lead Eng):** "The seed-cities.ts pattern scales perfectly. Each city is an array of SeedBusiness objects, spread into ALL_CITY_BUSINESSES. Adding a city is adding an array. The FIFO store in email-tracking.ts caps at 1000 events — sufficient for analytics without memory pressure."

**Nadia Kaur (Security):** "Email tracking uses randomUUID for event IDs — no sequential enumeration risk. FIFO eviction prevents memory bloat. No PII stored beyond email address in events."

---

## Deliverables

### Oklahoma City Seed Data (`server/seed-cities.ts`)

- 10 curated businesses: Cattlemen's Steakhouse, Nic's Grill, Waffle Champion, Empire Slice House, Tamashii Ramen, The Jones Assembly, Pie Junkie, Big Truck Tacos, Hideaway Pizza, The Press
- Real OKC neighborhoods: Stockyards City, Midtown, Plaza District, Asian District, Film Row, Classen, NW 23rd
- All 6 categories represented
- Added to ALL_CITY_BUSINESSES spread

### OKC City Config Activation (`shared/city-config.ts`)

- Status changed from "planned" to "beta"
- Launch date set to 2026-03-09
- Beta = visible in city picker with beta badge, not in getActiveCities()

### Email Delivery Tracking (`server/email-tracking.ts`)

- In-memory store (1000 max, FIFO)
- trackEmailSent/Opened/Clicked/Failed/Bounced
- getEmailStats with open rate and click rate
- getRecentEvents for admin dashboard
- clearEvents for testing

---

## Tests

- 25 new tests in `sprint224-okc-seed-email-tracking.test.ts`
- Full suite: 4,086+ tests across 154 files, all passing
