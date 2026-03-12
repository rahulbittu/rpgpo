# External Critique Request — Sprints 340-344

**Date:** March 9, 2026
**Requesting:** Architecture + Product critique of Sprints 340-344
**Reviewer:** External watcher (ChatGPT)

## Sprint Summary

| Sprint | Feature | Points | Category |
|--------|---------|--------|----------|
| 340 | SLT-340 + Arch Audit #50 (governance) | 5 | Governance |
| 341 | Photo strip fallback (cuisine emoji + hint) | 3 | UX polish |
| 342 | Rating flow animated highlight | 3 | UX polish |
| 343 | Per-dimension timing analytics | 3 | Analytics |
| 344 | City promotion pipeline refresh | 3 | Infrastructure |

**Total:** 17 story points across 5 sprints.

## Architecture Audit #51 Result
- **Grade: A** — 27th consecutive A-range
- Server build: 590.5kb → 593.7kb (+3.2kb)
- Schema tables: 31 (unchanged)
- rate/[id].tsx at 686 LOC (14 margin — critical)
- SubComponents.tsx at 572 LOC (28 margin — warning)

## Questions for External Review

1. **Animated highlight approach:** We replaced static CSS class swaps with Reanimated `interpolateColor` and 4 shared values. Is this over-engineered for a simple highlight effect? Would a simpler `Animated.timing` on opacity suffice?

2. **Per-dimension timing in refs:** The timing uses `useRef<number[]>` instead of state to avoid re-renders. The timing is only read at submission time. Is this the right trade-off, or should timing data be in state for potential real-time display?

3. **Promotion progress percentages:** We calculate overall progress as `(biz% + mem% + rat% + days%) / 4`. Should each criterion be weighted differently? Businesses might be more important than days-in-beta for promotion readiness.

4. **Cuisine-specific emoji priority:** SafeImage checks `cuisine` before `category` for fallback emoji. This means a "Mexican" restaurant shows the Mexican flag emoji instead of a generic restaurant emoji. Is specificity always better here, or could some cuisine emojis be confusing?

5. **LOC growth trajectory:** rate/[id].tsx grew 36 lines in 2 sprints. The extraction is planned for Sprint 346. Should we have paused feature additions to extract first?

## Files Changed (Sprints 340-344)
- Sprint 341: `components/SafeImage.tsx`, `SubComponents.tsx` ×2 (cuisine fallbacks)
- Sprint 342: `app/rate/[id].tsx` (animated highlights)
- Sprint 343: `app/rate/[id].tsx`, `lib/hooks/useRatingSubmit.ts` (dimension timing)
- Sprint 344: `server/city-promotion.ts`, `server/routes-admin-promotion.ts` (pipeline refresh)

## Constraints
- This is a critique REQUEST. The response goes in `docs/critique/outbox/SPRINT-340-344-RESPONSE.md`.
- I (the developer) must NOT write the response myself.
