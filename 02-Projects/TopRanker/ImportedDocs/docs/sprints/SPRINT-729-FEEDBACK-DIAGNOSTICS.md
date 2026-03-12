# Sprint 729 — Feedback Diagnostics + Console Hygiene

**Date:** 2026-03-11
**Theme:** Beta Readiness Polish
**Story Points:** 2

---

## Mission Alignment

Sprint 728 completed the API timing pipeline. But when a beta user submits a feedback report, none of that diagnostic data was included. This sprint wires perf summary, API errors, and breadcrumb trail into every feedback submission — making bug reports immediately actionable. Also guards all console.log statements behind `__DEV__` to prevent log noise in production builds.

---

## Team Discussion

**Derek Liu (Mobile):** "When a user reports 'the app was slow,' we now know exactly: average API latency, max latency, API call count, startup time, and the last 5 API errors. No more guessing."

**Sarah Nakamura (Lead Eng):** "The breadcrumb trail in feedback is the killer feature. If someone reports a crash, we see the last 15 actions they took — which screens, which API calls, which errors — all timestamped."

**Amir Patel (Architecture):** "Console hygiene matters for App Store. Apple's reviewers sometimes flag excessive logging. `__DEV__` guards are standard React Native practice — they tree-shake out of production bundles."

**Leo Hernandez (Frontend):** "The feedback form now sends 3 diagnostic layers: device context (from Sprint 719/721), perf summary (from Sprint 718/728), and breadcrumb trail (from Sprint 717/727). A single feedback report replaces 30 minutes of back-and-forth debugging."

**Marcus Chen (CTO):** "This is the last observability gap. We can now diagnose issues from: error reports (Sentry breadcrumbs), feedback reports (diagnostics payload), and perf monitoring (API timing). Three independent signals, all wired."

---

## Changes

| File | Change |
|------|--------|
| `app/feedback.tsx` | Added perf summary, API errors, and breadcrumbs to feedback submission payload |
| `lib/sentry.ts` | Guarded all console.log/error statements with `__DEV__` |
| `app/_layout.tsx` | Guarded push token console.log with `__DEV__` |
| `vitest.config.ts` | Added `define: { __DEV__: true }` for test environment compatibility |
| `__tests__/sprint729-feedback-diagnostics.test.ts` | 17 tests: diagnostics wiring (7), console hygiene (6), exports (4) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,575 pass / 540 files |

---

## What's Next (Sprint 730)

Governance sprint: SLT-730, Arch Audit #185, Critique 726-729.
