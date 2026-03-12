# SLT Backlog Meeting — Sprint 170

**Date:** 2026-03-09
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

---

## Review: Sprints 166-169 Execution

### Delivered
- **Sprint 166:** Dish leaderboard schema + storage + 5 API endpoints (route extraction to routes-dishes.ts)
- **Sprint 167:** Dish leaderboard UI — chip rail, hero banner, ranked cards, suggest modal, building state
- **Sprint 168:** Dish leaderboard seed data (5 boards) + rating flow dish context pre-fill
- **Sprint 169:** 6-hour batch recalculation job + dish rank consequence message in confirmation

### Metrics
| Metric | Sprint 165 | Sprint 169 | Δ |
|--------|-----------|-----------|---|
| Tests | 2,220 | 2,334 | +114 |
| Test files | 99 | 103 | +4 |
| API endpoints | 75 | 80 | +5 |
| Database tables | ~25 | 29 | +4 |

### What Shipped Well
- Dish leaderboard V1 complete in 4 sprints (166-169) — schema to live with batch recalculation
- Clean route extraction kept routes.ts under 1000 LOC CI limit
- Credibility-weighted scoring applied consistently to dish rankings
- Zero regressions — 100% test pass rate maintained

---

## Architecture Audit #16 Summary (see ARCH-AUDIT-170.md)

**Grade: A-** (stable from Sprint 165's A)

- 3 files over 800 LOC (routes.ts 961, rate/[id].tsx 898, profile/SubComponents.tsx 863)
- 23 `as any` casts (mostly StyleSheet workarounds — acceptable)
- Zero TODOs, zero console.logs, zero type suppressions
- Test coverage ratio: 2,334 tests / ~15K LOC = excellent

**Key finding:** routes.ts at 961 lines — approaching CI limit again. Needs domain-based splitting.

---

## Backlog Prioritization: Sprints 171-175

### P0 — Must Ship

**Sprint 171: routes.ts domain splitting**
- Owner: Sarah Nakamura
- Split routes.ts into routes-ratings.ts, routes-search.ts, routes-auth.ts
- Target: routes.ts core under 400 LOC, each domain file <300 LOC
- Rationale: 961 lines, approaching 1000 CI limit. Recurring audit finding since Sprint 140.

**Sprint 172: rate/[id].tsx decomposition**
- Owner: Priya Sharma + Sarah Nakamura
- Extract CircleScoreForm, DishSelector, ConfirmationStep hooks
- Target: rate/[id].tsx under 500 LOC
- Rationale: 898 lines, recurring Medium finding. Complexity growing with dish context features.

### P1 — High Priority

**Sprint 173: Business claim verification flow**
- Owner: Jordan Blake (Compliance) + Sarah Nakamura
- Business owners can claim their listing, verify via domain email
- Rationale: Revenue prerequisite — Business Pro ($49/mo) requires verified ownership

**Sprint 174: SEO optimization for dish leaderboard pages**
- Owner: Jasmine Taylor (Marketing) + Amir Patel
- Server-side rendered "Best [Dish] in [City]" pages
- Open Graph meta tags, structured data (schema.org)
- Rationale: Rachel Wei — "Dish leaderboards are the organic growth engine. SEO is the distribution."

### P2 — Important

**Sprint 175: Push notification infrastructure**
- Owner: Nadia Kaur (Security) + Sarah Nakamura
- Expo push notifications for rating milestones, challenger results, tier upgrades
- Rationale: Re-engagement driver. Deferred from 167-168 window.

### P3 — Track

- Load testing infrastructure (k6) — Amir Patel
- PostHog/analytics provider integration — Jasmine Taylor
- Batch job health dashboard — Sarah Nakamura
- Dynamic dish recalculation cadence — Amir Patel
- Dish-specific credibility sub-scores (V3) — Marcus Chen

---

## Revenue Alignment

**Rachel Wei:** "Four revenue streams need technical enablement:
1. **Business Pro ($49/mo)** — blocked on claim verification (Sprint 173)
2. **Featured Placement** — live, needs SEO for traffic (Sprint 174)
3. **Challenger ($99)** — live, performing well
4. **Premium API** — needs rate limiting tiers, authentication tokens (track for Sprint 176+)

My priority: Sprint 173 (claim flow) unlocks the highest recurring revenue stream."

**Marcus Chen:** "Agreed. But we don't ship claim flow on a fragile codebase. Routes splitting (171) and rate screen decomposition (172) reduce technical debt first. Then we build revenue features on a clean foundation."

---

## Decisions

1. **Sprints 171-172:** Technical debt reduction (routes splitting + rate screen decomposition)
2. **Sprints 173-174:** Revenue enablement (business claims + SEO)
3. **Sprint 175:** Growth lever (push notifications)
4. **Next SLT meeting:** Sprint 175
5. **Next audit:** Sprint 175

---

**Meeting adjourned.** All attendees aligned on the 171-175 roadmap.
