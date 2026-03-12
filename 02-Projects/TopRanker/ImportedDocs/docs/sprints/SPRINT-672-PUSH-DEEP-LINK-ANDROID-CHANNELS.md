# Sprint 672: Push Notification Deep Linking QA + Android Channels

**Date:** 2026-03-11
**Points:** 3
**Focus:** Multi-channel Android notifications + validated deep link handling

## Mission

Android previously had one "default" notification channel for all notification types. Users couldn't control which notifications they received. This sprint adds 5 typed Android channels (general, tier promotions, challenges, digest, reminders) with appropriate priority/vibration settings, and adds type-safe deep link validation in the notification tap handler.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Android requires notification channels since API 26. Having just one 'default' channel means users can't silence weekly digests without losing tier promotion alerts. Five channels gives granular control."

**Amir Patel (Architecture):** "The channel mapping lives in two places — client-side for channel creation, server-side for channelId assignment when sending. The mapping is identical in both places to ensure consistency."

**Marcus Chen (CTO):** "Deep link validation is important for security. We were blindly casting data?.screen to string. Now we validate against a known list of screens before navigating. This prevents potential injection via malformed push payloads."

**Nadia Kaur (Cybersecurity):** "The old code did `data?.type as string` which could pass any value to analytics. Now we use typeof guards on all data fields extracted from notification payloads. Also, `isValidDeepLinkScreen` prevents navigation to arbitrary routes."

## Changes

### `lib/notifications.ts` (+40 LOC)
- Added 5 Android notification channels: default, tier_upgrade, challenger, digest, reminders
- Each channel has appropriate importance level (HIGH → LOW), vibration pattern, and description
- Added `NOTIFICATION_CHANNEL_MAP` — maps NotificationType to channel ID
- Added `VALID_DEEP_LINK_SCREENS` const array + `isValidDeepLinkScreen()` type guard
- Channels created in parallel via `Promise.all` for faster startup

### `server/push.ts` (+8 LOC)
- Server-side channel mapping — maps notification `data.type` to channelId
- Reminders channel sends with `sound: null` (silent)
- All other channels use `sound: "default"`

### `app/_layout.tsx` (+4 LOC)
- Imported `isValidDeepLinkScreen` from notifications
- All data fields use `typeof` guard instead of `as string` cast
- Added `if (!isValidDeepLinkScreen(screen)) return;` before navigation
- notifType defaults to "unknown" at extraction, not at usage

### Test fixes
- `sprint501-client-open-wiring.test.ts` — updated type extraction assertion
- `sprint507-client-notification-analytics.test.ts` — updated analytics parameter assertion

## Android Channel Architecture

| Channel ID | Name | Importance | Sound | Vibration |
|---|---|---|---|---|
| `default` | General | HIGH | Yes | Full |
| `tier_upgrade` | Tier Promotions | HIGH | Yes | Short burst |
| `challenger` | Challenges | HIGH | Yes | Full |
| `digest` | Weekly Digest | DEFAULT | Yes | Short |
| `reminders` | Reminders | LOW | No | None |

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 659.9kb
