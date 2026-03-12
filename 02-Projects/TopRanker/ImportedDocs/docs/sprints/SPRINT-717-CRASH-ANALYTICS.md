# Sprint 717 — Crash Analytics Integration

**Date:** 2026-03-11
**Theme:** Post-Beta Launch Infrastructure (2 of 4)
**Story Points:** 2

---

## Mission Alignment

When beta users encounter crashes, we need to know about them. This sprint wires the existing error reporting and Sentry abstraction into the app's critical paths: global error handler, ErrorBoundary, and notification navigation breadcrumbs.

---

## Team Discussion

**Derek Liu (Mobile):** "Wired a global error handler via ErrorUtils that captures both fatal and non-fatal errors. Every crash gets breadcrumbed, reported, and the original handler is preserved for React Native's default behavior."

**Sarah Nakamura (Lead Eng):** "The breadcrumb system now tracks notification taps with type and target screen. When a crash report comes in, we'll see the user's last 50 actions leading up to it."

**Amir Patel (Architecture):** "The Sentry abstraction buffers breadcrumbs at 50 max. When we plug in real Sentry DSN, all the wiring is already done — just call initSentry() with the config."

**Marcus Chen (CTO):** "This is infrastructure we need before real users. Console logging isn't enough — we need structured error reports with context."

**Nadia Kaur (Cybersecurity):** "Error reports contain error messages and stack traces only — no PII. Breadcrumbs use notification type and screen names, not user data. Clean."

**Priya Sharma (Design):** "The ErrorBoundary already called reportComponentCrash since Sprint 110. Good that the global handler now covers errors that happen outside of component rendering."

---

## Changes

| File | Change |
|------|--------|
| `lib/sentry.ts` | Added getRecentBreadcrumbs(), getCurrentUser(), breadcrumb buffer limit (50) |
| `app/_layout.tsx` | Added global error handler via ErrorUtils, notification tap breadcrumbs |
| `__tests__/sprint717-crash-analytics.test.ts` | 22 tests: error buffer, breadcrumbs, ErrorBoundary wiring, global handler |

---

## Error Reporting Pipeline

```
User Action → Breadcrumb (lib/sentry.ts)
                    ↓
Error Occurs → ErrorUtils global handler OR ErrorBoundary componentDidCatch
                    ↓
reportError() / reportComponentCrash() → Error buffer (lib/error-reporting.ts)
                    ↓
Sentry initialized? → captureException() → Sentry dashboard
                    ↓ (if not)
Console fallback → console.error()
```

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,404 pass / 530 files |

---

## What's Next (Sprint 718)

Performance monitoring setup — track app startup time, screen render times, API response latencies.
