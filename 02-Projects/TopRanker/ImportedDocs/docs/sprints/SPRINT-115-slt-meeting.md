# Sprint 115 — SLT Meeting, Revenue Analytics, Dark Mode Migration Phase 2

**Date**: 2026-03-08
**Story Points**: 15
**Theme**: SLT Meeting + Revenue Analytics + Dark Mode Migration + Error Monitoring Prep
**Sprint Lead**: Sarah Nakamura

---

## SLT Meeting Reference

Full meeting doc: `docs/meetings/SLT-BACKLOG-115.md`

Key decisions from the SLT + Architecture meeting:
1. Dark mode migration is incremental — no big-bang
2. SSE stays; WebSocket deferred to Sprint 120 review
3. Redis remains deferred — RateLimitStore interface ready
4. Error monitoring is P0 — ErrorBoundary needs real telemetry
5. Analytics dashboard is P0 — funnel data needs business visibility
6. Cross-department cadence continues

---

## Team Discussion

**Rachel Wei (CFO)**: "The analytics funnel on the server side is solid, but we're missing
client-side revenue event tracking. This sprint I'm wiring up `view_business` on the
business detail screen and `dashboard_upgrade_tap` on the claim listing button. These
events feed directly into our conversion funnel — when the analytics dashboard ships in
Sprint 116, we'll have real data to show the board."

**Marcus Chen (CTO)**: "The SLT meeting confirmed our architecture is in excellent shape.
720+ tests, single-instance ready, pluggable rate limiter. The remaining work is polish:
dark mode migration, analytics visualization, and error monitoring. We're operating at
Yelp-level engineering maturity now."

**Amir Patel (Architecture)**: "I want to reinforce: the incremental dark mode migration
is the right call. Each sprint's UI changes naturally adopt useThemeColors. Skeleton
components and CookieConsent are good candidates this sprint because they're leaf
components — no cascade risk."

**Leo Hernandez (Design)**: "I'm migrating CookieConsent, Skeleton (LeaderboardSkeleton
and BusinessDetailSkeleton), and the Settings container to use useThemeColors. The
pattern is straightforward — import the hook, call it, and override the container
backgroundColor inline. ErrorBoundary is a class component so it can't use hooks;
we'll address that with a wrapper in a future sprint."

**Sarah Nakamura (Lead Engineer)**: "Error monitoring prep this sprint. The ErrorBoundary
already has an `onError` prop but the default logging was just dumping raw objects.
I'm adding structured logging — error message, truncated stack (5 lines), truncated
component stack. When we integrate Sentry in Sprint 116, the onError callback is
exactly where we'll pipe to `Sentry.captureException`."

**Jordan Blake (Compliance)**: "GDPR deletion background job design is on my plate for
Sprint 117 per the SLT meeting. The CookieConsent theme awareness is a nice touch —
when dark mode is active, the banner should respect the user's preference. Good to
see compliance components getting the same design attention."

**Jasmine Taylor (Marketing)**: "The revenue analytics Rachel is wiring up are critical
for our growth metrics. dashboard_upgrade_tap gives us direct visibility into how many
business owners are interested in claiming. That's our #1 B2B conversion signal."

**Nadia Kaur (Cybersecurity)**: "Structured error logging is a security best practice.
Truncating stacks to 5 lines prevents accidental PII leakage in error reports. When
Sentry goes live, we need to configure scrubbing rules too — I'll work with Sarah
on that for Sprint 116."

---

## Changes

### 1. Client-Side Revenue Analytics (Rachel Wei)
- Added `Analytics` import to `app/business/[id].tsx`
- `Analytics.viewBusiness(slug, category)` fires on business detail load via useEffect
- `Analytics.dashboardUpgradeTap(slug)` fires on claim listing button press
- All events flow through the pluggable analytics provider layer

### 2. Dark Mode Migration — 3 Components (Leo Hernandez)
- `components/CookieConsent.tsx` — Added `useThemeColors` import, theme-aware container background
- `components/Skeleton.tsx` — Added `useThemeColors` to LeaderboardSkeleton and BusinessDetailSkeleton containers
- `app/settings.tsx` — Added `useThemeColors` import, theme-aware container background override

### 3. Error Monitoring Prep (Sarah Nakamura)
- `components/ErrorBoundary.tsx` — Replaced raw console.error with structured logging
- Logs: `error.message`, truncated stack (5 lines), truncated componentStack (5 lines)
- Existing `onError` prop callback unchanged — ready for Sentry integration

### 4. Documentation
- Sprint doc: `docs/sprints/SPRINT-115-slt-meeting.md`
- Retro doc: `docs/retros/RETRO-115-slt-meeting.md`
- SLT meeting doc: `docs/meetings/SLT-BACKLOG-115.md` (pre-existing)

---

## Test Summary

- New test file: `tests/sprint115-revenue-analytics.test.ts`
- Tests cover: Analytics convenience functions, revenue event tracking, ErrorBoundary structured logging
- All existing 720+ tests remain passing

---

## PRD Gap Impact

- Revenue analytics instrumentation: client-side events now tracked
- Dark mode migration: 3 more components migrated (incremental per SLT decision)
- Error monitoring: structured logging foundation for Sentry integration
