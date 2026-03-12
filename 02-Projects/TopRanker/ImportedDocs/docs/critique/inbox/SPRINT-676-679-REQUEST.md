# Critique Request — Sprints 676–679

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Scope:** 4 sprints of architecture cleanup, testing, UI features, and engagement infrastructure

---

## Context

Sprints 676–679 focused on four domains: resolving an audit finding (notification channel duplication), adding comprehensive test coverage for Sprint 671–675 features, displaying Google Places service flags on business pages, and building personalized rating reminder push notifications.

---

## Changes for Review

### Sprint 676: Shared Notification Channel Extraction
- Created `shared/notification-channels.ts` — single source of truth for Android channels
- Both `lib/notifications.ts` (client) and `server/push.ts` (server) now import from shared
- Resolves Audit #130 finding A130-L1

### Sprint 677: Enrichment + Deep Link + Channel Tests
- 66 new tests across 12 test suites
- Contract validation for Google Places enrichment functions
- Runtime behavior tests for `isValidDeepLinkScreen` (edge cases: null, undefined, numbers, case)
- Integration tests verifying client and server both import from shared channels

### Sprint 678: Service Flags Display
- 5 boolean columns added to businesses schema (serves_breakfast/lunch/dinner/beer/wine)
- Enrichment saves flags from Google Places API
- Business detail page shows pill-shaped chips with Ionicons
- Conditional rendering — only shows when at least one flag is true

### Sprint 679: Personalized Rating Reminder
- Two-tier push notification personalization:
  - Tier 1 (2–14 days inactive): "How was [Business Name]?" with deep link to business
  - Tier 2 (7+ days, no recent ratings): Generic "Your neighborhood misses you"
- Looks up last-rated business for personalization
- Added client-side `ratingReminder` template

---

## Specific Questions for the Critic

1. **Shared module pattern** — Is importing from `shared/` the right approach for client-server shared constants? Any risks with path resolution across Expo + esbuild?

2. **Service flag schema** — We added 5 boolean columns. Would a single JSONB `serviceFlags` column be better for future extensibility (e.g., servesHalal, servesVegan)?

3. **N+1 in personalized reminder** — Each eligible user triggers a separate query for their last-rated business. Is this acceptable for a daily batch job, or should we batch from the start?

4. **Schema at 911/950 LOC** — Are we approaching a point where the schema file should be split? What's the right boundary?

5. **Test coverage approach** — Most new tests are contract-based (reading file contents). Should we invest in more runtime integration tests?

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb |
| Tests | 11,763 / 502 files |
| Schema | 911 / 950 LOC |
| Audit grade | A (75th consecutive) |
| Velocity | 3.5 pts/sprint |
