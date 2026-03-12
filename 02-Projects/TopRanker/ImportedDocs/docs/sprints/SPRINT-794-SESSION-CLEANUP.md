# Sprint 794 — Explicit Session Cleanup Configuration

**Date:** 2026-03-12
**Theme:** Make session pruning interval explicit and documented
**Story Points:** 1 (infrastructure)

---

## Mission Alignment

- **Database hygiene:** Expired sessions accumulate in PostgreSQL without active pruning
- **Observability:** Explicit configuration is better than relying on library defaults

---

## Problem

`connect-pg-simple` defaults to pruning expired sessions every 15 minutes, but this wasn't explicitly configured. The default could change in a library update, or a future developer might not realize session cleanup was happening automatically.

## Fix

Added explicit `pruneSessionInterval: 15 * 60` (seconds) to the PgStore configuration. This:
- Documents that session cleanup runs every 15 minutes
- Protects against library default changes
- Makes the cleanup interval visible in code review

---

## Team Discussion

**Amir Patel (Architecture):** "Explicit is better than implicit. The default 15-minute interval is correct — frequent enough to prevent table bloat, infrequent enough to not impact performance."

**Sarah Nakamura (Lead Eng):** "With Sprint 788's logout session destroy, most sessions get cleaned up immediately. The prune interval catches abandoned sessions from users who close the app without logging out."

**Rachel Wei (CFO):** "Railway PostgreSQL has storage limits. Stale sessions accumulating for 30 days could waste meaningful disk space at scale."

**Derek Okonkwo (Mobile):** "The 9-test suite also documents the full session cookie configuration — httpOnly, sameSite, secure, maxAge. Good reference."

---

## Changes

| File | Change |
|------|--------|
| `server/auth.ts` | Added explicit `pruneSessionInterval: 15 * 60` |
| `__tests__/sprint794-session-cleanup.test.ts` | 9 tests |

---

## Tests

- **New:** 9 tests in `__tests__/sprint794-session-cleanup.test.ts`
- **Total:** 13,387 tests across 597 files — all passing
- **Build:** 666.9kb (max 750kb)
