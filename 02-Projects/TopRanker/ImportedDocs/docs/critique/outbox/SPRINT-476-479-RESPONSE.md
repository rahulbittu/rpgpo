# Sprints 476–479 External Critique

## Verified wins
- Sprint 476 shows a real extraction, not just file shuffling: `server/search-result-processor.ts` was created with a clear 3-stage pipeline and `routes-businesses.ts` dropped from 376 to 305 LOC before later creep.
- Sprint 477 also shows a real UI extraction: `components/profile/DateRangeFilter.tsx` was created and `RatingHistorySection.tsx` dropped from 319 to 210 LOC, with backward-compatible re-exports.
- Sprint 478 kept analytics logic in a dedicated module (`server/dashboard-analytics.ts`) with pure functions. That is the right shape for testability.
- Sprint 479 shipped end-to-end preference surface area, not just UI: Profile tab changed, server endpoints were updated, and Settings was synced.
- Test investment is non-trivial: 90 new tests across four sprints.

## Contradictions / drift
- The stated goal of extraction is only partially holding. `routes-businesses.ts` fell after Sprint 476, then climbed back to 316 due to dashboard analytics. That is classic controller re-expansion.
- You extracted analytics computation into `server/dashboard-analytics.ts`, but your own question implies dashboard data assembly still lives in the route. That is incomplete extraction, not clean separation.
- Notification preference metadata exists independently in both `settings.tsx` and `NotificationPreferencesCard.tsx`. That is not harmless duplication; it guarantees drift in labels, grouping, defaults, or ordering.
- Sprint 479 shipped “preference infrastructure” without triggers. That creates a user-facing contract before product behavior exists. It is operationally safe only if the UI is explicitly framed as future-facing; otherwise it is hollow configuration.
- Pro/Free gating is implemented by slicing arrays in the dashboard endpoint. Functional, but policy is now embedded in route assembly. If repeated elsewhere, this becomes scattered entitlement logic.
- The sprint set mixes two extraction sprints with two feature sprints, but the result is not a cleaner boundary around the core route files. You reduced local complexity, then reintroduced it in the same server surface.

## Unclosed action items
- Extract dashboard data assembly from `server/routes-businesses.ts` if analytics integration logic is more than thin orchestration.
- Centralize notification category metadata into one shared source used by both `app/settings.tsx` and `NotificationPreferencesCard.tsx`.
- Decide whether push categories without triggers should remain visible. If yes, label them clearly; if no, hide them until delivery exists.
- Define where entitlement logic lives. If dashboard tier gating is the pattern, formalize it in a utility/service rather than ad hoc route slicing.
- Reassess the 200-rating fetch limit with actual query/load expectations. It may be acceptable now, but it is still an undocumented cap with product implications.

## Core-loop focus score
**6/10**
- Search-result processing extraction is close to core-loop work because it touches search relevance and filtering.
- Dashboard analytics is adjacent, but not core-loop unless dashboard usage directly drives the main user value cycle.
- Notification preferences are infrastructure/product surface, but not core-loop until notifications themselves deliver value.
- Two of four sprints were extraction/refactor work, which is acceptable only if it materially stabilizes the primary paths; the route creep suggests partial payoff.
- Good test volume helps confidence, but tests do not compensate for policy duplication and unfinished notification behavior.

## Top 3 priorities for next sprint
1. **Finish the dashboard extraction**  
   Move dashboard assembly/tiering out of `routes-businesses.ts` so the route becomes thin orchestration only.

2. **Eliminate notification metadata duplication**  
   Create one shared notification-category definition and consume it in both Profile and Settings.

3. **Close the gap between notification preferences and actual behavior**  
   Either implement at least one real trigger path for the new push categories or remove/label inactive preferences to avoid fake configurability.

**Verdict:** These sprints produced some real extractions and added tests, but the architectural story is inconsistent. You are improving module boundaries while still letting route files regain responsibility, and Sprint 479 introduced visible configuration that may not map to delivered behavior. The biggest issue is not code size; it is unfinished separation of concerns plus duplicated product policy.
