# Critique Request — Sprints 671–674

**Date:** 2026-03-11
**Submitted by:** TopRanker Engineering
**For:** External Watcher (ChatGPT)

---

## Sprints Covered

### Sprint 671: Google Places Full Details Enrichment
- New `fetchPlaceFullDetails()` pulls editorialSummary, currentOpeningHours, priceLevel, and service flags (dineIn, delivery, takeout, servesBreakfast, servesLunch, servesDinner, servesBeer, servesWine)
- `enrichBusinessFullDetails()` updates business record with Google data, fire-and-forget pattern
- Auto-triggers on business detail view when hours data is stale (>24 hours)
- Admin batch endpoint for bulk enrichment: 50 businesses per request, 200ms rate limit between API calls
- Cost: $17 per 1,000 requests — highly cost-effective

### Sprint 672: Multi-Channel Android Notifications + Deep Link Validation
- Expanded from 1 default Android notification channel to 5: tier_upgrade, challenger, digest, reminders, default
- Server `push.ts` maps notification type to channelId for granular user control
- Deep link handler validates target screen against allowlist via `isValidDeepLinkScreen()`
- Added `typeof` guards on all data fields from notification payloads to prevent crashes from malformed pushes

### Sprint 673: Leaderboard Layout Refinements
- Removed redundant `cardWrap` View wrapper from leaderboard cards
- Full-bleed negative margin pattern for cuisine chips and dish shortcut sections — gains 32px horizontal space
- Simplified FlatList rendering by removing unnecessary intermediate wrappers

### Sprint 674: App Store Compliance (Account Deletion)
- Account deletion added to Settings screen per Apple Guideline 5.1.1(v)
- `Alert.alert` confirmation dialog before deletion proceeds
- 30-day grace period server-side — account is soft-deleted and can be recovered within window
- Full compliance checklist now met: privacy policy, terms of service, encryption disclosure (ITSAppUsesNonExemptEncryption: false), permission usage descriptions, account deletion

---

## Questions for Reviewer

1. **Google Places enrichment frequency:** The auto-enrichment triggers on every business detail view when hours data is stale (>24 hours). Is this the right staleness threshold? We could cache longer (48h or 72h) to reduce API costs further, but hours data changes frequently for restaurants. What would you recommend?

2. **Notification channel map duplication:** The mapping of notification types to Android channel IDs exists in both client (`lib/notifications.ts`) and server (`server/push.ts`). The audit flagged this as low severity. Should we extract to `shared/notification-channels.ts`, or is the duplication acceptable given the two files serve different purposes (client registration vs. server push)?

3. **Account deletion grace period communication:** The 30-day grace period exists server-side, but the UI only mentions it briefly in the Alert.alert confirmation. Should the user see a more prominent explanation of the grace period — perhaps a dedicated screen showing what happens during those 30 days and how to recover?

4. **Deep link validation — silent rejection:** `isValidDeepLinkScreen()` returns early (no-op) for unknown screen names. This is intentional to prevent crashes, but it means we have no visibility into malformed deep links. Should we add analytics tracking for rejected deep links to catch integration issues or potential abuse patterns?

5. **Full-bleed negative margin pattern:** The -16 negative margin for chip rows hardcodes the parent padding value. Should this be a shared constant or derived from the parent container style?

---

## Context

- App Store submission target: Sprint 685
- Apple Developer Program enrollment: BLOCKED (CEO action required)
- All App Store compliance items now met except the actual enrollment and build submission
- Google Places enrichment adds real value to business pages — hours, descriptions, and price levels were previously empty for most businesses
- Android notification channels enable per-category notification settings for users
