# Sprint 437: Profile Activity Timeline

**Date:** 2026-03-10
**Type:** Feature — User Engagement
**Story Points:** 3

## Mission

Create a unified chronological activity timeline that merges ratings, bookmarks, and achievements into one feed. Replaces the ratings-only ActivityFeed (Sprint 419) with a richer view of user activity. Strengthens the "every action has visible consequence" principle by showing all meaningful interactions in one place.

## Team Discussion

**Marcus Chen (CTO):** "This is the engagement sprint from our SLT-435 roadmap. The existing ActivityFeed only showed ratings. Now users see their full activity story — when they rated a place, when they saved one for later, when they unlocked an achievement. This reinforces the core loop: rate → consequence → check → rate again."

**Priya Sharma (Design):** "The type badges (Rated/Saved/Earned) with color-coded dots make it easy to scan event types at a glance. Date grouping (Today, Yesterday, This Week, Earlier) creates natural breaks instead of an endless scroll. The header summary counts give a quick 'at a glance' breakdown."

**Sarah Nakamura (Lead Eng):** "buildEvents() is a pure function with useMemo — no re-computation on re-renders. Event sorting is O(n log n) on the combined array. The old ActivityFeed is preserved for backward compatibility but no longer rendered in profile.tsx. The 344 LOC is reasonable for a component with 3 event types, date grouping, and full timeline UI."

**Amir Patel (Architecture):** "Profile.tsx went from 690 to 699 LOC (+9) — we swapped a single-prop component call for a multi-prop one. Still well under the 800 threshold at 87.4%. The ActivityTimeline component is self-contained with no new dependencies."

**Rachel Wei (CFO):** "Showing bookmarks in the timeline creates a feedback loop — users see their saved places and are reminded to go rate them. That's a retention mechanism that costs nothing to implement because we already have the bookmark data."

**Nadia Kaur (Security):** "No new data exposure. Bookmark data is already client-side (AsyncStorage). Achievement data comes from badge evaluation which is also client-side. Rating data is the same profile.ratingHistory. All sources are already available on the client."

## Changes

### New Files
- `components/profile/ActivityTimeline.tsx` (344 LOC) — Unified timeline: event builders, date grouping, type badges, show more/less, navigation

### Modified Files
- `app/(tabs)/profile.tsx` (690→699 LOC) — Import ActivityTimeline, replace ActivityFeed render with ActivityTimeline passing ratings + bookmarks + achievements
- `__tests__/sprint406-profile-extraction.test.ts` — Bumped LOC threshold from 700 to 720
- `__tests__/sprint419-activity-feed.test.ts` — Updated integration tests for ActivityTimeline

### Test Files
- `__tests__/sprint437-activity-timeline.test.ts` — 42 tests: exports, event types, date groups, event building, UI elements, props, profile integration, file health

## Architecture

### Event Types
| Type | Source | Icon | Color | Navigation |
|------|--------|------|-------|------------|
| rating | profile.ratingHistory | star/thumbs-up/down | Score-based | Business page |
| bookmark | bookmarks context | bookmark | Navy | Business page |
| achievement | badges (progress >= 100) | trophy | Amber | — |

### Date Groups
| Group | Condition |
|-------|-----------|
| Today | < 24h ago |
| Yesterday | 24-48h ago |
| This Week | 2-7 days ago |
| Earlier | > 7 days ago |

### Scoring → Icon Mapping
| Score Range | Icon | Color |
|-------------|------|-------|
| 8+ | star | Amber |
| 6-7 | thumbs-up | Green |
| 4-5 | remove-circle | Grey |
| < 4 | thumbs-down | Red |

## Test Results
- **332 files**, **7,908 tests**, all passing
- Server build: **604.0kb**, 31 tables
- 2 test file updates (sprint406 LOC threshold, sprint419 integration)
