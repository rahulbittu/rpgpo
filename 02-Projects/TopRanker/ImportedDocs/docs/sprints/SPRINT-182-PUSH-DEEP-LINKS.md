# Sprint 182: Push Deep Links + Notification Center

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Entity-level deep linking from push notifications and in-app notification center with persistence

---

## Mission Alignment
Push notifications without actionable destinations are wasted engagement. Tapping "Your credibility reached Trusted tier" should navigate to the profile — that already worked. But tapping "Joe's Tacos replied to your rating" needs to open Joe's Tacos — that was missing. This sprint makes every notification actionable by adding entity-level deep links (business, challenger, dish). The notification center gives users a persistent record of their notifications, reinforcing that every interaction on TopRanker has **consequence** (Core Value #4).

---

## Team Discussion

**Marcus Chen (CTO):** "Push notifications were fire-and-forget — sent once, lost if missed. The notification center persists every push as an in-app record. Users can scroll through their notification history, mark items read, and deep link to the relevant content. This is the engagement infrastructure real apps need."

**Sarah Nakamura (Lead Eng):** "Enhanced deep linking adds entity-level navigation: `screen=business` + `slug=joes-tacos` navigates to the business page. `screen=challenger` + `id=abc123` opens the specific challenge. The _layout.tsx handler checks for `slug` and `id` data fields before falling back to tab-level navigation."

**Amir Patel (Architecture):** "New `notifications` table with standard CRUD. Route module is 65 lines — minimal. The `persistNotification` helper in push.ts is fire-and-forget (catches its own errors) so it never blocks push delivery. Each notification function now calls both `sendPushNotification` and `persistNotification`."

**Priya Sharma (Design):** "The notification center will show a list of past notifications with read/unread state. The unread badge count endpoint supports showing a notification bell badge on the profile tab. The mark-all-read endpoint is for the 'Clear all' button."

**Rachel Wei (CFO):** "Engagement = retention = revenue. Every push notification that actually leads somewhere is a user who might rate, subscribe, or pay for a challenge. Deep links turn push from marketing noise into product utility."

**Nadia Kaur (Security):** "All notification endpoints require authentication. Mark-read verifies `memberId` ownership — you can't mark another user's notifications. The data payload in notifications is limited to `screen` + `slug` + `id` — no PII exposed."

---

## Changes

### New Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/storage/notifications.ts` | ~100 | createNotification, getMemberNotifications, markRead, markAllRead, getUnreadCount |
| `server/routes-notifications.ts` | ~65 | 4 notification center API endpoints |

### Modified Files
| File | Change |
|------|--------|
| `shared/schema.ts` | Added `notifications` table with member_id, type, title, body, data (jsonb), read |
| `server/push.ts` | Added `persistNotification` helper; each push function now persists in-app notification |
| `app/_layout.tsx` | Enhanced deep linking: business (slug), challenger (id), dish (slug) |
| `server/routes.ts` | Register notification routes |
| `server/storage/index.ts` | Export notification storage functions |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/notifications` | Required | Paginated notification list with unread count |
| GET | `/api/notifications/unread-count` | Required | Badge count for notification bell |
| PATCH | `/api/notifications/:id/read` | Required | Mark single notification as read |
| POST | `/api/notifications/mark-all-read` | Required | Mark all notifications as read |

### Deep Link Mappings
| screen | params | Navigation |
|--------|--------|------------|
| business | slug | `/business/[id]` |
| challenger | id | `/(tabs)/challenger` with params |
| dish | slug | `/dish/[slug]` |
| profile | — | `/(tabs)/profile` |
| search | — | `/(tabs)/search` |

---

## Test Results
- **43 new tests** for push deep links + notification center
- Full suite: **2,825 tests** across 115 files — all passing, <1.8s
