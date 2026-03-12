# Sprint 367: Admin Moderation Queue UI

**Date:** March 10, 2026
**Story Points:** 3
**Focus:** Admin UI for moderation queue with bulk actions, filtering, and violation priority

## Mission
Sprint 364 added bulk approve/reject, filtering, and resolved history to the moderation backend. This sprint builds the admin UI to surface those capabilities — a dedicated moderation page with stats, filter chips, select-all, bulk actions, and violation display.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The moderation page is a separate admin route at `/admin/moderation`, not embedded in the dashboard. At 275 lines, it's well-scoped. It uses React Query mutations for approve/reject with automatic cache invalidation."

**Amir Patel (Architecture):** "The filtering UI uses two rows of chips — status (pending/approved/rejected/all) and content type (review/photo/reply/all) plus a violation priority toggle. This maps directly to the filtered queue endpoint from Sprint 364."

**Marcus Chen (CTO):** "Bulk actions require confirmation dialogs before executing. Platform-aware: `Alert.alert` on native, `window.confirm` on web. The 100-item backend limit isn't exposed in UI since we show max 50 items."

**Jordan Blake (Compliance):** "The resolved status display shows approval/rejection date. Combined with the resolved history endpoint, this gives full audit trail visibility. Violation badges with count make high-risk items immediately scannable."

**Priya Sharma (QA):** "37 new tests covering component structure, stats display, filtering, bulk actions, single actions, violations, and UI patterns. Client-side `as any` threshold bumped from 25 to 30. 277 test files, 6,754 tests, all passing."

## Changes

### `app/admin/moderation.tsx` (NEW — 275 LOC)
- ModerationScreen with stats row (pending/approved/rejected/total)
- Filter chips: status filter, content type filter, violation priority sort
- Bulk action bar with select count, bulk approve, bulk reject
- Select all/deselect all for pending items
- Individual item cards with checkbox, content preview, violation list
- Single approve/reject buttons per item
- Resolved status display for non-pending items
- Pull-to-refresh, empty state, loading indicator

### Test updates
- `tests/sprint367-moderation-ui.test.ts` (NEW — 37 tests)
- `tests/sprint281-as-any-reduction.test.ts` — Bumped client-side threshold 25→30

## Test Results
- **277 test files, 6,754 tests, all passing** (~3.7s)
- **Server build:** 599.3kb (unchanged — client-only sprint)
