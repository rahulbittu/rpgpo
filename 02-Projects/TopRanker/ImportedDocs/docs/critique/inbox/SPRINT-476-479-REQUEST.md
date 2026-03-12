# Critique Request: Sprints 476–479

**Date:** 2026-03-10
**Requesting:** External architectural critique
**Scope:** 4 sprints (2 extraction + 2 feature)

## Sprints Under Review

### Sprint 476: Search Result Processing Extraction
- Extracted dietary/distance/hours filtering + relevance scoring from routes-businesses.ts
- New module: `server/search-result-processor.ts` (~124 LOC)
- Three-stage pipeline: enrichSearchResults → applySearchFilters → sortByRelevance
- routes-businesses.ts: 376→305 LOC

### Sprint 477: DateRangeFilter Extraction
- Extracted date filter UI from RatingHistorySection.tsx
- New component: `components/profile/DateRangeFilter.tsx` (~175 LOC)
- RatingHistorySection: 319→210 LOC
- Re-exports for backward compatibility

### Sprint 478: Dashboard Analytics
- New module: `server/dashboard-analytics.ts` (~122 LOC)
- Pure functions: computeWeeklyVolume, computeMonthlyVolume, computeVelocityChange, extractSparklineScores
- Dashboard endpoint integrates via buildDashboardTrend()
- Pro/Free tiering: Free gets limited windows, Pro gets full history

### Sprint 479: Notification Preferences UI
- NotificationPreferencesCard replaces NotificationSettingsLink on Profile tab
- 8 categories in 3 groups: Activity (4), Push Alerts (3), Email (1)
- 3 new push categories: rankingChanges, savedBusinessAlerts, cityAlerts
- Server endpoints updated, Settings page synced

## Specific Questions for Critique

1. **routes-businesses.ts creep** — Dropped to 305 after extraction but crept back to 316 with dashboard analytics. Is the dashboard endpoint doing too much? Should we extract dashboard data assembly?

2. **Notification preference duplication** — Both settings.tsx and NotificationPreferencesCard.tsx define notification category metadata independently. Is this tech debt we should address now, or is it acceptable?

3. **Push category triggers** — We built the preference infrastructure (Sprint 479) but haven't built the triggers yet. Is this a risky pattern (preferences without delivery)?

4. **Pro/Free tiering at API level** — Dashboard endpoint slices arrays for Free users. Is this the right place for tier gating, or should there be a middleware/utility?

5. **200-rating limit for analytics** — buildDashboardTrend fetches up to 200 ratings for trend computation. Is this a scalability concern, or is in-memory computation acceptable at our current scale?

## File Inventory

| File | LOC | Status |
|------|-----|--------|
| server/search-result-processor.ts | 124 | NEW (476) |
| components/profile/DateRangeFilter.tsx | 175 | NEW (477) |
| server/dashboard-analytics.ts | 122 | NEW (478) |
| components/profile/NotificationPreferencesCard.tsx | 217 | NEW (479) |
| server/routes-businesses.ts | 316 | Modified (476, 478) |
| server/routes-members.ts | 262 | Modified (479) |
| app/(tabs)/profile.tsx | 628 | Modified (479) |
| app/settings.tsx | 452 | Modified (479) |

## Test Coverage
- Sprint 476: 23 tests
- Sprint 477: 22 tests
- Sprint 478: 23 tests
- Sprint 479: 22 tests
- **Total new:** 90 tests
- **Full suite:** 8,863 tests across 370 files
