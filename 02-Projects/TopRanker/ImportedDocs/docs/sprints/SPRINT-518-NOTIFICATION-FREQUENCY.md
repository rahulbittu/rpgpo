# Sprint 518: Notification Frequency Settings

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 35 new (9,577 total across 407 files)

## Mission

Add user-configurable notification frequency controls: realtime (immediate), daily digest (batched at 9am UTC), or weekly digest (Monday 10am UTC). Applies to three high-volume categories: ranking changes, new ratings, and city highlights.

## Team Discussion

**Marcus Chen (CTO):** "Notification fatigue is the #1 reason users disable push entirely. Frequency settings let power users stay on realtime while casual users get a daily or weekly summary. This retains the opt-in while reducing irritation."

**Amir Patel (Architecture):** "The batch queue is in-memory with a drain-on-schedule pattern. Notifications queued for daily delivery get grouped by member and sent as a single summary push at 9am UTC. The queue drains fully each cycle — no stale notifications."

**Sarah Nakamura (Lead Eng):** "FrequencyPicker only shows when the parent toggle is on. If you disable 'Ranking Changes', the frequency picker disappears. No confusing state where frequency is set but notifications are off. Clean conditional rendering."

**Rachel Wei (CFO):** "Three categories support frequency because they're the highest volume: ranking changes, new ratings, city highlights. Low-volume categories like tier upgrades and claim decisions stay realtime-only — there's no batching benefit."

**Nadia Kaur (Security):** "Frequency preferences are validated server-side. Only 'realtime', 'daily', and 'weekly' are accepted — anything else defaults to 'realtime'. No injection vector through the preference endpoint."

## Changes

### New Files

| File | LOC | Purpose |
|------|-----|---------|
| `server/notification-frequency.ts` | 183 | Frequency types, batch queue, drain/send, daily scheduler |
| `__tests__/sprint518-notification-frequency.test.ts` | 155 | 35 tests across 5 sections |

### Modified Files

| File | Before | After | Delta | Change |
|------|--------|-------|-------|--------|
| `app/settings.tsx` | 472 | 530 | +58 | FrequencyPicker component, freq state, 3 frequency pickers |
| `server/routes-members.ts` | 262 | 282 | +20 | GET/PUT /api/members/me/notification-frequency |
| `server/storage/members.ts` | 375 | 388 | +13 | updateNotificationFrequencyPrefs function |
| `server/storage/index.ts` | — | — | +1 | Export new function |
| `shared/schema.ts` | — | — | +2 | notificationFrequencyPrefs jsonb column |

### Architecture

- **Frequency types:** `realtime` | `daily` | `weekly`
- **Batch queue:** In-memory Map keyed by `memberId:category`, drained on schedule
- **Daily scheduler:** 9am UTC, drains all queued notifications
- **Summary push:** Multiple queued items → single "X updates while you were away" push
- **Conditional UI:** FrequencyPicker only renders when parent toggle is enabled
- **Server validation:** Only accepts realtime/daily/weekly, defaults to realtime

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/members/me/notification-frequency` | Get frequency prefs |
| PUT | `/api/members/me/notification-frequency` | Update frequency prefs |

## Test Summary

- `__tests__/sprint518-notification-frequency.test.ts` — 35 tests
  - notification-frequency.ts: 16 tests (types, queue, drain, batch, scheduler, LOC)
  - settings.tsx: 12 tests (picker UI, state, AsyncStorage, conditional rendering, sync)
  - routes-members.ts: 4 tests (endpoints, validation)
  - schema.ts: 1 test (new column)
  - storage/members.ts: 2 tests (function, field update)
