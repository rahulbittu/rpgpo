# Claude Builder Output
## Detect N+1 Queries
## Stage: audit
## Outcome: code_applied
## Date: 2026-03-13
## Duration: 139s
## Working Directory: /Users/rpgpo/Projects/RPGPO/02-Projects/TopRanker/source-repo
## Target Files: 03-Operations/Reports/TopRanker-Operating-Summary.md
## Output: 1 lines, 4336 bytes

### Builder Output
Here's the complete N+1 query analysis:

---

## N+1 Query Patterns Found

### Critical — User-Facing Endpoints

**1. `server/storage/dishes.ts:92-98` — `getDishLeaderboards()`**
```
for (const board of boards) {
  const [entryResult] = await db.select({ cnt: count() })
    .from(dishLeaderboardEntries)
    .where(eq(dishLeaderboardEntries.leaderboardId, board.id));
}
```
Fetches all active leaderboards, then issues **1 COUNT query per leaderboard** to get entry counts. **Fix:** Single query with `GROUP BY leaderboardId` or a left join with count.

**2. `server/storage/dishes.ts:164-180` — `getDishLeaderboardWithEntries()` (visit-type filter)**
```
for (const entry of entries) {
  const vtRatings = await db.select(...)
    .from(dishVotes).innerJoin(ratings, ...)
    .where(eq(dishVotes.businessId, entry.businessId), ...);
}
```
When a `visitType` filter is applied, fires **1 query per leaderboard entry** to compute visit-type-specific scores. **Fix:** Single query grouping by `businessId` with conditional aggregation.

**3. `server/storage/dishes.ts:213-220` — `getDishLeaderboardWithEntries()` (photo counts)**
```
Promise.all(filteredEntries.map(async (e) => {
  const [photoCount] = await db.select({ cnt: count() })
    .from(ratingPhotos).innerJoin(dishVotes, ...)
    .where(eq(dishVotes.businessId, e.businessId));
}));
```
**1 COUNT query per entry** for dish photo counts, parallelized but still N round-trips. **Fix:** Single query with `GROUP BY businessId` and `WHERE businessId IN (...)`.

**4. `server/storage/dishes.ts:496-506` — `getBusinessDishRankings()`**
```
for (const entry of entries) {
  const [countResult] = await db.select({ count: count() })
    .from(dishLeaderboardEntries).innerJoin(dishLeaderboards, ...)
    .where(eq(dishLeaderboards.dishSlug, entry.dishSlug));
}
```
**1 COUNT query per dish entry** for a business's rankings. **Fix:** Single query with `GROUP BY dishSlug`.

---

### Moderate — Write-Path / Background Jobs

**5. `server/storage/dishes.ts:354-364` — `recalculateDishLeaderboard()`**
```
for (let i = 0; i < entries.length; i++) {
  await db.insert(dishLeaderboardEntries).values({...});
}
```
**N sequential inserts** instead of a single batch `db.insert(...).values([...allEntries])`.

**6. `server/storage/challengers.ts:113-140` — `updateChallengerVotes()`**
Two loops with **N sequential UPDATE** queries (one per active challenger as challenger, one per active challenger as defender). **Fix:** Use `sql` UPDATE with `CASE` expression or `WHERE id IN (...)`.

**7. `server/storage/challengers.ts:161-188` — `closeExpiredChallenges()`**
Per expired challenge: **1 UPDATE + 1 SELECT** (to fetch winner business name). N challenges = 2N queries. **Fix:** Batch update with `WHERE id IN (...)`, batch-fetch business names with `WHERE id IN (...)`.

---

### Low — Admin-Only Endpoints (Capped Input)

**8. `server/routes-admin-enrichment-bulk.ts:59-76` — `POST /api/admin/enrichment/bulk-dietary`**
**2N queries** (N selects + N updates) in a loop, capped at 100 items. **Fix:** Batch select with `WHERE id IN (...)`, then batch update.

**9. `server/routes-admin-enrichment-bulk.ts:116-131` — `POST /api/admin/enrichment/bulk-dietary-by-cuisine`**
N sequential updates. **Fix:** Batch update by computing tags in-app then issuing one update per distinct tag set using `WHERE id IN (...)`.

**10. `server/routes-admin-enrichment-bulk.ts:180-204` — `POST /api/admin/enrichment/bulk-hours`**
**2N queries** (N selects + N updates), capped at 50 items. Same fix as #8.

---

### Priority Recommendations

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| **P0** | #2, #3 — `getDishLeaderboardWithEntries` | User-facing, scales with entries per leaderboard | Rewrite as single grouped queries |
| **P0** | #1, #4 — Leaderboard/ranking COUNT loops | User-facing, scales with board count | Use `GROUP BY` in a single query |
| **P1** | #5 — Sequential inserts in recalculate | Background job but blocks recalc | Use batch `.values([...])` |
| **P1** | #6 — Challenger vote updates | Triggered on every rating submission | Batch UPDATE with CASE/IN |
| **P2** | #7 — closeExpiredChallenges | Hourly cron, typically small N | Batch update + batch select |
| **P3** | #8-10 — Admin bulk endpoints | Admin-only, input-capped | Batch when convenient |


### Files Changed
- __tests__/sprint818-startup-preload.test.ts
- lib/app-preload.ts
- 02-Projects/TopRanker/source-repo
- 03-Operations/Logs/Decisions/2026-03-13-DashboardActions.md
- 04-Dashboard/app/app.js
- 04-Dashboard/app/index.html
- 04-Dashboard/app/style.css
- 04-Dashboard/state/costs.json
- 04-Dashboard/state/intake-tasks.json
- 04-Dashboard/state/subtasks.json
- 04-Dashboard/state/tasks.json

### Diff Summary
```
.../sprint688-native-offline-detection.test.ts     |  4 +-
 __tests__/sprint699-startup-performance.test.ts    |  8 +--
 app/_layout.tsx                                    | 65 ++++++++++++----------
 lib/bookmarks-context.tsx                          | 17 +++++-
 lib/city-context.tsx                               |  8 ++-
 lib/theme-context.tsx                              |  8 ++-
 lib/use-realtime.ts                                |  5 +-
 7 files changed, 71 insertions(+), 44 deletions(-)
```
