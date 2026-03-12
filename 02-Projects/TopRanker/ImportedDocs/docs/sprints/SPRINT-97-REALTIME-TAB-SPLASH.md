# Sprint 97 — Near Real-Time System, Tab Bar Glow, Splash Overhaul, Website Fix

**Date**: 2026-03-08
**Theme**: Real-Time Updates + UI Polish
**Story Points**: 13
**Tests Added**: 21 (392 total)

---

## Mission Alignment

Users expect rankings and challenger data to feel alive — not stale cached snapshots.
This sprint introduces Server-Sent Events (SSE) for near-real-time cache invalidation,
overhauls the splash animation to Yelp-quality standards, fixes the tab bar glow effect,
and resolves the greyed-out website button bug.

---

## Team Discussion

**Amir Patel (Architecture)**: "SSE over WebSockets was the right call. It's unidirectional,
works over standard HTTP, no extra dependencies, and the keep-alive pings prevent proxy
timeouts. The EventSource fallback to 15s polling on native is pragmatic — we can add
WebSocket support later if needed."

**Priya Sharma (Frontend)**: "The tab bar golden glow is a massive improvement. The old
misaligned dot was embarrassing. Now we have spring-animated scale with amber shadow glow
that matches our brand system. The splash overhaul is 8 phases of cinematic animation —
crown drop with haptic, logo scale-in with letter spacing, decorative line, tagline reveal,
and zoom exit. Yelp-quality."

**Marcus Chen (CTO)**: "The query invalidation map is clean — each SSE event type maps
to specific React Query keys. When someone submits a rating, leaderboard/trending/business
queries all invalidate. staleTime dropped from 60s to 10s, and SSE handles the rest.
The website fix was a seed data gap — 28 of 30 businesses now have website URLs populated."

**Sarah Nakamura (Lead Engineer)**: "21 new tests cover SSE event structure, serialization,
invalidation mapping, client management, HTTP headers, reconnection timing, keep-alive pings,
and fallback polling. That's 392 total — testing mandate continues strong."

**Nadia Kaur (Cybersecurity)**: "SSE endpoint has no auth requirement — it's read-only
event stream. We rate-limit the connection endpoint via the global API limiter. The
keep-alive ping at 30s intervals prevents stale connections from accumulating."

**Leo Hernandez (Design)**: "The splash animation phases are timed perfectly — crown at
150ms with heavy haptic, logo at 400ms with light haptic, line at 800ms, tagline at 1100ms,
exit at 2400ms. The golden aura on the crown is a nice touch. Tab bar glow uses
rgba(196,154,26,0.15) background with 12px shadow radius."

---

## Changes

### Real-Time SSE System
- Created `server/sse.ts` — event bus with client Set, broadcast function, keep-alive pings
- Added `GET /api/events` SSE endpoint in routes.ts with proper headers
- Created `lib/use-realtime.ts` — React hook connecting to SSE, invalidates React Query on events
- Wired `useRealtimeEvents()` into root layout — always active
- Broadcasts on: rating submission (ranking_updated + rating_submitted), featured placement (featured_updated)
- Fallback: 15s polling on native where EventSource is unavailable
- Reconnects after 3s on error, disconnects on app background, reconnects on foreground

### Query Client Optimization
- Default staleTime: 60s → 10s (SSE handles most invalidation)
- Removed default `refetchInterval: false` — SSE makes polling unnecessary
- refetchOnWindowFocus remains true for browser tab switches

### Tab Bar Golden Glow
- Replaced misaligned activeDot with animated amber glow circle
- 40x40 glow with `rgba(196,154,26,0.15)` background + amber shadow
- Spring animations: scale 1→1.18 on select, haptic feedback via `hapticTabSwitch()`

### Splash Animation Overhaul
- 8-phase cinematic sequence with tuned timings
- Crown: spring drop with rotation, golden aura glow pulse
- Logo: scale+opacity fade-in with letter-spacing track-in
- Background: ambient glow pulse, radial ring expand/fade
- Decorative line: width animation with cubic easing
- Tagline: spring translateY reveal
- Exit: cinematic zoom (1.12x scale) with opacity fade

### Website Button Fix
- Added `website` field to all 28 applicable SEED_BUSINESSES entries
- Added `website: (biz as any).website || null` to seedDatabase() insert
- Elote Man (mobile vendor) and street food vendors without websites left as null
- Business detail page `disabled={!business.website}` now works correctly

---

## What's Next (Sprint 98)

Continue audit MEDIUM items (M1-M5), add optimistic updates on mutations for instant
UI feedback, and explore WebSocket upgrade for native real-time support.
