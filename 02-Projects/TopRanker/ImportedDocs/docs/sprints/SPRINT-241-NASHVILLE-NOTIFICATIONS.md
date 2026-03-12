# Sprint 241 — Nashville Beta Promotion + Real-Time Notifications

**Date**: 2026-03-09
**Theme**: City Expansion + Notification Infrastructure
**Story Points**: 10
**Tests Added**: 42 (sprint241-nashville-notifications.test.ts)

---

## Mission Alignment

Nashville promotion to beta expands our Southern footprint to four beta cities, bringing
trustworthy rankings closer to Middle Tennessee. The real-time notification module lays
the infrastructure for member engagement -- keeping users informed about ratings, tier
promotions, badge achievements, and challenge invites without relying on email alone.

---

## Team Discussion

**David Okonkwo (VP Product)**: "Nashville has been in planned status since Sprint 234.
We now have 40+ seeded businesses and the Memphis beta has been stable for weeks. Promoting
Nashville to beta means our Tennessee expansion is fully online. The notification system
is the missing piece for member retention -- users need to know when something happens
that matters to them."

**Sarah Nakamura (Lead Engineer)**: "The notification module is intentionally in-memory
for now. At our current scale, a Map-based store with a 100-notification cap per member
is more than sufficient. When we hit the point where server restarts lose notifications,
we migrate to the DB. The API surface is clean: create, get, unread count, mark read,
mark all read, delete, stats, clear."

**Amir Patel (Architecture)**: "I reviewed the module design. It follows our established
pattern from alerting.ts -- in-memory store, tagged logger, cap on collection size.
The routes file is minimal and delegates entirely to the notification module. No DB
imports means zero risk of migration coupling. Clean separation."

**Marcus Chen (CTO)**: "Four beta cities now: Oklahoma City, New Orleans, Memphis, Nashville.
Zero planned cities remaining. Next promotion cycle should move OKC or NOLA to active
based on engagement metrics. The notification infrastructure is a prerequisite for the
weekly digest feature on our roadmap."

**Nadia Kaur (Cybersecurity)**: "The notification routes use memberId from the request
context. In production, this must come from the authenticated session, not from query
params. The current implementation falls back to 'anonymous' which is acceptable for
beta but needs hardening before GA. Also confirmed: no PII leaks in notification bodies
since we control all message templates."

**Priya Sharma (Frontend)**: "Once the backend is stable, the frontend notification
bell component will poll /api/notifications/unread-count on a 30-second interval and
show a badge. Tapping opens the notification drawer. The API shape is exactly what we
need -- notifications array plus unreadCount in a single response."

---

## Changes

### Nashville Beta Promotion
- `shared/city-config.ts`: Nashville status changed from "planned" to "beta"
- Nashville launchDate set to "2026-03-09"
- City stats now: 5 active, 4 beta, 0 planned, 9 total

### Real-Time Notification Module
- New file: `server/notifications.ts`
- In-memory Map-based store with 100-notification cap per member
- 8 exported functions: createNotification, getNotifications, getUnreadCount,
  markAsRead, markAllRead, deleteNotification, getNotificationStats, clearNotifications
- 7 notification types: rating_received, claim_approved, tier_promoted, badge_earned,
  challenge_invite, weekly_digest, system
- Tagged logger: "Notifications"

### Notification API Routes
- Rewritten: `server/routes-notifications.ts` to use new notifications module
- 5 endpoints: GET /api/notifications, GET /api/notifications/unread-count,
  POST /api/notifications/:id/read, POST /api/notifications/read-all,
  DELETE /api/notifications/:id
- Already wired into routes.ts (no change needed)

### Cascade Test Updates
- `tests/sprint218-city-expansion-alerting.test.ts`: Nashville beta, stats.beta=4, stats.planned=0
- `tests/sprint234-memphis-nashville-expansion.test.ts`: Nashville beta, getPlannedCities empty

---

## Files Changed

| File | Action |
|------|--------|
| `shared/city-config.ts` | Modified — Nashville planned -> beta |
| `server/notifications.ts` | Created — notification module |
| `server/routes-notifications.ts` | Rewritten — uses new notification module |
| `tests/sprint218-city-expansion-alerting.test.ts` | Updated — cascade fixes |
| `tests/sprint234-memphis-nashville-expansion.test.ts` | Updated — cascade fixes |
| `tests/sprint241-nashville-notifications.test.ts` | Created — 42 tests |

---

## What's Next (Sprint 242)

- Frontend notification bell component with polling
- Notification preference settings (opt-out per type)
- Consider promoting Oklahoma City to active based on engagement data
