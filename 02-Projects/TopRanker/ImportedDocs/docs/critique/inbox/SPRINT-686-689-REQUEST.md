# Critique Request: Sprints 686–689

**Date:** 2026-03-11
**Requested by:** Sarah Nakamura (Lead Eng)
**Sprint range:** 686–689 (Network Resilience Arc + Haptic Polish)

---

## Summary

Four sprints covering haptic consistency and the complete network resilience story:

1. **Sprint 686 (Haptic Polish):** Added `Haptics.selectionAsync()` to Profile and Business Detail pull-to-refresh, completing haptic coverage across all 5 surfaces.

2. **Sprint 687 (Smart Retry Logic):** Added `shouldRetry` function to React Query config — skips 4xx client errors, retries network/5xx errors up to 2 times with exponential backoff capped at 5 seconds. Mutations never retry.

3. **Sprint 688 (Native Offline Detection):** Added `@react-native-community/netinfo` for real-time connectivity on iOS/Android. Web continues using `navigator.onLine`. Banner shows offline/online/demo states.

4. **Sprint 689 (Error State Consolidation):** Replaced inline error markup in all 4 tab screens (Rankings, Discover, Profile, Challenger) with shared `ErrorState` component. ~24 lines of JSX removed per screen.

---

## Questions for Critique

1. **shouldRetry regex:** We match `^4\d{2}:` against error messages to detect client errors. This depends on `throwIfResNotOk` formatting errors as `${status}: ${message}`. Is this coupling between error formatting and retry logic too fragile?

2. **NetInfo vs fetch failure detection:** On native, we check both `isConnected` and `isInternetReachable`. Is checking both redundant or is the defense-in-depth justified?

3. **ErrorState in NetworkBanner.tsx:** A general-purpose ErrorState component lives in a file named NetworkBanner.tsx. Should it be extracted to its own file, or is co-location acceptable since all three components (NetworkBanner, ErrorState, EmptyState) are about error/empty UX?

4. **Retry count of 2:** We chose 2 retries (3 total attempts) for queries. Is this too few for mobile networks? Too many for a restaurant ranking app where freshness matters?

5. **Mutations retry: false:** We disabled retry for all mutations. Should we selectively enable retry for idempotent mutations (e.g., bookmark toggle, which is a PUT)?

---

## Files Changed

- `lib/query-client.ts` — shouldRetry, exponential backoff
- `components/NetworkBanner.tsx` — NetInfo integration, ErrorState/EmptyState exports
- `app/(tabs)/index.tsx` — ErrorState usage
- `app/(tabs)/search.tsx` — ErrorState usage
- `app/(tabs)/profile.tsx` — ErrorState + haptic
- `app/(tabs)/challenger.tsx` — ErrorState usage
- `app/business/[id].tsx` — haptic
- `package.json` — @react-native-community/netinfo

---

## Metrics

| Metric | Before (685) | After (689) |
|--------|-------------|-------------|
| Build size | 662.3kb | 662.3kb |
| Tests | 11,866 | 11,934 |
| Test files | 505 | 508 |
