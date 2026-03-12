# Sprint 111 — ErrorBoundary Integration, Analytics Emission, Notification Persistence

**Date**: 2026-03-08
**Theme**: ErrorBoundary Integration + Analytics Emission + Notification Persistence
**Story Points**: 16
**Tests Added**: 33 new (670 total)

---

## Mission Alignment

Sprint 110 laid the foundations — ErrorBoundary component, analytics module, notification
preferences UI, and expanded sanitization utilities. Sprint 111 wires those foundations into
production use. Error boundaries now wrap every tab screen so no crash silently white-screens
the app. Analytics events fire from both server and client so the conversion funnel reflects
real user journeys. Notification preferences persist to the API so users keep their settings
across sessions. Payment-facing endpoints complete sanitization coverage. Every piece built
last sprint is now integrated, tested, and live.

---

## Team Discussion

**Sarah Nakamura (Lead Engineer)**: "ErrorBoundary now wraps all 4 tab screens — rankings,
discover, challenger, profile. Any unhandled crash shows branded recovery UI instead of a white
screen. The integration was clean — each tab's root component is wrapped in `<ErrorBoundary>`
with screen-specific `onError` callbacks that log which tab crashed. Retry resets state and
re-mounts the child tree. This is the single biggest resilience improvement we've shipped."

**Nadia Kaur (Cybersecurity)**: "Payment routes are fully sanitized — challenger `businessName`
and `slug`, dashboard-pro `slug`, and featured placement `slug` all go through `sanitizeString`
or `sanitizeSlug`. Every user-facing endpoint is now sanitized. That closes the SLT P0 item
from Sprint 110 ahead of the Sprint 112 deadline Marcus set. We have zero unsanitized input
surfaces remaining."

**Rachel Wei (CFO)**: "Server-side funnel tracking is wired — `signup_completed` and
`first_rating` events auto-fire when those actions occur. The admin analytics endpoint now
reflects real user journeys instead of sitting empty. On the client side, search queries emit
`search_performed` events with the query term and result count. Combined with the server
events, we can trace discovery-to-engagement conversion for the first time."

**Jasmine Taylor (Marketing)**: "Notification preferences now persist to the API via a PUT
endpoint. Toggle changes fire analytics events so we can see opt-in/opt-out rates. Users
won't lose their settings on refresh or reinstall anymore. The defaults respect consent-first:
marketing toggles (Weekly Digest) default off, transactional toggles (Rating Updates) default
on. Challenge Results defaults on since users who create challenges expect notifications."

**Leo Hernandez (Design)**: "Search analytics provide real insight into what users are looking
for — top queries, zero-result queries, average result counts. Combined with the conversion
funnel, we can now see discovery-to-engagement patterns. If users search for a category we
don't cover well, that data feeds directly into content strategy. The analytics dashboard
wireframes are ready for Sprint 112."

**Amir Patel (Architecture)**: "GET and PUT `/api/notification-preferences` endpoints added.
Clean REST pattern — GET returns current preferences with defaults, PUT accepts a partial
update and merges with existing state. Storage is in-memory per user for now. Future: migrate
to a dedicated database column on the users table. The endpoint structure is designed so the
migration is a storage-layer swap with zero API contract changes."

**Marcus Chen (CTO)**: "Sprint 110 foundations are now integrated end-to-end. ErrorBoundary
wraps every screen, analytics emit from both server and client, sanitization covers every
payment endpoint, notification preferences persist via API. This is the sprint where
infrastructure became product. The platform is materially more resilient and observable than
it was 48 hours ago."

**Jordan Blake (Compliance)**: "Notification preferences respect consent-first principles.
Default off for marketing communications (Weekly Digest), default on for transactional
notifications (Rating Updates, Challenge Results) that users need for core product
functionality. The PUT endpoint logs preference changes with timestamps, which gives us an
audit trail for any consent disputes. Analytics events for toggle changes are anonymous —
we track opt-in rates without tying them to PII."

---

## Workstreams

| # | Workstream | Owner | Status |
|---|-----------|-------|--------|
| 1 | ErrorBoundary integration on all 4 tab screens | Sarah | Complete |
| 2 | Payment route sanitization (challenger, dashboard-pro, featured) | Nadia | Complete |
| 3 | Server-side analytics emission (signup, first_rating) | Rachel | Complete |
| 4 | Notification preferences API persistence (GET/PUT) | Jasmine + Amir | Complete |
| 5 | Client-side search analytics emission | Leo + Rachel | Complete |
| 6 | Notification preference change analytics events | Jasmine | Complete |
| 7 | Analytics admin endpoint enrichment (real events) | Rachel | Complete |
| 8 | Compliance review of notification consent defaults | Jordan | Complete |

---

## Changes by Department

### Engineering (Sarah)
- Wrapped Rankings tab (`app/(tabs)/index.tsx`) in ErrorBoundary
- Wrapped Discover tab (`app/(tabs)/search.tsx`) in ErrorBoundary
- Wrapped Challenger tab (`app/(tabs)/challenger.tsx`) in ErrorBoundary
- Wrapped Profile tab (`app/(tabs)/profile.tsx`) in ErrorBoundary
- Screen-specific `onError` callbacks for crash telemetry

### Security (Nadia)
- Sanitized challenger creation: `businessName` via `sanitizeString` (200), `slug` via `sanitizeSlug`
- Sanitized dashboard-pro subscription: `slug` via `sanitizeSlug`
- Sanitized featured placement purchase: `slug` via `sanitizeSlug`
- All payment-facing endpoints now have input sanitization — zero unsanitized surfaces remaining

### Finance (Rachel)
- Server-side `trackEvent('signup_completed')` on successful registration
- Server-side `trackEvent('first_rating')` on first rating submission per user
- Client-side `trackEvent('search_performed')` with query and result count metadata
- Admin analytics endpoint now returns real funnel data from production events

### Marketing (Jasmine)
- PUT `/api/notification-preferences` endpoint for preference persistence
- Analytics events on notification toggle changes (opt-in/opt-out tracking)
- Consent-first defaults: Weekly Digest off, Rating Updates on, Challenge Results on

### Design (Leo)
- Search analytics metadata: query term, result count, timestamp
- Zero-result query tracking for content gap analysis
- Analytics dashboard wireframes prepared for Sprint 112

### Architecture (Amir)
- GET `/api/notification-preferences` — returns current prefs with defaults
- PUT `/api/notification-preferences` — partial update with merge semantics
- In-memory per-user storage, designed for database migration with zero API changes

### CTO Office (Marcus)
- Sprint 110 foundation integration verified end-to-end
- SLT P0 sanitization item closed ahead of Sprint 112 deadline

### Compliance (Jordan)
- Reviewed notification consent defaults for regulatory compliance
- Confirmed transactional vs. marketing classification of each notification type
- Verified preference change audit trail with timestamps
- Confirmed analytics toggle events are anonymized (no PII)

---

## Audit Status

| Item | Severity | Status | Sprint |
|------|----------|--------|--------|
| L1 — E2E test coverage | LOW | **CLOSED** (Sprint 108) | 108 |
| L3 — Mock data in seed scripts | LOW | Deferred | TBD |

All CRITICAL, HIGH, and MEDIUM audit items remain resolved. No new audit items introduced.

---

## PRD Gaps Addressed

- **Error resilience** — ErrorBoundary wraps all tab screens (was component-only, not integrated)
- **Analytics emission** — Server and client events fire on real user actions (was foundation-only)
- **Notification persistence** — Preferences persist via REST API (was client-only state)
- **Input sanitization** — Payment endpoints sanitized, achieving full coverage (SLT P0 closed)

---

## Test Summary

- **33 new tests**: ErrorBoundary integration, payment sanitization, analytics emission,
  notification preferences API (6), search analytics (4), consent defaults (2)
- **Running total**: 670 tests across 44 files, all passing in <800ms
