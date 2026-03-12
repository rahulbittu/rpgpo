# Sprint 658: Batch Rating Reminder Query (N+1 Elimination)

**Date:** 2026-03-11
**Points:** 2
**Focus:** Replace N+1 per-user query in rating reminder push with batch LEFT JOIN + GROUP BY

## Mission

The `sendRatingReminderPush()` function in `notification-triggers.ts` was querying each user individually to check recent rating activity — a classic N+1 pattern. With growing user counts, this would degrade push delivery performance. This sprint replaces the per-user queries with a single LEFT JOIN + GROUP BY batch query.

## Team Discussion

**Amir Patel (Architecture):** "N+1 queries are the #1 performance anti-pattern we track. The fix is textbook: LEFT JOIN the ratings table with a date filter, GROUP BY member, count in the SELECT. One query instead of N."

**Sarah Nakamura (Lead Eng):** "The batch query returns `recentRatingCount` per user. Users with count > 0 are active and get skipped. Zero-count users get the reminder push. Same logic, O(1) queries instead of O(N)."

**Marcus Chen (CTO):** "This closes the last medium finding from Audit #110. All three mediums from the last two audits are now resolved: api.ts ceiling (Sprint 656), rate limiting (Sprint 657), and N+1 (this sprint)."

**Nadia Kaur (Cybersecurity):** "No security surface change — same data, same access pattern, just fewer round trips. The LEFT JOIN condition uses parameterized SQL via Drizzle's template literals, so no injection risk."

## Changes

### `server/notification-triggers.ts` (265 → 266 LOC)
- **Before:** Fetched all users with push tokens, then for each user queried ratings table individually to check recent activity
- **After:** Single query with LEFT JOIN on ratings (filtered to last 7 days) + GROUP BY members.id
- `recentRatingCount` computed via `sql<number>\`count(${ratings.id})\`` aggregate
- Loop checks `user.recentRatingCount > 0` to skip active users (replaces per-user query)

### Query Pattern
```sql
SELECT members.*, count(ratings.id) as recentRatingCount
FROM members
LEFT JOIN ratings ON ratings.memberId = members.id AND ratings.createdAt > ?
WHERE members.pushToken IS NOT NULL
GROUP BY members.id
```

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 647.0kb (unchanged)
- **notification-triggers.ts:** 266 LOC (no ceiling tracked — under 300)
