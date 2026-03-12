# Sprint 718 — Performance Monitoring Setup

**Date:** 2026-03-11
**Theme:** Post-Beta Launch Infrastructure (3 of 4)
**Story Points:** 2

---

## Mission Alignment

When beta users report "the app feels slow," we need data, not guesses. This sprint adds a lightweight performance tracker that measures app startup time, API response latencies, and screen mount times — all stored in-memory for dev builds and ready to pipe to a real monitoring service.

---

## Team Discussion

**Amir Patel (Architecture):** "The perf tracker is deliberately minimal — no external dependencies, no network calls. It buffers measurements in memory and exposes getPerfSummary() for any consumer. When we integrate a real APM tool, we just pipe the data there."

**Derek Liu (Mobile):** "markAppStart() fires at module evaluation time (before splash), markAppReady() fires when the splash animation completes. The difference is our actual startup time perceived by users."

**Sarah Nakamura (Lead Eng):** "The named marks pattern (startMark → stop function) is composable. Any screen or hook can measure its own operation without depending on the tracker's internals."

**Marcus Chen (CTO):** "Good that this integrates with the existing performance budget module. BUDGETS defines thresholds, perf-tracker measures actuals, getBudgetReport() compares them."

**Priya Sharma (Design):** "Can we show a dev-only performance overlay eventually? Seeing API response times in real-time would help during manual testing."

**Nadia Kaur (Cybersecurity):** "Performance data is non-sensitive — metric names and durations only. No PII captured."

---

## Changes

| File | Change |
|------|--------|
| `lib/perf-tracker.ts` | New — markAppStart, markAppReady, recordApiCall, recordScreenMount, startMark, getPerfSummary |
| `app/_layout.tsx` | Wired markAppStart at module level, markAppReady on splash finish |
| `__tests__/sprint718-performance-monitoring.test.ts` | 19 tests: API tracking, screen mounts, startup, marks, budget integration |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,423 pass / 531 files |

---

## What's Next (Sprint 719)

User feedback collection mechanism — in-app feedback form for beta users to report issues.
