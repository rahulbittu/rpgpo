# SLT Backlog Meeting — Sprint 395

**Date:** 2026-03-09
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng), Jasmine Taylor (Marketing)

## Agenda
1. Sprint 391-394 Review
2. Architecture Health
3. Roadmap 396-400
4. Revenue & Growth

---

## 1. Sprint 391-394 Review

| Sprint | Feature | Impact |
|--------|---------|--------|
| 391 | ChallengeCard extraction | challenger.tsx 544→142 LOC (74% reduction, largest extraction) |
| 392 | Search relevance scoring | textRelevance + profileCompleteness wired into search endpoint |
| 393 | Profile achievements | 13 milestones, earned grid, next goal display |
| 394 | Claim verification improvements | Business email, website, method selector |

**Metrics:**
- 299 test files, 7,203 tests, all passing
- Server build: 601.1kb, 31 tables
- 37th consecutive A-range audit expected

**Marcus Chen:** "Sprint 391 was the standout — largest extraction in project history (-402 LOC, 74% reduction). challenger.tsx went from a P0 risk to our slimmest tab screen at 142 LOC. Sprint 392 closed a gap open since Sprint 347 — search finally ranks by relevance."

**Rachel Wei:** "Sprint 394 strengthens our claim pipeline. Business email + website + method selector gives admins real signals. This accelerates the path to Business Pro revenue."

**Jasmine Taylor:** "Achievements in Sprint 393 are shareable moments. 'I just hit Power Rater on TopRanker!' with a grid of earned trophies is exactly the content our WhatsApp groups want."

**Amir Patel:** "All four sprints were clean. No critical findings, no cascading failures beyond the expected extraction tests. The relevance scoring used existing Sprint 347 infrastructure — zero new algorithm development."

## 2. Architecture Health

| File | LOC | Threshold | % | Status |
|------|-----|-----------|---|--------|
| search.tsx | 752 | 900 | 84% | OK |
| profile.tsx | 731 | 800 | 91% | WATCH |
| rate/[id].tsx | 625 | 700 | 89% | WATCH |
| business/[id].tsx | 596 | 650 | 92% | WATCH |
| index.tsx | 420 | 600 | 70% | OK |
| challenger.tsx | 142 | 575 | 25% | OK |

**Sarah Nakamura:** "challenger.tsx at 25% is our healthiest ever. business/[id].tsx at 92% is the next extraction candidate. profile.tsx at 91% needs monitoring — achievements were extracted as a component, keeping the growth minimal."

**Amir Patel:** "For business/[id].tsx extraction, the hero section (carousel + photos) is the candidate. It's a self-contained ~80 LOC block."

## 3. Roadmap 396-400

| Sprint | Feature | Priority | Points |
|--------|---------|----------|--------|
| 396 | Business detail hero extraction | P1 | 5 |
| 397 | Dish leaderboard enhancements | P1 | 5 |
| 398 | Rating submission confirmation screen | P1 | 3 |
| 399 | Search autocomplete improvements | P1 | 3 |
| 400 | Governance (SLT + Audit + Critique) | P0 | 2 |

**Marcus Chen:** "business/[id].tsx at 92% makes hero extraction important but not P0 yet — one more feature and it is. Dish leaderboards are a key differentiator: 'Best biryani in Irving' needs a dedicated, polished view."

**Rachel Wei:** "Rating confirmation screen (Sprint 398) improves completion rates. Users need to see 'Your rating was submitted' with visible impact. This feeds Constitution #4."

**Jasmine Taylor:** "Autocomplete improvements help new users find restaurants faster. The faster they find, the faster they rate. That's our growth loop."

## 4. Revenue & Growth

**Rachel Wei:** "Server bundle crossed 601kb — first time over 600. Not alarming but worth noting. Revenue pipeline unchanged: pushing toward 100 claimed businesses."

**Jasmine Taylor:** "Achievements and claim improvements both support our two audiences: raters (achievements motivate ratings) and owners (better claim flow reduces friction)."

## Action Items
- [ ] Sprint 396: Extract hero section from business/[id].tsx — **Owner: Sarah**
- [ ] Monitor business/[id].tsx — extraction needed before any feature additions — **Owner: Amir**
- [ ] Begin dish leaderboard research — **Owner: Priya**

## Next Meeting
Sprint 400
