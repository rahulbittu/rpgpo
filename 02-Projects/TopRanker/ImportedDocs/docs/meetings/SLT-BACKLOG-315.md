# SLT + Architecture Backlog Meeting — Sprint 315

**Date:** March 9, 2026
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

---

## Agenda

1. Sprint 311-315 Review
2. Architecture Audit #45 findings
3. Dish/Cuisine Pipeline Assessment
4. Roadmap: Sprint 316-320

---

## 1. Sprint 311-315 Review

| Sprint | Feature | Points | Status |
|--------|---------|--------|--------|
| 311 | Dish shortcuts on Discover BestInSection | 3 | Done |
| 312 | useDishShortcuts hook (shared, live counts) | 5 | Done |
| 313 | Dish search matching in autocomplete | 3 | Done |
| 314 | Related dishes + dish search analytics | 3 | Done |
| 315 | Expanded CUISINE_DISH_MAP (10→19 dishes) | 5 | Done |

**Total:** 19 story points across 5 sprints. All shipped, all tests green.

**Marcus:** "This 5-sprint block completed the dish discovery pipeline. Search → autocomplete → leaderboard → related dishes → back to search. The loop is closed."

**Rachel:** "19 SEO-optimized dish pages now. Each is a potential organic landing page. Zero marginal cost."

---

## 2. Architecture Audit #45

**Grade: A** — 21st consecutive A-range.

**Amir:** "No critical or high findings. Two medium: Korean/Thai missing from CUISINE_DISH_MAP, dish leaderboard page growing. Both are non-urgent."

**Action:** DishEntryCard extraction tracked for Sprint 317-320 range.

---

## 3. Dish/Cuisine Pipeline Assessment

The full pipeline is now:
1. **Category chips** (Indian, Mexican, etc.) on Rankings + Discover
2. **Cuisine filtering** on leaderboard API and search API
3. **Dish shortcuts** showing entry counts from API
4. **Dish leaderboard page** with pagination, rate buttons, SEO
5. **Dish search matching** in autocomplete with Ranking badge
6. **Related dishes** linking sibling leaderboards
7. **Analytics** tracking cuisine filter, dish deep link, search match, related dish

**Marcus:** "This is the most complete vertical we've built. It's the model for any future sub-item system."

**Rachel:** "From a revenue perspective: 'Best Biryani in Dallas' is the kind of specific query that converts. We should funnel WhatsApp campaigns through these pages."

---

## 4. Roadmap: Sprint 316-320

| Sprint | Feature | Points | Priority |
|--------|---------|--------|----------|
| 316 | Korean + Thai cuisine dish maps | 3 | P1 |
| 317 | DishEntryCard extraction (audit finding) | 3 | P1 |
| 318 | Dish leaderboard share cards (deep link preview) | 5 | P2 |
| 319 | Cuisine-aware empty states on Rankings | 3 | P2 |
| 320 | SLT Q2 Mid-Sprint + Audit #46 | 5 | Governance |

**Approved unanimously.**

---

## Decisions

1. **Korean + Thai added to CUISINE_DISH_MAP next** — Both cuisines have 2+ seeded restaurants with dishes
2. **DishEntryCard extraction** — Reduce dish/[slug].tsx complexity before adding more features
3. **Share cards** — WhatsApp sharing needs preview cards for dish leaderboards
4. **No new surfaces** — Complete the dish vertical before adding new tabs or pages

---

## Next SLT: Sprint 320
