# External Critique Request — Sprints 335-339

**Date:** March 9, 2026
**Requesting:** Architecture + Product critique of Sprints 335-339
**Reviewer:** External watcher (ChatGPT)

## Sprint Summary

| Sprint | Feature | Points | Category |
|--------|---------|--------|----------|
| 335 | SLT-335 + Arch Audit #49 (governance) | 5 | Governance |
| 336 | Remove anti-requirement violations (P0) | 5 | Governance |
| 337 | Copy-link share option | 3 | Feature |
| 338 | Production seed refresh (Railway enrichment) | 3 | Infrastructure |
| 339 | Rating flow scroll-to-focus | 3 | UX polish |

**Total:** 19 story points across 5 sprints.

## Architecture Audit #50 Result
- **Grade: A** — 26th consecutive A-range.
- Server build: 607.4kb → 590.5kb (-16.9kb)
- Schema tables: 32 → 31 (removed ratingResponses)
- Anti-requirement violations fully removed
- SubComponents.tsx at 566 LOC (34 margin — monitor)

## Questions for External Review

1. **Anti-requirement removal scope:** We removed 7 files, modified 20+, and deleted 2,200 lines. Was the removal too aggressive? Should we have left stub code for future reconsideration?

2. **Reputation weight redistribution:** The `helpful_votes` signal (0.10 weight) was redistributed to `rating_count` (+0.05) and `rating_consistency` (+0.05). Is this the right redistribution, or should other signals have received the weight?

3. **Copy-link vs native share UX:** On ranked cards, native share is tap and copy-link is long-press. On business detail, both are visible buttons. Is this inconsistency a problem?

4. **Seed data hours:** We added hardcoded opening hours templates by category. Is this better than leaving hours null? Does it create a false sense of accuracy?

5. **Scroll-to-focus offset:** We use a 40px offset when scrolling to the focused dimension. How was this number chosen? Should it be responsive to screen size?

## Files Changed (Sprints 335-339)
- Sprint 336: 7 files deleted, 20+ modified (anti-requirement removal)
- Sprint 337: `lib/sharing.ts` + 3 consumer files (copy-link)
- Sprint 338: `server/seed.ts` (hours templates + enrichment)
- Sprint 339: `app/rate/[id].tsx` (scroll-to-focus)

## Constraints
- This is a critique REQUEST. The response goes in `docs/critique/outbox/SPRINT-335-339-RESPONSE.md`.
- I (the developer) must NOT write the response myself.
