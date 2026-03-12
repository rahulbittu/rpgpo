# Sprint 121 — Sentry Evaluation, Admin Dashboard, i18n Integration

**Date**: 2026-03-08
**Story Points**: 18
**Test Count**: 1015+ across 54 files

---

## Mission

Sprint 121 delivers three P0/P1 priorities from SLT-BACKLOG-120: error monitoring vendor
evaluation (Sentry approved), admin dashboard UI foundation, and i18n React integration
hooks. Additionally, the server startup banner is enhanced with route count logging.

---

## Team Discussion

**Marcus Chen (CTO)**: "The Sentry evaluation is thorough and the decision is clear. Their
free tier gives us 5K errors/month which is more than sufficient through launch. The
@sentry/react-native SDK has first-class Expo support, and @sentry/node integrates cleanly
with our Express stack. We'll start SDK integration in Sprint 122. The key privacy
requirement — no PII in error reports — is well-addressed by Sentry's beforeSend hook."

**Nadia Kaur (Cybersecurity)**: "I co-authored the Sentry evaluation from the security
perspective. The critical requirement is that no user PII flows to Sentry. We'll strip
emails, names, and session tokens from breadcrumbs using the beforeSend hook. Sentry's
EU-US Data Privacy Framework certification aligns with our GDPR compliance posture.
Bugsnag was a close second on privacy, but Sentry's open-source nature gives us an
escape hatch if we ever need to self-host."

**Leo Hernandez (Frontend)**: "The Admin Dashboard page is the first admin-facing UI in
TopRanker. I kept it deliberately simple — stat cards for key metrics (Total Events,
Active Users, Signup Rate, Rating Rate), a Recent Activity feed, and a Refresh button.
All interactive elements have accessibilityRole and accessibilityLabel. The design uses
our standard brand system: BRAND.colors.amber for accent, Colors for surfaces, TYPOGRAPHY
for text sizing."

**Sarah Nakamura (Lead Eng)**: "We're at 1015+ tests across 54 files now. The Sprint 121
test file validates all four workstreams using our established fs.readFileSync pattern.
The startup banner enhancement is small but valuable — knowing how many routes are
registered at boot helps with debugging missing endpoints in production."

**Priya Sharma (Frontend)**: "The i18n React integration bridges our core i18n module with
React components. useTranslation() returns the translate function, current locale, and a
setter — standard React hook pattern. TranslatedText is a convenience component that
renders translated text with optional styling. Both are thin wrappers that keep the core
module framework-agnostic."

**Jordan Blake (Compliance)**: "The Sentry evaluation explicitly addresses GDPR compliance.
No PII in error reports is non-negotiable. The anonymized member ID approach for user
context is the right pattern. I'll review the actual SDK integration in Sprint 122 to
ensure the beforeSend implementation matches these requirements."

**Rachel Wei (CFO)**: "Sentry's free tier through launch saves us approximately $312/year
compared to Bugsnag's Team plan. Even when we scale to the paid tier at $26/month, that's
significantly cheaper than Datadog's per-host pricing model. The admin dashboard will
eventually surface revenue metrics directly — no more manual spreadsheet updates."

**Amir Patel (Architecture)**: "The i18n-react module follows our established pattern of
thin wrappers around core modules. The i18n core (lib/i18n.ts) stays framework-agnostic,
and the React integration (lib/i18n-react.ts) adds hooks and components. Same pattern
we use for error reporting, analytics, and bookmarks. The startup banner reads from
Express's internal router stack — fragile but sufficient for dev-time diagnostics."

---

## Changes

### 1. Sentry Evaluation Document (`docs/evaluations/SENTRY-EVAL.md`)
- Compared Sentry vs Bugsnag vs Datadog across 5 weighted criteria
- Decision: APPROVED — Sentry (free tier: 5K errors/month)
- SDKs: @sentry/react-native (client), @sentry/node (server)
- Privacy: No PII in error reports, beforeSend hook, data scrubbing
- Integration timeline: Sprint 122 (SDK), Sprint 123 (dashboard), Sprint 124 (perf)

### 2. Admin Dashboard Page (`app/admin/dashboard.tsx`)
- Analytics Dashboard header with navy background
- 4 stat cards: Total Events, Active Users, Signup Rate, Rating Rate
- Recent Activity feed with 5 placeholder entries
- Refresh button with accessibilityRole="button" and accessibilityLabel
- Styled with Colors, BRAND.colors.amber, TYPOGRAPHY

### 3. i18n React Integration (`lib/i18n-react.ts`)
- `useTranslation()` hook — returns { t, locale, setLocale }
- `TranslatedText` component — renders translated text from tKey prop
- Thin wrapper around lib/i18n.ts core module
- Framework-agnostic core preserved

### 4. Server Startup Banner (`server/index.ts`)
- After route registration, logs: `[TopRanker] ${routeCount} routes registered`
- Reads route count from Express internal router stack
- Aids production debugging of missing endpoints

### 5. Tests (`tests/sprint121-sentry-dashboard.test.ts`)
- 40+ tests across 6 describe blocks
- Validates Sentry eval doc content (vendors, decision, SDKs, privacy)
- Validates admin dashboard (imports, stat cards, accessibility, Refresh)
- Validates i18n-react (exports, imports, props)
- Validates startup banner (routes registered log)
- Validates sprint doc and retro doc existence and content

---

## PRD Gap Impact

| Gap | Status | Notes |
|---|---|---|
| Error monitoring | IN PROGRESS | Sentry approved, SDK Sprint 122 |
| Admin dashboard | IN PROGRESS | Foundation shipped, data integration Sprint 122 |
| i18n component integration | IN PROGRESS | Hooks ready, component migration Sprint 122 |
