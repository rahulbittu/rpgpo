# SLT Backlog Meeting — Sprint 385

**Date:** 2026-03-09
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng), Jasmine Taylor (Marketing)

## Agenda
1. Sprint 381-384 Review
2. Architecture Health
3. Roadmap 386-390
4. Revenue & Growth

---

## 1. Sprint 381-384 Review

| Sprint | Feature | Impact |
|--------|---------|--------|
| 381 | BusinessActionBar extraction | business/[id].tsx 604→596 LOC |
| 382 | Receipt verification UI | +25% boost in rating flow, isReceipt flag |
| 383 | Discover empty state enhancements | search.tsx 851→751 LOC, "Be the first" CTA |
| 384 | Profile rating history pagination | Show More/Less with 10-item pages |

**Metrics:**
- 291 test files, 7,045 tests, all passing
- Server build: 599.3kb, 31 tables
- 35th consecutive A-range audit expected

**Marcus Chen:** "Good balance of feature work (382, 384) and code health (381, 383). The receipt verification UI is strategically important — it's our strongest trust signal at +25%."

**Rachel Wei:** "Receipt verification helps our story for advertisers. 'Verified purchases' is a concept they understand and value. This differentiates our data."

**Jasmine Taylor:** "The 'Be the first to rate' CTA in empty states is perfect for new city launches. When we expand to Austin or Houston, users won't see dead pages."

## 2. Architecture Health

| File | LOC | Threshold | % |
|------|-----|-----------|---|
| search.tsx | 751 | 900 | 83% |
| profile.tsx | 709 | 800 | 89% |
| rate/[id].tsx | 625 | 700 | 89% |
| business/[id].tsx | 596 | 650 | 92% |
| index.tsx | 572 | 600 | 95% |
| challenger.tsx | 479 | 550 | 87% |

**Amir Patel:** "index.tsx at 95% is a watch item. If the next feature touches Rankings, we need to extract first. All other files are comfortable."

**Sarah Nakamura:** "The extraction pattern is well-established: extract → props interface → barrel export → redirect tests. We've done it 4 times now (SavedPlacesSection, SharePreviewCard, BusinessActionBar, DiscoverEmptyState)."

## 3. Roadmap 386-390

| Sprint | Feature | Priority | Points |
|--------|---------|----------|--------|
| 386 | Rankings index.tsx proactive extraction | P0 | 5 |
| 387 | Rating edit/delete capability | P1 | 5 |
| 388 | Business hours display in search cards | P1 | 3 |
| 389 | Challenger round timer UI | P1 | 3 |
| 390 | Governance (SLT + Audit + Critique) | P0 | 2 |

**Marcus Chen:** "Rankings extraction is P0 — we're at 95% of threshold. Rating edit is next most important from a trust perspective: users need to be able to correct mistakes."

**Rachel Wei:** "Rating edit also reduces support load. Users who make a mistake currently have to contact us."

**Amir Patel:** "For index.tsx extraction, the candidate is the render-item block — each ranked card is a self-contained unit. Extract to RankedBusinessCard component."

## 4. Revenue & Growth

**Rachel Wei:** "Revenue pipeline remains on track. Challenger subscriptions ($99) are the near-term driver. Business Pro ($49/mo) launches when we hit 100 claimed businesses."

**Jasmine Taylor:** "Receipt verification gives us a new marketing angle: 'Verified reviews from real diners.' This is the credibility story we need for the Indian Dallas community."

## Action Items
- [ ] Sprint 386: Extract RankedBusinessCard from index.tsx (P0) — **Owner: Sarah**
- [ ] Sprint 387: Rating edit/delete capability — **Owner: Amir**
- [ ] Monitor index.tsx LOC — do not add features until extraction — **Owner: Sarah**

## Next Meeting
Sprint 390
