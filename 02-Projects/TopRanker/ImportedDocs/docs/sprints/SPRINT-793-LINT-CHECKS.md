# Sprint 793 — CI-Friendly Lint Checks

**Date:** 2026-03-12
**Theme:** Automated regression guards for hardcoded domains and unguarded console
**Story Points:** 2 (DX + hardening)

---

## Mission Alignment

- **Regression prevention:** Automated checks catch new hardcoded URLs and unguarded console before they ship
- **Production quality:** No console spam in production builds, no hardcoded URLs that drift from config

---

## Problem

Previous sprints fixed individual instances (Sprint 773: domain alignment, Sprint 782: console guards, Sprint 792: email siteUrl), but nothing prevented regressions. A new developer could add `console.log` in lib/ or hardcode `topranker.io` in a new email template and the CI would pass.

## Fix

1. **Hardcoded URL lint:** Scans all `server/**/*.ts` files for `https://topranker.io` that aren't email addresses or config/CORS declarations. Catches any new hardcoded URL that should use `config.siteUrl`.

2. **Console guard lint:** Scans all `lib/**/*.{ts,tsx}` and `app/**/*.{ts,tsx}` files for `console.log/warn` not preceded by `__DEV__` within 4 lines. Catches unguarded console statements.

3. **Fixed 7 unguarded console statements** found by the lint:
   - `lib/analytics.ts`: 6 console statements in dev provider + error handlers → guarded
   - `lib/notifications.ts`: 2 console statements → guarded

---

## Team Discussion

**Amir Patel (Architecture):** "These lint tests run in the existing vitest suite — no new CI infrastructure needed. They scan the actual source files, not ASTs, which keeps them fast and simple."

**Sarah Nakamura (Lead Eng):** "The lint found 7 unguarded console statements we missed in Sprint 782. The automated check is more thorough than manual review."

**Derek Okonkwo (Mobile):** "The analytics console provider logs were intentionally for development, but they still needed __DEV__ guards to avoid noise in production builds."

**Nadia Kaur (Cybersecurity):** "The hardcoded URL check prevents accidentally bypassing config.siteUrl. Any future email template that hardcodes a URL will fail the test."

---

## Changes

| File | Change |
|------|--------|
| `__tests__/sprint793-lint-checks.test.ts` | 10 lint tests (URL + console guards) |
| `lib/analytics.ts` | Guard 6 console statements with __DEV__ |
| `lib/notifications.ts` | Guard 2 console statements with __DEV__ |

---

## Tests

- **New:** 10 tests in `__tests__/sprint793-lint-checks.test.ts`
- **Total:** 13,378 tests across 596 files — all passing
- **Build:** 666.8kb (max 750kb)
