# Sprint 676 — Shared Notification Channels

**Date:** 2026-03-11
**Theme:** Single Source of Truth for Notification Channels
**Story Points:** 3

---

## Mission Alignment

Audit #130 flagged A130-L1: notification channel configuration duplicated between client (`lib/notifications.ts`) and server (`server/push.ts`). This sprint extracts the channel map to `shared/notification-channels.ts` so both sides import from one place. Consistency in notification routing prevents silent bugs where a channel rename on one side doesn't propagate.

---

## Team Discussion

**Marcus Chen (CTO):** "This is exactly the kind of cleanup that keeps us at A-grade audits. Shared constants between client and server should always live in `shared/`. The channel map was the last significant duplication between the two sides."

**Amir Patel (Architecture):** "Clean extraction. The `getChannelId()` helper with a default fallback means the server never sends to a nonexistent channel. The `NotificationType` union being shared also eliminates the risk of type drift between client and server."

**Sarah Nakamura (Lead Eng):** "I like that the Android channel setup now iterates `NOTIFICATION_CHANNELS` instead of hardcoding five separate calls. Adding a new channel is now a one-line addition to the shared array — no need to touch three files."

**Jordan Blake (Compliance):** "Notification channel consistency matters for user experience. If we tell users they can control 'Reminders' on Android but the server routes to a different channel ID, that's a broken promise. Single source of truth eliminates that class of bug."

**Nadia Kaur (Security):** "The re-export pattern for `NOTIFICATION_CHANNEL_MAP` maintains backward compatibility without duplicating data. Any code importing from `lib/notifications` still works, but the actual data lives in one place."

---

## Changes

### New Files

| File | LOC | Purpose |
|------|-----|---------|
| `shared/notification-channels.ts` | 49 | Single source of truth for channel config, type→channel map, `getChannelId()` helper |

### Modified Files

| File | Delta | Change |
|------|-------|--------|
| `lib/notifications.ts` | -20 | Import from shared, iterate `NOTIFICATION_CHANNELS` for Android setup, re-export map |
| `server/push.ts` | -8 | Import `getChannelId` from shared, remove inline channel map |

### Architecture

- `shared/notification-channels.ts` exports:
  - `NotificationType` — union of 6 notification types (added `rating_reminder` for Sprint 679)
  - `NotificationChannel` — interface for channel config
  - `NOTIFICATION_CHANNELS` — array of 5 channel definitions
  - `NOTIFICATION_TYPE_TO_CHANNEL` — type→channelId mapping
  - `getChannelId(type)` — lookup with "default" fallback
- Client Android channel setup now iterates `NOTIFICATION_CHANNELS` array with importance mapping
- Server uses `getChannelId()` instead of inline map
- `NOTIFICATION_CHANNEL_MAP` re-exported from shared for backward compatibility

---

## Audit Finding Resolution

| Finding | Status |
|---------|--------|
| A130-L1: Notification Channel Map Duplicated | **RESOLVED** — extracted to `shared/notification-channels.ts` |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 660.2kb / 750kb (88.0%) |
| Tests | 11,697 pass / 501 files |
| Schema | 935 / 950 LOC |
| Tracked files | 33, 0 violations |

---

## What's Next (Sprint 677)

Tests for enrichment + deep link validation (Retro 675 action item).
