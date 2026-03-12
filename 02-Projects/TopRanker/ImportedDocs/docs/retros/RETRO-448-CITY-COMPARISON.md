# Retro 448: Review Summary City Comparison

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Clean API design — one endpoint, one response shape, all the comparison data a client needs. The CityComparisonCard transforms raw numbers into visual deltas that users actually understand. The green/red arrow pattern is universal and requires zero explanation."

**Priya Sharma:** "The card design slots perfectly into the existing business detail page. Same card styling, same spacing, same color palette (AMBER, NAVY). The dimension bars give a visual at-a-glance comparison that would take 3 paragraphs to explain in text."

**Rachel Wei:** "We now have city-level KPIs accessible via API. This same endpoint can power future admin dashboards, city health monitoring, and growth tracking. The data was always in the DB — we just never aggregated it publicly."

**Amir Patel:** "Good separation between the aggregation (server) and presentation (component). The component is pure — it takes props and renders. No data fetching in the component itself. The query lives in the page, which keeps the data flow predictable."

## What Could Improve

- **No caching on city stats** — Every request runs the aggregation query. Fine at 30 businesses, but should add Redis caching before we scale to 500+ per city.
- **Dimension comparison data is incomplete** — The component receives dimension comparisons from city stats but the business-side averages need to be computed from ratings. Currently passing 0 for bizAvg.
- **No loading state** — The CityComparisonCard renders when data is available but there's no skeleton placeholder. Causes layout shift when data loads.

## Action Items

- [ ] Begin Sprint 449 (Rate SubComponents extraction) — **Owner: Sarah**
- [ ] Compute business-side dimension averages from ratings array — **Owner: Marcus** (Sprint 449+)
- [ ] Add 5-minute caching for city stats endpoint — **Owner: Amir** (Sprint 450+)

## Team Morale
**9/10** — Solid feature sprint. The city comparison card adds meaningful context to rankings. Three sprints in a row (446-448) have been clean deliveries with good test coverage. Team is in a productive groove heading into Sprint 449's extraction work.
