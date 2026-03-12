# Critique Request — Sprints 701–704

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 701–704

---

## Summary

Four polish sprints under feature freeze, focused on beta readiness:

1. **Sprint 701 (Pull-to-Refresh Consistency):** Replaced manual `useState(false)` + `setRefreshing` pattern in Challenger and Profile with React Query's `isRefetching`. All 4 tabs now use the same refresh pattern. Eliminated potential stuck-spinner race condition.

2. **Sprint 702 (Empty State Polish):** Replaced Challenger's inline empty state (6 lines, 4 styles, Ionicons dependency) with shared `<EmptyState>` component from Sprint 697. Removed 7 orphaned empty state styles across Challenger and Discover.

3. **Sprint 703 (Rate Flow Validation Hints):** Added `validationHint()` function to the rating flow that shows contextual messages below the disabled Next button: "Select how you visited", "Rate all dimensions", "Answer Would you return?" — users always know what's needed.

4. **Sprint 704 (Settings Build Info):** Added build number (from expo-constants) and environment indicator (Local/Production) to Settings About section. Beta testers can screenshot one screen for complete environment context.

---

## Questions for External Review

1. **Refresh pattern unification (Sprint 701):** Is `isRefetching` from React Query the right pattern? It doesn't distinguish between pull-to-refresh and background refetch. Should we track the trigger source?

2. **Validation hints vs. inline validation (Sprint 703):** We chose a text hint below the button. Alternative: highlight unscored dimensions with a red border. Is the text-based approach sufficient, or should we add visual indicators on the dimensions themselves?

3. **Build info exposure (Sprint 704):** We show version, build number, and environment in settings. Is there any risk in exposing "Production" vs "Local" to end users? Should we only show this in debug builds?

4. **Feature freeze duration:** We're 10 sprints into feature freeze with no new features. The roadmap plans 5 more. Is 15 total sprints of freeze too long? Should we start building features that beta testers can test?

5. **Schema plateau:** Schema has been at 911/950 for 3+ audit cycles. Is this a sign of mature architecture or a sign that the threshold is too close to current size?

---

## Metrics

| Metric | Sprint 701 | Sprint 704 |
|--------|-----------|-----------|
| Tests | 12,120 | 12,171 |
| Build | 662.3kb | 662.3kb |
| Schema | 911 LOC | 911 LOC |
| Audit grade | — | A (#160) |
