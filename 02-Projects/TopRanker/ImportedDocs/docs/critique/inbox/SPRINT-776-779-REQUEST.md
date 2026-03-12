# Critique Request — Sprints 776-779

**Date:** 2026-03-12
**Requesting:** External review of hardening sprint quality

---

## What We Did

Four hardening sprints for TestFlight beta readiness:

1. **Sprint 776:** Added 15-second `AbortController` timeout to all `fetch()` calls in `query-client.ts`. Prevents indefinite hangs on slow/dead connections.

2. **Sprint 777:** Wired React Query's `onlineManager` to `NetInfo.addEventListener()` for native and `window.addEventListener("online"/"offline")` for web. Queries now pause when offline instead of firing and failing.

3. **Sprint 778:** Added `tabBarAccessibilityLabel` to all 4 tab bar items and accessibility roles to the challenger screen header.

4. **Sprint 779:** Production error sanitization — `wrapAsync` and global Express error handler now return generic "Internal Server Error" for 5xx errors in production. 4xx errors still show their original message.

## Questions for Reviewer

1. Is 15 seconds the right timeout? Some endpoints (photo proxy, Google Places) might need longer. Should we have per-route timeouts?
2. Is the `onlineManager` wiring sufficient or should we also use `focusManager` for React Query?
3. The accessibility pass was minimal (tab bar + challenger). What's the minimum bar for App Store approval?
4. For error sanitization: should we also sanitize 4xx messages? Some 422 validation errors might contain field names that leak schema info.
