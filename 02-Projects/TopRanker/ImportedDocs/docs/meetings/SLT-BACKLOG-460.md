# SLT Backlog Meeting — Sprint 460

**Date:** 2026-03-10
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architect), Sarah Nakamura (Lead Eng)
**Facilitator:** Marcus Chen
**Scope:** Review Sprints 456–459, Roadmap 461–465

## Sprint 456–459 Review

### Sprint 456: DiscoverFilters Extraction
- Extracted DietaryTagChips, DistanceChips, HoursFilterChips to `FilterChipsExtended.tsx` (~190 LOC)
- DiscoverFilters reduced from 381→213 LOC (53.3% — well under 400 threshold)
- Re-exports preserve backward compatibility for all consumers

### Sprint 457: Search Card Hours Badge
- Added OPEN/CLOSING SOON/CLOSED status pills to search result cards
- `isClosingSoon()` helper detects within-60-min-of-closing state
- Client now maps closingTime, nextOpenTime, todayHours from API
- 3 `as any` casts added in api.ts for hours field mapping

### Sprint 458: Admin Enrichment Bulk Operations
- POST /api/admin/enrichment/bulk-dietary — tag multiple businesses by IDs
- POST /api/admin/enrichment/bulk-dietary-by-cuisine — tag by cuisine with dry run
- Safety: 100-business batch limit, tag whitelist, merge/replace modes, response cap at 50

### Sprint 459: Visit-Type-Aware Photo Prompts
- `getPhotoPromptsByVisitType()` maps visit type → contextual photo suggestions
- Dine-in: dish, vibe, experience. Delivery: packaging, food, order. Takeaway: bag, food, wait time
- Replaces generic PhotoTips with targeted guidance per visit type

## Current Metrics
- **8,540 tests** across 354 files, all passing in ~4.5s
- **Server build:** 632.3kb, 32 tables
- **Key file health:**
  - RatingExtrasStep.tsx: 566/600 (94.3%) — WATCH
  - routes-admin-enrichment.ts: 310/400 (77.5%) — OK
  - DiscoverFilters.tsx: 213/400 (53.3%) — HEALTHY
  - RatingExport.tsx: 294/300 (98%) — CRITICAL threshold proximity
  - OpeningHoursCard.tsx: 277/300 (92.3%) — WATCH
  - routes-businesses.ts: 361/375 (96.3%) — WATCH
- **Admin endpoints:** 50+ (enrichment, moderation, analytics, experiments, rate limits, WebSocket)
- **Cities:** 11 (5 active TX + 6 beta)

## Discussion

**Marcus Chen:** "Good execution on 456-459. The enrichment bulk operations complete the admin pipeline: dashboard → gaps → bulk operations → verify. That's a real ops workflow. The visit-type photo prompts are exactly the kind of UX touch that strengthens rating integrity without adding friction."

**Rachel Wei:** "From a revenue perspective, the shareable search URLs from 451 combined with the hours badges from 457 create powerful marketing links. 'Best vegetarian Indian open now in Irving' as a shareable URL with visual open/closed status — that's campaign-ready content."

**Amir Patel:** "Architecture concern: RatingExport.tsx at 98% of threshold is the most pressing file health issue. If we add anything to it, extraction is mandatory. Also, RatingExtrasStep.tsx jumped to 94.3% with the photo prompts addition. We should consider extracting the photo prompt section if it grows further."

**Sarah Nakamura:** "The `as any` client-side count is at ~21 of 22 threshold. The 3 casts from api.ts hours mapping are legitimate but we're one cast away from threshold. Next time we add client-side casts, we need to either increase threshold or eliminate existing ones."

## File Health Alerts

| File | LOC | Threshold | % | Status |
|------|-----|-----------|---|--------|
| RatingExport.tsx | 294 | 300 | 98.0% | **CRITICAL** |
| routes-businesses.ts | 361 | 375 | 96.3% | WATCH |
| RatingExtrasStep.tsx | 566 | 600 | 94.3% | WATCH |
| OpeningHoursCard.tsx | 277 | 300 | 92.3% | WATCH |
| routes-admin-enrichment.ts | 310 | 400 | 77.5% | OK |
| DiscoverFilters.tsx | 213 | 400 | 53.3% | HEALTHY |

## Roadmap: Sprints 461–465

### Sprint 461: RatingExport extraction (P0 — 98% threshold)
- Extract export summary computation and format utilities to `lib/rating-export-utils.ts`
- Target: RatingExport.tsx under 200 LOC

### Sprint 462: Visit-type-aware receipt prompts
- Extend Sprint 459 pattern to receipt upload section
- Delivery: "Upload delivery confirmation screenshot"
- Dine-in: "Upload restaurant receipt"
- Takeaway: "Upload pickup order receipt"

### Sprint 463: Admin enrichment hours bulk update
- POST /api/admin/enrichment/bulk-hours — batch update opening hours from Google Places data
- Structured JSON hours are more complex than dietary tags — needs careful merge logic

### Sprint 464: Rating note sentiment indicators
- Client-side quick sentiment analysis of rating notes
- Show positive/neutral/negative indicator to help raters self-moderate tone

### Sprint 465: Governance (SLT-465 + Audit #51 + Critique)
- Quarterly rhythm continues

## Decisions

1. **RatingExport extraction is P0** — 98% threshold means any addition breaks it. Sprint 461 must address this.
2. **`as any` threshold stays at 22** — legitimate casts for jsonb field access. Will revisit at Audit #51 if we hit the ceiling.
3. **Bulk hours enrichment approved for Sprint 463** — Amir to design the merge strategy for structured hours JSON.
4. **No new cities until audit metrics stable** — 11 cities is enough for Q2. Focus on depth, not breadth.
