# Critique Request: Sprints 556-559

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Feature Polish + Process Improvement (Hours Pre-fill, Conversion Utility, Threshold Config, Wiring + Caching)

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 556 | Hours pre-fill — HoursEditor fetches existing business openingHours |
| 557 | Hours conversion — weekdayTextToPeriods + periodsToWeekdayText bidirectional |
| 558 | Centralized threshold config — shared/thresholds.json + file-health.test.ts |
| 559 | Hours conversion wiring in PUT route + photo carousel React Query caching |

## Current Metrics

- 10,507 tests across 449 files
- 711.4kb server build
- 70 consecutive A-range arch grades
- 11 cities (5 active TX + 6 beta)
- 45+ admin endpoints
- Schema at 935/1000 LOC
- 13 files tracked in centralized thresholds

## Questions for External Watcher

1. **HoursEditor pre-fill uses inline state check instead of useEffect:** The pre-population logic checks `existingHours?.weekday_text && !initialized` during render and calls setState synchronously. This works but is not idiomatic React — useEffect is the standard pattern for syncing external data to state. Is the inline approach a maintainability risk, or is it acceptable for a simple one-time initialization?

2. **weekdayTextToPeriods parsing is regex-based:** The conversion utility uses `(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–\-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)` to parse time strings. This handles standard formats but may fail on: localized formats ("11h00"), Unicode dashes, or Google Places edge cases. Should we add a validation layer that falls back gracefully, or is strict parsing correct (reject bad input, keep data clean)?

3. **Centralized thresholds coexist with per-sprint thresholds:** The new file-health.test.ts checks 13 files dynamically from thresholds.json. But 50+ old per-sprint tests still have their own inline threshold assertions. This creates two sources of truth. Should old tests be migrated to reference thresholds.json, should the old assertions be removed, or is the dual-system acceptable during transition?

4. **Photo carousel uses enabled:false + refetch() pattern:** The carousel query is disabled by default and manually triggered via refetch(). This prevents unnecessary fetches but means the first open always hits the server. An alternative is `enabled: carouselOpen` which would auto-fetch when the modal opens. Which pattern is more appropriate for on-demand data loading in a modal context?

5. **The 561-565 roadmap is extraction-heavy (3 of 5 sprints):** HoursEditor extraction, owner API extraction, photo carousel extraction. While these reduce file sizes, they don't add user-facing value. Is 60% of a sprint cycle on extraction the right balance, or should we interleave more features? The risk: extraction sprints feel productive but don't move business metrics.
