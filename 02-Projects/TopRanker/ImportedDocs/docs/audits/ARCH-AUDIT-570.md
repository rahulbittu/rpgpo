# Architecture Audit #72 — Sprint 570

**Date:** 2026-03-10
**Auditor:** Amir Patel (Architecture)
**Previous:** Audit #71 (Sprint 565)

## Audit Scope

Full codebase scan covering Sprints 566-569 (dish photos, velocity widget, city comparison overlay, credibility tooltip).

## Overall Grade: A

72nd consecutive audit. Grade trajectory: ...A → A → A → A → A (maintained).

## Findings

### Critical: 0
### High: 0
### Medium: 0

### Low: 1

**L1: search.tsx at 99% threshold (670/680 LOC)**
- **File:** `app/(tabs)/search.tsx`
- **Issue:** Adding CityComparisonOverlay brought search.tsx to 670/680 LOC (99%). Next feature addition will hit the threshold.
- **Recommendation:** Before Sprint 571, extract discover-mode content (BestInSection wiring, TrendingSection, DishLeaderboardSection, CityComparisonOverlay) into a `DiscoverContent` component. This would free ~40-60 LOC.
- **Priority:** P1 — address in Sprint 571 or as preparation before the next search-page feature.

## File Health Summary (19 tracked files)

| File | Current | Max | Usage | Status |
|------|---------|-----|-------|--------|
| shared/schema.ts | 935 | 950 | 98% | Stable |
| server/routes.ts | 383 | 400 | 96% | Stable |
| server/storage/businesses.ts | 599 | 620 | 97% | Stable |
| server/routes-owner-dashboard.ts | 86 | 100 | 86% | OK |
| server/hours-utils.ts | 200 | 220 | 91% | OK |
| lib/api.ts | 550 | 570 | 96% | Stable |
| lib/api-owner.ts | 198 | 220 | 90% | OK |
| app/(tabs)/index.tsx | 443 | 460 | 96% | Stable |
| app/(tabs)/search.tsx | 670 | 680 | **99%** | **FLAG** |
| app/business/dashboard.tsx | 502 | 510 | 98% | Stable |
| components/dashboard/HoursEditor.tsx | 111 | 130 | 85% | OK |
| components/dashboard/RatingVelocityWidget.tsx | 169 | 180 | 94% | OK |
| components/business/CollapsibleReviews.tsx | 349 | 370 | 94% | OK |
| components/business/PhotoCarouselModal.tsx | 70 | 90 | 78% | OK |
| components/leaderboard/LeaderboardFilterChips.tsx | 80 | 100 | 80% | OK |
| components/search/SearchOverlays.tsx | 414 | 430 | 96% | Stable |
| lib/sharing.ts | 118 | 130 | 91% | OK |
| components/search/CityComparisonOverlay.tsx | 194 | 200 | 97% | Stable |
| components/profile/CredibilityBreakdownTooltip.tsx | 202 | 210 | 96% | Stable |

## Build Health

- **Server bundle:** 712.1kb (max 720kb, 99% — stable since Sprint 566)
- **Tests:** 10,744 across 459 files (min 10,700)
- **Schema:** 935/950 LOC (unchanged since Sprint 551)

## Sprint 566-569 Architecture Assessment

### Positive Patterns
1. **API reuse** — All 4 sprints built on existing endpoints. Zero new server routes.
2. **Component isolation** — New components (169-202 LOC range) are self-contained with no cross-component coupling.
3. **Type upgrades** — credibilityBreakdown `any` → proper interface. Incremental type safety improvement.
4. **Threshold compliance** — 19 files tracked, 0 violations, all new components registered.

### Risks
1. **search.tsx at 99%** — One more feature will breach. Extraction needed.
2. **Build size at 99%** — 712.1/720kb. No growth this cycle but tight.

## Recommendations

1. Sprint 571 should include search.tsx extraction if the feature touches search
2. Consider bumping build threshold to 740kb proactively — 720kb has held since Sprint 566 but leaves little room
3. Continue current pattern of self-contained additive components
