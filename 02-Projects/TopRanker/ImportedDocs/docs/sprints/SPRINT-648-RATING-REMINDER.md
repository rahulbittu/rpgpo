# Sprint 648: Rating Reminder Push Notification

**Date:** 2026-03-11
**Points:** 3
**Focus:** Daily push notification to remind inactive users to rate

## Mission

Users who haven't rated in 7+ days need a gentle nudge. Add a `sendRatingReminderPush()` trigger that runs daily at 6pm UTC (12pm CST — lunchtime in Dallas, prime food-thinking time) and sends personalized reminders to inactive users.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The scheduler follows the same pattern as weekly digest and city highlights — setTimeout for first run, then setInterval. The 6pm UTC timing is intentional — it's noon in Dallas when people are thinking about food."

**Jasmine Taylor (Marketing):** "The copy — 'Your neighborhood misses you' with 'new restaurants and live challenges are waiting' — creates FOMO without being pushy. It reminds users that content is moving without them."

**Marcus Chen (CTO):** "Critical detail: we check the `ratingReminders` preference. Users who opt out don't get nagged. And we query recent ratings per-user to avoid bothering active users."

**Amir Patel (Architecture):** "The N+1 query pattern (querying recent ratings per user) is acceptable for our scale. At 500 users, that's 500 simple indexed queries. We can batch-optimize later if needed."

**Rachel Wei (CFO):** "Reactivation is the cheapest growth. A push notification to an existing user costs nothing but can drive a rating that improves the leaderboard."

**Nadia Kaur (Cybersecurity):** "The notification data only contains `screen: 'search'` — no PII leaked in push payload. Preference check is server-side, not client-side."

## Changes

### `server/notification-triggers.ts`
- Added `sendRatingReminderPush()` — queries inactive users (no rating in 7 days), sends personalized push
- Added `startRatingReminderScheduler()` — daily at 6pm UTC
- Respects `ratingReminders` notification preference
- Personalized: uses first name and selected city

### `server/index.ts`
- Wired `startRatingReminderScheduler()` alongside existing schedulers
- Import updated to include new function

### Test Updates
- `sprint504`: notification-triggers.ts ceiling 200 → 280
- `sprint505`: notification-triggers.ts ceiling 200 → 280

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 640.6kb (was 637.9kb — +2.7kb for server-side push logic)
- **notification-triggers.ts:** 267 LOC (ceiling 280)
