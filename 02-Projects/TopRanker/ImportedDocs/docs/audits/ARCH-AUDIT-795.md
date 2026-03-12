# Architectural Audit #795

**Date:** 2026-03-12
**Auditor:** Amir Patel (Architecture)
**Scope:** Full codebase audit — Sprints 791-794

---

## Executive Summary

**Grade: A** (7+ consecutive A-range audits)

Sprints 791-794 completed the hardening roadmap from SLT-790. Permission audit, email template centralization, CI lint guards, and explicit session cleanup are all shipped. Zero new findings. One medium finding carried forward from Audit #790.

---

## Findings

### CRITICAL — 0 issues

### HIGH — 0 issues

### MEDIUM — 1 issue (carried forward)

| # | Finding | File | Status |
|---|---------|------|--------|
| M1 | In-memory push token store has no size limit | server/push-notifications.ts | Carried from #790 → Sprint 796 |

**Detail:** The `tokens` Map allows unbounded growth per member. The `messageLog` array already has a `MAX_MESSAGES = 5000` cap, but token registration has no per-member limit. A malicious client could register thousands of tokens for a single member ID.

**Recommendation:** Add `MAX_TOKENS_PER_MEMBER = 10` constant. In `registerPushToken()`, evict the oldest token when the limit is exceeded.

### LOW — 2 issues (carried forward)

| # | Finding | File | Status |
|---|---------|------|--------|
| L1 | Email FROM address in process.env fallback | server/email.ts | Backlog |
| L2 | seed.ts references Unsplash URLs | server/seed.ts | Backlog (dev-only) |

---

## Sprint-by-Sprint Review

### Sprint 791 — Permission Audit
- Audited all 6 Android permissions: location, camera, storage, vibrate, boot-completed — all justified by active code paths
- Audited 3 iOS usage descriptions — all match Info.plist entries
- Audited 4 iOS privacy manifest API declarations
- 19 tests guard against permission drift
- **Verdict:** Clean. No unused permissions remain.

### Sprint 792 — Email Template Refactor
- 29+ hardcoded `https://topranker.io` URLs replaced with `${config.siteUrl}` across 4 files
- email.ts, email-owner-outreach.ts, email-drip.ts, email-weekly.ts all centralized
- CI lint test (Sprint 793) now guards against regression
- **Verdict:** Single source of truth established. Domain changes are now config-only.

### Sprint 793 — CI Lint Checks
- 10 lint tests: 5 for hardcoded domain detection, 5 for unguarded console detection
- Found and fixed 7 unguarded console statements in lib/analytics.ts and lib/notifications.ts
- Exclusion for security-headers.ts (CORS origins are intentionally hardcoded)
- **Verdict:** Regression prevention in place. Future PRs auto-caught.

### Sprint 794 — Session Cleanup
- Explicit `pruneSessionInterval: 15 * 60` added to PgStore config
- Completes session management trilogy: fixation (787) → logout destroy (788) → expired cleanup (794)
- 9 tests document full session cookie configuration
- **Verdict:** Session lifecycle is fully managed and explicitly configured.

---

## Security Posture Summary

| Category | Score | Change |
|----------|-------|--------|
| Fetch Timeouts | 10/10 | Stable |
| Session Management | 10/10 | +cleanup (794) |
| Input Validation | 9/10 | Stable |
| Error Handling | 9/10 | Stable |
| Authentication | 10/10 | Stable |
| Authorization | 9/10 | Stable |
| CORS/Headers | 10/10 | Stable |
| Permissions | 10/10 | +audit (791) |
| Email Security | 10/10 | +centralization (792) |
| CI/Lint Guards | 10/10 | NEW (793) |

**Overall Security Score: 98/100** (up from 97/100)

---

## Metrics

| Metric | Value | Change since #790 |
|--------|-------|--------------------|
| Tests | 13,387 | +40 |
| Test files | 597 | +3 |
| Build size | 666.9kb | +0.1kb |
| Build limit | 750kb | 83.1kb headroom |
| Schema LOC | 905/960 | Stable |
| Tracked files | 34 | Stable |

---

## Grade History

... → A → A → A → A → A → A → **A** (7+ consecutive)

---

## Next Audit: Sprint 800
