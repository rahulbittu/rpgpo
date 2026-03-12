# Sprint 110 — Error Boundaries, Analytics Foundations, Cross-Department Maturity

**Date**: 2026-03-08
**Theme**: Error Boundaries + Analytics Foundations + Cross-Department Maturity
**Story Points**: 18
**Tests Added**: 42 new (~637 total)

---

## Mission Alignment

Trustworthy rankings require a platform that never silently breaks. This sprint introduces
React Error Boundaries for graceful crash recovery, broadens input sanitization to four more
endpoint surfaces (signup, claims, dishes, ratings), lays the analytics foundation for
conversion funnel tracking, adds notification preferences UI, establishes the dark mode color
palette, and implements graceful server shutdown. The SLT + Architecture backlog meeting was
held this sprint — all P0 items are on track.

---

## Team Discussion

**Sarah Nakamura (Lead Engineer)**: "ErrorBoundary component is live — a class component
wrapping any subtree with `getDerivedStateFromError` and `componentDidCatch`. It displays a
branded recovery UI with a 'Try Again' button that resets state. Supports custom fallback
via props and an `onError` callback for telemetry hooks. The retry button clears the error
state so the child tree re-mounts cleanly. We're using DM Sans Bold for the title, brand
amber for the retry button, and proper accessibility labels. Every tab screen should wrap
its content in this boundary — we'll roll that out in Sprint 111."

**Nadia Kaur (Cybersecurity)**: "Sanitization coverage expanded significantly. Signup now
sanitizes `displayName` (100 char limit), `username` (50 char limit), and `email` through
`sanitizeEmail`. Business claims sanitize `role` (100 chars) and `phone` (20 chars). Dish
search sanitizes the query parameter (200 chars). Rating submission now clamps the score to
[1, 5] range via `sanitizeNumber`. That's four more endpoint surfaces covered since Sprint
109 — we're on track to have every user-facing endpoint sanitized by Sprint 112 as the SLT
mandated."

**Rachel Wei (CFO)**: "Analytics module is in place — `server/analytics.ts` defines 12
funnel events covering the full user journey from `page_view` through `dashboard_pro_subscribed`
and `featured_purchased`. In-memory buffer with a 1000-entry cap prevents unbounded growth.
`getFunnelStats()` returns counts per event type, `getRecentEvents()` returns the last N
entries for debugging. Admin endpoint at GET /api/admin/analytics exposes both funnel stats
and recent events, auth-gated to admin role. This is the foundation — next sprint we wire
up the client-side event emission."

**Jasmine Taylor (Marketing)**: "Notification preferences are now on the profile page — three
toggle switches for Rating Updates, Challenge Results, and Weekly Digest. Each toggle has a
label and description so users understand exactly what they're opting into. Uses React Native
Switch components with brand amber track color. State is local for now — backend persistence
is the Sprint 111 deliverable. The consent-first approach means all toggles default to off
for new users except rating updates, which business owners need."

**Leo Hernandez (Design)**: "Dark mode color palette is defined in `constants/dark-colors.ts`.
Surfaces use GitHub-style dark tones (#0D1117 background, #161B22 surface, #1C2128 elevated).
Brand amber stays identical across light and dark — `BRAND.colors.amber` is the single
source of truth. Text hierarchy maps to #E6EDF3 primary, #8B949E secondary, #484F58 tertiary.
Medal colors carry over unchanged since metallic tones work on dark backgrounds. Card borders
use #30363D for subtle separation. This is the palette only — theme switching infrastructure
comes in Sprint 113."

**Amir Patel (Architecture)**: "Graceful shutdown handlers are wired up on `SIGTERM` and
`SIGINT`. When either signal fires, the server stops accepting new connections, waits for
in-flight requests to complete, then exits cleanly. A 10-second timeout forces shutdown if
connections hang. This is critical for container orchestration — Kubernetes sends SIGTERM
before killing pods, and without graceful shutdown we'd drop in-flight requests. The logger
outputs both the signal received and the shutdown completion for audit trails."

**Marcus Chen (CTO)**: "SLT + Architecture backlog meeting completed — documented in
`docs/meetings/SLT-BACKLOG-110.md`. Key decisions: keep SSE over WebSocket at current scale,
defer Redis until multi-instance deployment, input sanitization is P0 through Sprint 112,
error boundaries are P0 this sprint. Technical debt is down to one HIGH item (in-memory rate
limiter). Velocity is strong at 8 parallel workstreams per sprint. Next SLT meeting at Sprint
115."

**Jordan Blake (Compliance)**: "The analytics module is consent-compliant by design. The
`trackEvent` function accepts an optional `userId` — anonymous tracking is possible without
PII. The buffer is in-memory only, no persistence to disk, so GDPR data subject requests
don't need to cover analytics storage. When we add persistence in a future sprint, we'll
need to add analytics data to the GDPR deletion pipeline. I've flagged that as a Sprint 112
action item to ensure it ships with the persistence layer, not after."

---

## Workstreams

| # | Workstream | Owner | Status |
|---|-----------|-------|--------|
| 1 | ErrorBoundary component with recovery UI | Sarah | Complete |
| 2 | Broader input sanitization (signup, claims, dishes, ratings) | Nadia | Complete |
| 3 | Analytics / conversion funnel module + admin endpoint | Rachel | Complete |
| 4 | Notification preferences UI on profile page | Jasmine | Complete |
| 5 | Dark mode color palette constants | Leo | Complete |
| 6 | Graceful shutdown (SIGTERM/SIGINT handlers) | Amir | Complete |
| 7 | SLT + Architecture backlog meeting (Sprint 110) | Marcus | Complete |
| 8 | Compliance review of analytics data tracking | Jordan | Complete |

---

## Changes by Department

### Engineering (Sarah)
- New `components/ErrorBoundary.tsx` — React class component with error catching
- `getDerivedStateFromError` + `componentDidCatch` for crash recovery
- Branded fallback UI with retry button, custom fallback prop, onError callback
- Accessibility labels on retry button

### Security (Nadia)
- Sanitized signup fields: `displayName` (100), `username` (50), `email` via `sanitizeEmail`
- Sanitized business claim fields: `role` (100), `phone` (20)
- Sanitized dish search query: `q` parameter (200)
- Clamped rating score to [1, 5] range via `sanitizeNumber`
- Imported `sanitizeEmail` and `sanitizeNumber` into routes.ts

### Finance (Rachel)
- New `server/analytics.ts` — 12 funnel event types, in-memory buffer (1000 cap)
- `trackEvent()`, `getFunnelStats()`, `getRecentEvents()`, `clearAnalytics()` exports
- New admin endpoint: GET /api/admin/analytics (auth + admin gated)
- Returns funnel stats and recent 20 events

### Marketing (Jasmine)
- Notification preferences section on profile page
- Three toggles: Rating Updates, Challenge Results, Weekly Digest
- Switch components with brand amber track color
- Label + description for each preference

### Design (Leo)
- New `constants/dark-colors.ts` — full dark theme palette
- 15 color tokens: surfaces, text hierarchy, brand amber, borders, feedback, medals, cards, tab bar
- Brand amber references `BRAND.colors.amber` for single source of truth

### Architecture (Amir)
- Graceful shutdown function in `server/index.ts`
- SIGTERM and SIGINT signal handlers
- 10-second forced shutdown timeout
- Logger output for signal receipt and shutdown completion

### CTO Office (Marcus)
- SLT + Architecture backlog meeting held and documented
- P0/P1/P2 backlog prioritized through Sprint 114
- Technical debt assessed — 1 HIGH remaining (in-memory rate limiter)

### Compliance (Jordan)
- Reviewed analytics module for GDPR/CCPA compliance
- Confirmed in-memory buffer does not require data subject request coverage
- Flagged persistence layer as future compliance touchpoint

---

## Audit Status

| Item | Severity | Status | Sprint |
|------|----------|--------|--------|
| L1 — E2E test coverage | LOW | **CLOSED** (Sprint 108) | 108 |
| L3 — Mock data in seed scripts | LOW | Deferred | TBD |

All CRITICAL, HIGH, and MEDIUM audit items remain resolved. No new audit items introduced.

---

## PRD Gaps Addressed

- **Error handling** — ErrorBoundary provides graceful crash recovery (was missing)
- **Notification preferences** — UI groundwork for user communication preferences
- **Analytics foundation** — Conversion funnel tracking infrastructure for revenue optimization
- **Dark mode** — Color palette defined, implementation planned for Sprint 113
- **Input sanitization** — 4 additional endpoint surfaces hardened (P0 item from SLT meeting)

---

## Test Summary

- **42 new tests**: ErrorBoundary (5), analytics funnel (6), extended sanitization (15),
  dark mode colors (8), notification preferences (2), graceful shutdown (2), plus integration tests
- **Running total**: ~637 tests across unit, integration, and E2E suites
