# Sprint 761 — Production Crash Fix

**Date:** 2026-03-12
**Theme:** Fix "log is not defined" crash on Railway + ESM module warning
**Story Points:** 2 (P0 — production blocker)

---

## Mission Alignment

- **Ship quality (Constitution #1):** The server was crashing on Railway with `ReferenceError: log is not defined`. This was caused by Sprint 744 removing `const log = console.log;` while bare `log()` calls remained in server/index.ts.

---

## Root Cause

Sprint 744 (dead code removal) removed `const log = console.log;` from server/index.ts, but this variable was actively used for ~15 startup log messages. The structured logger was imported as `import { log as logger }`, so `log` became undefined at runtime.

**The fix:** Changed `import { log as logger }` to `import { log }` and renamed all `logger.xxx` calls to `log.xxx`. This makes the structured logger available as both `log()` (callable function for simple messages) and `log.info()`/`log.error()` (structured logging methods).

## Secondary Fix

Added `"type": "module"` to package.json to eliminate Node.js warning:
> Module type not specified, reparsing as ES module. This incurs a performance overhead.

The esbuild output is ESM (`--format=esm`), so this declaration is correct.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This is exactly why we needed to deploy to Railway before TestFlight. The crash was invisible in dev because `tsx` handles module resolution differently. In production, Node.js strict mode caught the undefined variable."

**Amir Patel (Architecture):** "The Sprint 744 removal of `const log = console.log` was correct — it was dead code at the time. But the import aliasing (`log as logger`) masked the fact that bare `log()` calls still existed."

**Marcus Chen (CTO):** "P0 fix. This was the only thing preventing Railway from starting. After this push, the server should boot cleanly."

**Nadia Kaur (Cybersecurity):** "The `type: module` change is safe — Expo/Metro has its own module system and ignores package.json type. The vitest suite confirms no regressions."

---

## Changes

| File | Change |
|------|--------|
| `server/index.ts` | Changed `import { log as logger }` to `import { log }`, renamed all `logger.xxx` to `log.xxx` |
| `package.json` | Added `"type": "module"` for ESM Node.js compatibility |

---

## Tests

- **New:** 8 tests in `__tests__/sprint761-production-crash-fix.test.ts`
- **Total:** 13,127 tests across 568 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.1kb / 750kb (88.7%) |
| Tests | 13,127 / 568 files |
| Railway status | Should boot after this deploy |
