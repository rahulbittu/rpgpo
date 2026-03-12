# Sprint 762 — Startup Order Fix + Callable Logger

**Date:** 2026-03-12
**Theme:** Fix 502 Bad Gateway by reordering server startup; fix "log2 is not a function" crash
**Story Points:** 3 (P0 — production blocker)

---

## Mission Alignment

- **Ship quality (Constitution #1):** Railway was returning 502 Bad Gateway because server.listen() was blocked behind heavy DB operations. Additionally, the logger was an object (not callable), causing `log2 is not a function` at runtime.

---

## Root Cause — 502 Bad Gateway

The server startup sequence ran background DB tasks (dish leaderboard recalculation, hash preloading, seed data, Google Places import) **synchronously before** calling `server.listen()`. If any DB operation was slow or failed, the server never started listening → Railway health check at `/_health` timed out → 502.

**The fix:** Moved `server.listen()` to execute immediately after route registration and error handler setup. All background tasks now run AFTER the server is already accepting connections.

## Root Cause — "log2 is not a function"

Sprint 761 changed `import { log as logger }` to `import { log }`, enabling bare `log()` calls. But `log` was exported as a plain object (`{ tag, debug, info, warn, error }`), NOT a callable function. esbuild renamed it to `log2` in the bundle. Calling `log2("message")` threw `TypeError: log2 is not a function`.

**The fix:** Changed the logger export from a plain object to a callable function (`baseLog`) with methods attached via property assignment. `log("msg")` now works as a function call, and `log.info()` / `log.error()` etc. still work.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Two separate bugs stacking on each other — Sprint 761 fixed `log is not defined` but exposed `log is not a function` because the logger was never designed to be called directly. The startup order issue was lurking since we added dish leaderboard recalculation in Sprint 397."

**Amir Patel (Architecture):** "The callable function pattern — a function with methods attached — is idiomatic JavaScript. It's how libraries like `debug` and `pino` work. This is the right pattern for our logger."

**Marcus Chen (CTO):** "Two P0 fixes in one sprint. After this push, Railway should boot: the server listens immediately, and all log calls resolve correctly."

**Nadia Kaur (Cybersecurity):** "The startup reorder also improves resilience — if a background task crashes, the server is already healthy and serving requests. The error handler catches the unhandled rejection without taking down the process."

**Jordan Blake (Compliance):** "Audit trail is intact — the logger still produces structured output with timestamps and tags. The callable wrapper just adds convenience without changing output format."

---

## Changes

| File | Change |
|------|--------|
| `server/index.ts` | Moved `server.listen()` before all background DB tasks (seed, Google Places, challengers, dishes, hashes, schedulers) |
| `server/logger.ts` | Changed `log` from plain object to callable function (`baseLog`) with attached methods |

---

## Tests

- **New:** 10 tests in `__tests__/sprint762-startup-order-fix.test.ts`
- **Total:** 13,137 tests across 569 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.1kb / 750kb (88.7%) |
| Tests | 13,137 / 569 files |
| Railway status | Should boot after this deploy |
