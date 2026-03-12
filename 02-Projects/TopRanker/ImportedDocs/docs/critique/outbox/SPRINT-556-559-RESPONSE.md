# Sprints 556-559 External Critique

## Verified wins
- HoursEditor now fetches existing `openingHours` for pre-fill in sprint 556.
- A bidirectional hours conversion utility exists in sprint 557: `weekdayTextToPeriods` and `periodsToWeekdayText`.
- Threshold config was centralized in sprint 558 via `shared/thresholds.json`.
- A dynamic health check exists in sprint 558 via `file-health.test.ts`.
- Hours conversion was actually wired into the PUT route in sprint 559.
- Photo carousel React Query caching was added in sprint 559.
- The packet provides concrete current state metrics rather than vague claims.

## Contradictions / drift
- The biggest process contradiction is acknowledged in the packet: centralized thresholds now exist, but 50+ older per-sprint tests still enforce inline thresholds. That is two sources of truth, not a finished centralization.
- Sprint 558 is described as “centralized threshold config,” but only 13 files are tracked while 50+ old threshold tests remain separate. That is partial migration presented as centralization.
- The scope is framed as feature polish + process improvement, but the roadmap immediately shifts extraction-heavy. That is drift from user-facing improvement toward internal refactoring.
- The React pre-fill implementation uses synchronous `setState` during render for one-time initialization. Even if it “works,” it conflicts with stated interest in maintainability and idiomatic patterns.
- The conversion utility is claimed as bidirectional, but the packet itself questions parser robustness around localized formats and edge cases. So the utility exists, but reliability boundaries are not yet settled.
- The modal-fetch question suggests uncertainty in the chosen query pattern after implementation. That implies the team shipped wiring before fully settling the intended loading model.

## Unclosed action items
- Resolve the HoursEditor initialization pattern: move pre-fill syncing to `useEffect` or explicitly document why render-time state sync is acceptable.
- Decide parsing policy for `weekdayTextToPeriods`: strict rejection vs graceful fallback, and encode that in tests.
- Eliminate threshold duality: migrate old per-sprint assertions to `thresholds.json` or remove them. Do not keep both indefinitely.
- Clarify the photo carousel fetch strategy: `enabled:false + refetch()` vs `enabled: carouselOpen`, and standardize the pattern.
- Reassess the 561-565 roadmap balance. Three extraction-focused sprints out of five is weak if core-loop or business impact is the stated priority.
- If 13 files are centralized, define the migration plan and end-state for the remaining threshold-governed files.

## Core-loop focus score
**5/10**

- Hours pre-fill and PUT-route wiring are directly adjacent to the product editing loop.
- Hours conversion utility supports the core admin flow, but much of the work is infrastructure around the flow rather than user-visible improvement.
- Threshold centralization is process work, not core-loop work.
- Photo carousel caching is secondary UX polish, not central to the main business loop.
- The next roadmap being 60% extraction-heavy indicates likely further drift from user outcomes.
- Too much of the packet is about implementation cleanliness decisions that should already be settled, not validated product movement.

## Top 3 priorities for next sprint
1. Finish the threshold migration so there is exactly one source of truth for file health limits.
2. Harden and bound the hours conversion contract with explicit tests for accepted/rejected formats, then stop debating parser intent.
3. Cut at least one extraction sprint from 561-565 in favor of a directly user-facing improvement tied to the admin/business editing loop.

**Verdict:** These sprints delivered real plumbing, but the packet overstates completion on threshold centralization and leaves too many basic implementation decisions half-settled after shipping. The work is useful, but focus is slipping toward refactor theater and transitional systems instead of closing loops cleanly.
