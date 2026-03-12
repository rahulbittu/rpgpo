# Critique Request — Sprints 790-794

**Date:** 2026-03-12
**Scope:** Final hardening arc + governance (Sprints 790-794)
**Requestor:** TopRanker Engineering

---

## Context

Sprints 790-794 completed the SLT-790 hardening roadmap. The codebase is at 95% TestFlight readiness with only CEO operational tasks remaining as blockers. Security score is 98/100 across all OWASP categories.

## Changes for Review

### Sprint 791 — Full Permission Audit
- Audited all Android (6) and iOS (3+4 privacy manifest) permissions against code usage
- Removed nothing — all permissions are actively used
- 19 tests guard against permission drift

### Sprint 792 — Email Template Refactor
- Replaced 29+ hardcoded `https://topranker.io` URLs with `${config.siteUrl}` across 4 email services
- Dynamic import pattern in tests to avoid config.ts env var requirement

### Sprint 793 — CI Lint Checks
- 10 automated lint tests scanning source files for hardcoded domains and unguarded console
- Manual recursive file walker (no fast-glob dependency)
- Exclusion for security-headers.ts CORS origins

### Sprint 794 — Session Cleanup
- Explicit `pruneSessionInterval: 15 * 60` in PgStore config
- Completes session management trilogy (787→788→794)

---

## Questions for External Review

1. **Push token store unbounded growth (M1):** The `tokens` Map in push-notifications.ts has no per-member limit. Our plan is `MAX_TOKENS_PER_MEMBER = 10` with oldest-eviction. Is 10 the right number? Should we also cap total unique members?

2. **Session cleanup interval:** 15-minute prune interval for expired sessions. Is this appropriate for a low-traffic beta, or should it be longer to reduce DB queries?

3. **CI lint approach:** We scan source files as strings in vitest rather than using ESLint rules or a dedicated linter. Is this pragmatic or a maintenance risk? Should we migrate to proper ESLint custom rules?

4. **Dynamic import pattern in tests:** Sprint 792 forced dynamic `import()` inside `beforeAll` to avoid config.ts requiring DATABASE_URL at module load. Is this a code smell that should be addressed (e.g., lazy config loading)?

5. **Hardening diminishing returns:** We've run 19 consecutive hardening sprints (776-794). Security score went from ~85/100 to 98/100. SLT recommends shifting to reactive/user-feedback mode. Is there anything we're obviously missing before first real users touch the app?

6. **Email FROM address:** Still using `process.env.EMAIL_FROM || "TopRanker <noreply@topranker.com>"` fallback. Should this be moved to config.ts required field, or is the fallback pattern acceptable for email service configuration?

---

## Metrics

- **Tests:** 13,387 across 597 files (all passing)
- **Build:** 666.9kb (max 750kb)
- **Security Score:** 98/100
- **Audit Grade:** A (7+ consecutive)
