# Sprint 647: Search URL Sync

**Date:** 2026-03-11
**Points:** 3
**Focus:** Sync search filter state to browser URL for back/forward navigation and bookmarkable searches

## Mission

Search filters were read from URL on mount (Sprint 451) but never written back. This meant browser back/forward didn't work, and users couldn't bookmark a filtered search view. Add bidirectional URL sync on web: filter changes update the URL via `history.replaceState`.

## Team Discussion

**Amir Patel (Architecture):** "We use `replaceState` rather than `pushState` to avoid polluting the browser history with every keystroke. The URL silently updates — no navigation events, no unnecessary back-stack entries."

**Sarah Nakamura (Lead Eng):** "The sync useEffect is gated on `Platform.OS === 'web'` and `urlParamsRead.current` — it only fires after the initial URL params are consumed, preventing a loop."

**Marcus Chen (CTO):** "Bookmarkable searches are table stakes for a web app. A user searches 'Best biryani in Irving, vegetarian, open now' — they should be able to bookmark that exact view."

**Jasmine Taylor (Marketing):** "This also makes search links from Sprint 644's share button actually work as deep links. The URL params now round-trip: share → open link → see exact same results."

## Changes

### `app/(tabs)/search.tsx`
- Added `router` import from expo-router (unused for setParams, using `history.replaceState` directly for zero-flicker)
- Added URL sync useEffect: encodes `currentFilters + debouncedQuery` to URL query string
- Uses `window.history.replaceState` (web-only, no-op on native)
- Gated on `urlParamsRead.current` to prevent init loop

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 637.9kb
- **search.tsx:** 596 LOC (ceiling 610) — approaching ceiling
