# Sprints 551-554 External Critique

## Verified wins
- Schema file was reduced from 996 to 935 LOC, freeing 61 LOC.
- Leaderboard filter chip extraction reduced `index.tsx` from 505 to 443 LOC via `LeaderboardFilterChips`.
- Business hours owner update added a `PUT` endpoint plus `HoursEditor` in dashboard.
- Rating photo carousel shipped with tappable photo/receipt badges opening a modal viewer.
- Packet provides concrete metrics and specific implementation details rather than vague claims.

## Contradictions / drift
- Sprint 551 calls the schema work “compression,” but the packet explicitly says it removed a 44-line TOC and circular dependency notes. That is not neutral cleanup; it traded documentation for LOC optics.
- The project is tracking architectural grades and file health closely, yet Sprint 554 allowed `dashboard.tsx` to grow 80 LOC to 569 without extraction. That repeats the exact pattern called out in Sprint 549.
- Sprint 553 shows the team knows how to extract when a file gets too large, but Sprint 554 did not apply the same discipline in the same cycle.
- The hours feature is framed as shipped progress, but the editor initializes with fake placeholder hours instead of current business data. That creates a direct overwrite risk against existing Google Places data. This is feature completion drift: UI and endpoint exist, but the core data flow is unsafe.
- The packet highlights growing threshold redirections as a known problem across multiple sprints, but the fix is deferred to Sprint 558. That is process drift: acknowledged test-maintenance debt is still accumulating while more scattered assertions are added.
- Photo carousel implementation chose per-row modal instantiation. That may be acceptable temporarily, but it is not aligned with the stated concern for component/file health and likely duplicates UI machinery N times.

## Unclosed action items
- Decide whether schema navigation docs removed in Sprint 551 must be restored somewhere. This is unresolved.
- Centralize or otherwise redesign threshold assertions; current scattered test redirections remain unresolved until at least Sprint 558.
- Fix `HoursEditor` initialization to load existing `openingHours` before allowing save. This is the most urgent unclosed item because it risks destructive writes.
- Extract `dashboard.tsx` now or define and enforce a file-growth rule. The issue is identified but not closed.
- Reassess photo carousel architecture and likely lift modal state to the parent if row-level modal duplication is unnecessary.

## Core-loop focus score
**4/10**
- One sprint was pure LOC compression that explicitly reduced inline documentation, which is weak user-value and questionable engineering value.
- Two sprints improved UI structure/interaction, but one of them shipped with an unsafe hours-editing flow that can overwrite real data.
- The team is spending visible attention on file-size thresholds and architecture grades, but not consistently applying those standards when feature pressure hits.
- Extraction discipline was demonstrated in Sprint 553 and then ignored in Sprint 554, which suggests reactive rather than controlled maintenance.
- Test/process debt is accumulating across sprints with a known fix deferred further out.

## Top 3 priorities for next sprint
1. Block unsafe hours saves until the editor loads existing business hours; fix initialization from API data before further expansion of owner-edit features.
2. Extract `dashboard.tsx` immediately and set an enforceable same-sprint rule for large file growth, or stop pretending file-health metrics drive decisions.
3. Centralize threshold/file-health assertions so future sprints stop generating redirect churn across dozens of tests.

**Verdict:** These sprints show output, but not tight control. The cleanest win was the filter-chip extraction; the worst miss was shipping an hours editor that can overwrite real data with defaults. Schema “compression” looks like documentation deletion dressed up as maintenance, and the repeated large-file growth plus deferred threshold cleanup shows the team is measuring architecture more consistently than it is enforcing it.
