# Retro 546: Recent/Popular Query Deduplication

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Quick retro action item closure. Sprint 544 flagged the dedup issue, Sprint 546 resolved it. The excludeQueries pattern is reusable — if we ever add a third query source (e.g., trending queries from different cities), the same filtering pattern applies."

**Amir Patel:** "No server changes needed. The deduplication is purely a client-side rendering concern — the server still returns all popular queries, and the client filters at display time. This keeps the API simple and the dedup logic visible."

**Sarah Nakamura:** "The Set-based approach with normalization handles edge cases (case, whitespace) without overcomplicating the component. Total change was 4 lines in PopularQueriesPanel and 1 line in search.tsx."

## What Could Improve

- **No integration test for dedup behavior** — We test that the code contains `excludeSet.has` but don't verify the actual filtering logic with real data. Same gap identified in the Sprint 545 critique.
- **Server build unchanged at 705.7kb** — Client-only change, no impact on build size. Good.

## Action Items

- [ ] Sprint 547: Business hours & status display — **Owner: Sarah**
- [ ] Consider behavioral test for query dedup with mock data — **Owner: Sarah**

## Team Morale
**8/10** — Clean, focused sprint closing a retro action item. Good velocity on the SLT-545 roadmap.
