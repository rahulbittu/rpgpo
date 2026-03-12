# Sprint 229 — New Orleans Seed Data + Outreach Sent-History Tracking

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

---

## Mission Alignment

Sprint 229 expands to our 7th city — New Orleans, the culinary capital of the South. The outreach sent-history module prevents email fatigue by tracking when businesses were last contacted, ensuring each owner gets one Pro upgrade email per 30 days max.

---

## Team Discussion

**David Okonkwo (VP Product):** "New Orleans is our second out-of-state expansion after OKC. 10 curated restaurants across all categories — Commander's Palace, Cafe Du Monde, Willie Mae's Scotch House. These are nationally recognized establishments that anchor the market."

**Jasmine Taylor (Marketing):** "NOLA's food culture is legendary. Commander's Palace at #1 gives us instant credibility. Cafe Du Monde at 789 ratings shows community engagement potential. These seed businesses set the tone."

**Sarah Nakamura (Lead Eng):** "Outreach history tracking prevents the worst email marketing sin — spamming. hasOutreachBeenSent(businessId, template, 30) returns true if we've contacted them in the last 30 days. Simple, effective, respectful."

**Marcus Chen (CTO):** "Two cities in beta now — OKC and New Orleans. The expansion playbook is validated: seed → beta → monitor → activate. Zero planned cities remaining."

**Rachel Wei (CFO):** "NOLA is a high-value market. Average restaurant spending per capita is among the highest in the US. If we convert 10% of claimed businesses to Pro, NOLA alone generates $245/mo in MRR."

**Nadia Kaur (Security):** "Outreach history is in-memory — resets on restart. Acceptable for now since outreach runs weekly. A DB-backed version would be more resilient but adds complexity we don't need yet."

---

## Deliverables

### New Orleans Seed Data (`server/seed-cities.ts`)

- 10 curated businesses: Commander's Palace, Dooky Chase's, Cafe Du Monde, Willie Mae's Scotch House, Cochon, Bacchanal Wine, Dong Phuong Bakery, Dat Dog, Raising Cane's, French Truck Coffee
- Real NOLA neighborhoods: French Quarter, Garden District, Treme, Warehouse District, Bywater, New Orleans East, Frenchmen Street, CBD
- All 6 categories represented

### NOLA Beta Launch (`shared/city-config.ts`)

- Status changed from "planned" to "beta"
- Launch date: 2026-03-09
- Now 5 active + 2 beta + 0 planned cities

### Outreach Sent-History (`server/outreach-history.ts`)

- `recordOutreachSent(businessId, templateName)` — records contact date
- `hasOutreachBeenSent(businessId, templateName, withinDays)` — 30-day dedup check
- `getOutreachHistory(businessId)` — returns full contact history
- Integrated into `outreach-scheduler.ts` — Pro upgrades skip if contacted within 30 days

---

## Tests

- 25 new tests in `sprint229-nola-seed-outreach-history.test.ts`
- Full suite: 4,221+ tests across 159 files, all passing
