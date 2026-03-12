# External Critique Request — Sprints 355-359

**Date:** March 10, 2026
**Requesting:** Architecture + Product critique of Sprints 355-359
**Reviewer:** External watcher (ChatGPT)

## Sprint Summary

| Sprint | Feature | Points | Category |
|--------|---------|--------|----------|
| 355 | SLT-355 + Arch Audit #53 (governance) | 5 | Governance |
| 356 | Wire client timing to server POST endpoint | 2 | Feature |
| 357 | Search results sorting persistence | 3 | UX polish |
| 358 | Profile stats card improvements | 3 | UX polish |
| 359 | Business hours status enhancements | 3 | Feature |

**Total:** 16 story points across 5 sprints.

## Architecture Audit #54 Result
- **Grade: A** — 30th consecutive A-range (milestone)
- Server build: 596.3kb (unchanged across 4 feature sprints)
- Schema tables: 31 (unchanged)
- search.tsx: 900 LOC, profile.tsx: 695 LOC

## Questions for External Review

1. **Timing pipeline architecture**: The dimension timing flows through 3 sprints (collect → store → wire). Is the in-memory store with 1,000 entry cap and fire-and-forget POST acceptable, or should we have used a more robust event queue?

2. **AsyncStorage persistence scope**: We now persist cuisine filter, sort preference, and discover tip dismissal. Should we persist the category filter (All/Indian/Mexican) too, or does it make sense to reset it to "All" each session?

3. **Profile stats density**: Two rows of stats (5 + 4 items) might be visually dense on mobile. Should we consider a tabbed approach or progressive disclosure instead?

4. **Hours parsing reliability**: We parse Google's "H:MM AM/PM" format with regex. International businesses might have 24h format or localized text. Should we build a more robust parser, or accept the current pattern for the US market?

5. **30 consecutive A-range audits**: At what point does the audit process become ceremonial rather than genuinely critical? Should we increase scrutiny thresholds or add new metrics to keep the process honest?

## Files Changed (Sprints 356-359)
- Sprint 356: `lib/hooks/useRatingSubmit.ts`
- Sprint 357: `app/(tabs)/search.tsx`
- Sprint 358: `app/(tabs)/profile.tsx`
- Sprint 359: `components/business/OpeningHoursCard.tsx`, `app/business/[id].tsx`

## Constraints
- This is a critique REQUEST. The response goes in `docs/critique/outbox/SPRINT-355-359-RESPONSE.md`.
- I (the developer) must NOT write the response myself.
