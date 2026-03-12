# Sprint 688 — Native Offline Detection via NetInfo

**Date:** 2026-03-11
**Theme:** Real-Time Connectivity Monitoring for iOS/Android
**Story Points:** 2

---

## Mission Alignment

NetworkBanner existed but only detected offline state on web via `navigator.onLine`. Native users on iOS and Android had no offline feedback — the banner never appeared even with airplane mode on. This sprint adds `@react-native-community/netinfo` for real-time connectivity monitoring on native platforms, completing the cross-platform network resilience story started in Sprint 687.

---

## Team Discussion

**Marcus Chen (CTO):** "TestFlight testers on DART rail will lose connectivity constantly. Before this sprint, they'd just see failed loads with no explanation. Now the banner appears instantly when they go offline and shows 'Back online' when they reconnect. That's the difference between 'this app is broken' and 'I just lost signal.'"

**Sarah Nakamura (Lead Eng):** "Clean integration — NetInfo.addEventListener gives us a state object with `isConnected` and `isInternetReachable`. We check both because `isConnected` means you have a network interface (e.g., WiFi connected) but `isInternetReachable` confirms actual internet access. A hotel WiFi captive portal would show connected but not reachable."

**Dev Sharma (Mobile):** "The unsubscribe pattern is important — NetInfo returns a cleanup function from addEventListener, same pattern React uses. No memory leaks on unmount. The web path still uses the browser API which is more reliable than NetInfo on web."

**Amir Patel (Architecture):** "The banner is already in the layout from a previous sprint — this was purely about native detection plumbing. The 'back online' transition with the 3-second green banner is a nice touch for confirming connectivity resumed."

---

## Changes

| File | Change |
|------|--------|
| `components/NetworkBanner.tsx` | Added NetInfo import + native addEventListener branch |
| `components/NetworkBanner.tsx` | Checks `isConnected` and `isInternetReachable` for accurate state |
| `package.json` | Added `@react-native-community/netinfo` dependency |

### Cross-Platform Detection Matrix

| Platform | Detection Method | Mechanism |
|----------|-----------------|-----------|
| Web | `navigator.onLine` + events | Browser API, reliable, no CORS |
| iOS | NetInfo `addEventListener` | System network status callbacks |
| Android | NetInfo `addEventListener` | ConnectivityManager broadcasts |

### Banner State Machine

| State | Banner Color | Message | Duration |
|-------|-------------|---------|----------|
| Online | Hidden | — | — |
| Offline | Navy | "No internet connection" | Persistent until online |
| Back online | Green | "Back online" | 3 seconds then hide |
| Demo mode | Gray | "Demo mode — backend not connected" | Persistent, dismissible |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 11,917 pass / 507 files |

---

## What's Next (Sprint 689)

Graceful error handling in tab screens — wire ErrorState component into Rankings, Discover, and Profile query error boundaries.
