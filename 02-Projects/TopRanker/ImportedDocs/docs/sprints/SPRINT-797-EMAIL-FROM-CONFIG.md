# Sprint 797 — Email FROM Address to config.ts

**Date:** 2026-03-12
**Theme:** Centralize email FROM address into config.ts (Audit L1 fix)
**Story Points:** 1 (consistency)

---

## Mission Alignment

- **Single source of truth:** All environment-dependent values should flow through config.ts
- **Observability:** config.ts documents every configurable parameter in one place

---

## Problem

`server/email.ts` had `const FROM_ADDRESS = process.env.EMAIL_FROM || "TopRanker <noreply@topranker.com>"` — a direct process.env access with a hardcoded fallback. This violated the config.ts centralization pattern established across the codebase.

## Fix

1. Added `emailFrom` to `config.ts` using `optional("EMAIL_FROM", "TopRanker <noreply@topranker.com>")`
2. Changed `email.ts` to use `config.emailFrom` instead of direct env var access
3. Verified no other server files reference EMAIL_FROM or noreply@topranker.com directly

---

## Team Discussion

**Amir Patel (Architecture):** "This closes L1 from Audit #790 and #795. Now every environment-dependent string in the server flows through config.ts. No more scattered process.env access."

**Sarah Nakamura (Lead Eng):** "config.ts now has 16 fields. It's still a clean, flat module — no nesting, no classes, just a const object. Easy to audit."

**Rachel Wei (CFO):** "If we ever change the from address (e.g., for a rebrand), it's now a single-point config change. Before, you'd have to grep for the hardcoded string."

**Jordan Blake (Compliance):** "Email sender identity matters for CAN-SPAM compliance. Having it in a centralized config means it's auditable. Good hygiene."

---

## Changes

| File | Change |
|------|--------|
| `server/config.ts` | Added `emailFrom` field |
| `server/email.ts` | Changed FROM_ADDRESS to use `config.emailFrom` |
| `__tests__/sprint797-email-from-config.test.ts` | 11 tests |

---

## Tests

- **New:** 11 tests in `__tests__/sprint797-email-from-config.test.ts`
- **Total:** 13,409 tests across 599 files — all passing
- **Build:** 667.2kb (max 750kb)
