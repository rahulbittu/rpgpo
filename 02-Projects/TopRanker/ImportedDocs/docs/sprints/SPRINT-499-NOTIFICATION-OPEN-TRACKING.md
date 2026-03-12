# Sprint 499: Notification Open Tracking

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add notification open tracking to the push analytics pipeline. Sprint 492 built delivery tracking (send/success/error), but we had no data on whether users actually opened notifications. This sprint adds open recording, open analytics, and a combined insights endpoint for the admin dashboard.

## Team Discussion

**Marcus Chen (CTO):** "Delivery success doesn't mean user engagement. A 95% delivery rate with 5% open rate tells a very different story than 95% delivery with 40% open rate. This data drives notification strategy."

**Rachel Wei (CFO):** "Open rates by category tell us which notifications are valuable. If ranking changes get 30% opens but weekly digests get 5%, that's a signal about what users care about. This data directly informs our notification frequency decisions."

**Amir Patel (Architect):** "Clean extension of push-analytics.ts — separate open record store, parallel analytics computation, combined insights endpoint. The module grows from 133 to ~225 LOC. Still well within single-module territory."

**Sarah Nakamura (Lead Eng):** "Two new endpoints: POST /api/notifications/opened (auth required, client calls on notification tap) and GET /api/notifications/insights (admin dashboard, combines delivery + open data with computed open rate)."

**Jasmine Taylor (Marketing):** "Open rate data by category will be crucial for our push notification strategy. We can A/B test notification copy and measure which versions get higher open rates."

**Nadia Kaur (Cybersecurity):** "The opened endpoint requires authentication, preventing unauthenticated spam. Input sanitization limits notificationId to 100 chars and category to 50. The insights endpoint caps daysBack at 90 to prevent memory-heavy queries."

## Changes

### Modified: `server/push-analytics.ts` (133 → ~225 LOC)
- `NotificationOpenRecord` interface: notificationId, category, memberId, openedAt
- `recordNotificationOpen()` — records a notification open event with member attribution
- `computeOpenAnalytics()` — aggregates opens by category, counts unique members
- `getNotificationInsights()` — combined delivery + open analytics with computed open rate
- `getOpenRecordCount()` — health check for open record store

### Modified: `server/routes-notifications.ts` (55 → ~77 LOC)
- `POST /api/notifications/opened` — client reports notification tap (auth required)
- `GET /api/notifications/insights` — combined delivery + open analytics for admin dashboard

### New: `__tests__/sprint499-notification-open-tracking.test.ts` (22 tests)

## API Surface

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/notifications/opened` | Yes | Record notification open |
| GET | `/api/notifications/insights` | No | Admin delivery + open analytics |

## Test Coverage
- 22 new tests, all passing
- Full suite: 9,219 tests across 388 files, all passing in ~5.0s
- Server build: 666.1kb
