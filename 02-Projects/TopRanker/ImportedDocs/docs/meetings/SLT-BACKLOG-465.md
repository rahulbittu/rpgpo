# SLT Backlog Meeting — Sprint 465

**Date:** 2026-03-10
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architect), Sarah Nakamura (Lead Eng)
**Facilitator:** Marcus Chen
**Scope:** Review Sprints 461–464, Roadmap 466–470

## Sprint 461–464 Review

### Sprint 461: RatingExport Extraction (P0)
- Extracted 8 utility functions to `lib/rating-export-utils.ts` (~135 LOC)
- RatingExport.tsx reduced from 294→173 LOC (-41.2%)
- Re-exports preserve backward compatibility
- File health: from 98% to 57.7% of threshold — massive headroom restored

### Sprint 462: Visit-Type-Aware Receipt Prompts
- `getReceiptHint(visitType)` — contextual receipt upload hints
- Delivery: "delivery confirmation or app screenshot"
- Takeaway: "pickup order receipt or confirmation"
- Dine-in: "restaurant receipt or bill"
- Completes the visit-type prompt trilogy (dimensions → photos → receipts)

### Sprint 463: Admin Enrichment Bulk Hours Update
- POST /api/admin/enrichment/bulk-hours — batch hours update
- 50-business batch limit, source tracking (manual/google_places/import)
- Period structure validation, dry run support
- Completes enrichment pipeline: dashboard → gaps → bulk dietary → bulk hours

### Sprint 464: Rating Note Sentiment Indicators
- `lib/note-sentiment.ts` — keyword-based sentiment analysis (~80 LOC)
- `NoteSentimentIndicator.tsx` — small badge below note input (~46 LOC)
- 27 positive + 26 negative restaurant-domain keywords
- Client-side only — no server component, no data collection

## Current Metrics
- **8,617 tests** across 358 files, all passing in ~4.6s
- **Server build:** 634.7kb, 32 tables
- **Key file health:**
  - RatingExtrasStep.tsx: 582/600 (97.0%) — **CRITICAL** — extraction P0
  - routes-admin-enrichment.ts: 382/400 (95.5%) — WATCH
  - routes-businesses.ts: 361/375 (96.3%) — WATCH
  - OpeningHoursCard.tsx: 277/300 (92.3%) — WATCH
  - RatingExport.tsx: 173/300 (57.7%) — HEALTHY (extracted)
  - DiscoverFilters.tsx: 213/400 (53.3%) — HEALTHY (extracted)
- **`as any` thresholds:** total <75, client-side <22
- **Admin endpoints:** 53+ (enrichment now has 6 endpoints)
- **Cities:** 11 (5 active TX + 6 beta)

## Discussion

**Marcus Chen:** "Good velocity on 461-464. The RatingExport extraction resolved a 2-cycle P0. The enrichment pipeline is now complete. The sentiment indicator is a tasteful UX addition. But RatingExtrasStep at 97% is now the top priority — it's been growing steadily since Sprint 459."

**Amir Patel:** "RatingExtrasStep has absorbed 3 incremental additions: photo prompts (Sprint 459, ~50 LOC), receipt hints (Sprint 462, ~14 LOC), sentiment integration (Sprint 464, +2 LOC). The file needs extraction — I propose extracting the photo/receipt prompt helpers and their styles to a `components/rate/RatingPrompts.tsx` file."

**Rachel Wei:** "The enrichment pipeline is a real ops tool now. Dashboard → gaps → bulk dietary → bulk hours. This is the kind of infrastructure that saves hours of manual work per week. Good investment."

**Sarah Nakamura:** "Two files are now CRITICAL: RatingExtrasStep at 97% and routes-admin-enrichment at 95.5%. The extraction pattern is proven — Sprint 456 (DiscoverFilters) and Sprint 461 (RatingExport) both succeeded. We should apply it to both files in the next cycle."

## File Health Alerts

| File | LOC | Threshold | % | Status |
|------|-----|-----------|---|--------|
| RatingExtrasStep.tsx | 582 | 600 | 97.0% | **CRITICAL** |
| routes-admin-enrichment.ts | 382 | 400 | 95.5% | **WATCH** |
| routes-businesses.ts | 361 | 375 | 96.3% | WATCH |
| OpeningHoursCard.tsx | 277 | 300 | 92.3% | WATCH |
| RatingExport.tsx | 173 | 300 | 57.7% | HEALTHY |
| DiscoverFilters.tsx | 213 | 400 | 53.3% | HEALTHY |

## Roadmap: Sprints 466–470

### Sprint 466: RatingExtrasStep extraction (P0 — 97% threshold)
- Extract photo/receipt prompt helpers + styles to `components/rate/RatingPrompts.tsx`
- Target: RatingExtrasStep under 500 LOC

### Sprint 467: Admin enrichment route split
- Split routes-admin-enrichment.ts into dietary and hours modules
- Target: each file under 250 LOC

### Sprint 468: Rating dimension tooltips enhancement
- Add contextual help for each scoring dimension based on visit type
- "What does Service mean for a delivery order?" type guidance

### Sprint 469: Search filter presets
- Save and load filter combinations ("My favorites", "Quick lunch", "Date night")
- Local storage persistence via AsyncStorage

### Sprint 470: Governance (SLT-470 + Audit #52 + Critique)
- Quarterly rhythm continues

## Decisions

1. **RatingExtrasStep extraction is P0** — 97% threshold, must happen Sprint 466
2. **Admin enrichment route split approved** — Sprint 467 to prevent threshold breach
3. **No new admin endpoints until route split** — routes-admin-enrichment.ts is at 95.5%
4. **Sentiment analysis stays client-side** — No plans to send sentiment data to server
