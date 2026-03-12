# Sprint 479: Notification Preferences UI

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Replace the simple "Notification Preferences" link on Profile tab with an inline expandable card showing all notification categories grouped by type. Add 3 new push notification categories (ranking changes, saved business alerts, city highlights) across Profile, Settings, and server endpoints.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The NotificationPreferencesCard uses an expand/collapse pattern — collapsed shows a summary badge (e.g., '6/8 enabled'), expanded shows grouped toggles. This keeps the Profile tab clean while giving full control without navigating away."

**Amir Patel (Architect):** "Three new push categories — rankingChanges, savedBusinessAlerts, cityAlerts — are all defaulting to true. The server stores them in the existing notificationPrefs JSONB column, so no migration needed. The trigger functions that actually send these pushes will come in future sprints."

**Marcus Chen (CTO):** "The group structure (Activity, Push Alerts, Email) maps cleanly to how users think about notifications. Activity = things I did, Push = things happening around me, Email = marketing. This mental model will scale as we add more categories."

**Jasmine Taylor (Marketing):** "City Highlights is the category I'm most excited about. 'A new #1 biryani in Irving' as a push notification drives re-engagement. We should prioritize the trigger for this category."

**Rachel Wei (CFO):** "Having notification preferences directly on Profile reduces the friction of opting in or out. Users who see the toggles during profile review are more likely to leave them on than users who have to navigate to Settings."

**Jordan Blake (Compliance):** "The AsyncStorage + server sync pattern means preferences survive app reinstalls (via server) and work offline (via AsyncStorage). CAN-SPAM compliance requires that marketing emails default to opt-in with easy opt-out — both conditions met."

## Changes

### New: `components/profile/NotificationPreferencesCard.tsx` (~175 LOC)
- `NOTIFICATION_CATEGORIES` — 8 categories with key, label, sublabel, icon, group
- `NotificationCategoryKey` type export
- 3 groups: Activity (4 categories), Push Alerts (3 categories), Email (1 category)
- Expand/collapse header with enabled count badge
- Switch toggles per category with AsyncStorage + server sync
- Fire-and-forget PUT to server on toggle

### Modified: `app/(tabs)/profile.tsx` (+2/-2 LOC)
- Replaced `NotificationSettingsLink` import with `NotificationPreferencesCard`
- Renders `<NotificationPreferencesCard />` instead of `<NotificationSettingsLink />`

### Modified: `app/settings.tsx` (+18 LOC)
- Added 3 new keys to `NOTIFICATION_KEYS`: rankingChanges, savedBusinessAlerts, cityAlerts
- Added 3 new entries in `notifPrefs` state with default true
- Added 3 new `<SettingRow>` toggles: Ranking Changes, Saved Place Updates, City Highlights

### Modified: `server/routes-members.ts` (+8 LOC)
- GET endpoint: Added rankingChanges, savedBusinessAlerts, cityAlerts defaults (all true)
- PUT endpoint: Destructures and persists 3 new categories

### Modified: `tests/sprint181-profile-decomposition.test.ts`
- Updated profile component check from NotificationSettingsLink to NotificationPreferencesCard

### New: `__tests__/sprint479-notification-preferences.test.ts` (22 tests)
- NotificationPreferencesCard: categories, groups, expand/collapse, toggles, sync
- Profile tab: imports, renders new card, no longer uses link
- Server endpoint: new categories in GET/PUT
- Settings page: new keys, state, toggle rows

## Test Coverage
- 22 new tests, all passing
- Full suite: 8,863 tests across 370 files, all passing in ~4.7s
- Server build: 640.4kb (unchanged)
