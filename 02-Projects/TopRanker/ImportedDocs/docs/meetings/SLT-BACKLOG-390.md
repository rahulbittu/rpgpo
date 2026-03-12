# SLT Backlog Meeting — Sprint 390

**Date:** 2026-03-09
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng), Jasmine Taylor (Marketing)

## Agenda
1. Sprint 386-389 Review
2. Architecture Health
3. Roadmap 391-395
4. Revenue & Growth

---

## 1. Sprint 386-389 Review

| Sprint | Feature | Impact |
|--------|---------|--------|
| 386 | RankingsListHeader extraction | index.tsx 572→419 LOC (P0 extraction) |
| 387 | Rating edit/delete capability | Long-press actions, 48h edit window, API wiring |
| 388 | Business hours display | "Closes at 10 PM" / "Opens at 11 AM" in search cards |
| 389 | Challenger round timer | Live DD:HH:MM:SS countdown with urgency colors |

**Metrics:**
- 295 test files, 7,128 tests, all passing
- Server build: 599.3kb, 31 tables
- 36th consecutive A-range audit expected

**Marcus Chen:** "Sprint 386 was the big win — index.tsx dropped from 95% to 70% of threshold. That buys us substantial runway. The remaining sprints were all user-facing polish that strengthens the core experience."

**Rachel Wei:** "Rating edit/delete reduces support burden. Users who make mistakes now self-correct. Business hours display adds utility that keeps users in-app instead of switching to Google Maps."

**Jasmine Taylor:** "The live challenger timer is a marketing asset. Screenshots of a ticking red countdown drive urgency. 'Vote before time runs out!' with a real timer is compelling content."

**Amir Patel:** "All four sprints followed clean patterns. The extraction in 386 was the largest single reduction we've done (153 LOC). Timer in 389 used minimal state — one useEffect, one useState, a color ternary."

## 2. Architecture Health

| File | LOC | Threshold | % | Status |
|------|-----|-----------|---|--------|
| search.tsx | 751 | 900 | 83% | OK |
| profile.tsx | 720 | 800 | 90% | WATCH |
| rate/[id].tsx | 625 | 700 | 89% | WATCH |
| business/[id].tsx | 596 | 650 | 92% | WATCH |
| challenger.tsx | 544 | 575 | 95% | ACTION |
| index.tsx | 420 | 600 | 70% | OK |

**Sarah Nakamura:** "index.tsx is now our healthiest file at 70%. challenger.tsx moved to 95% after the timer addition — it's our next extraction candidate."

**Amir Patel:** "For challenger.tsx extraction, the candidate is the ChallengeCard component itself — it's a self-contained ~180 LOC block. Extract to components/challenger/ChallengeCard.tsx."

## 3. Roadmap 391-395

| Sprint | Feature | Priority | Points |
|--------|---------|----------|--------|
| 391 | ChallengeCard extraction from challenger.tsx | P0 | 5 |
| 392 | Search result relevance scoring | P1 | 5 |
| 393 | Profile achievements & milestones display | P1 | 5 |
| 394 | Business claim verification improvements | P1 | 3 |
| 395 | Governance (SLT + Audit + Critique) | P0 | 2 |

**Marcus Chen:** "challenger.tsx at 95% is P0 — same situation as index.tsx was at Sprint 385. Extract first, then build. Search relevance scoring is next most impactful — our current search is keyword-only."

**Rachel Wei:** "Business claim verification improvements help our B2B pipeline. Faster, cleaner claims mean faster Business Pro conversions at $49/mo."

**Jasmine Taylor:** "Profile achievements give users something to share. 'I just reached Trusted tier!' or 'Top 10 rater in Irving' are organic social posts."

## 4. Revenue & Growth

**Rachel Wei:** "We need to push toward 100 claimed businesses for Business Pro launch. Current claim flow works but could be smoother — Sprint 394 addresses this."

**Jasmine Taylor:** "WhatsApp engagement is holding strong. The challenger timer screenshots are getting reactions. We should lean into time-limited content."

## Action Items
- [ ] Sprint 391: Extract ChallengeCard from challenger.tsx (P0) — **Owner: Sarah**
- [ ] Monitor challenger.tsx LOC — do not add features until extraction — **Owner: Amir**
- [ ] Begin search relevance scoring research — **Owner: Amir**

## Next Meeting
Sprint 395
