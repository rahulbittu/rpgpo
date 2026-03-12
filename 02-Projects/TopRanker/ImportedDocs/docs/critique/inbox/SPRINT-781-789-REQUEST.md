# Critique Request — Sprints 781-789

**Date:** 2026-03-12
**Requesting team:** TopRanker Engineering
**Sprint range:** 781-789 (Security Hardening Arc)

---

## Summary

9 sprints focused exclusively on security hardening and beta readiness:

| Sprint | Theme |
|--------|-------|
| 781 | __DEV__ guard on demo user fallback |
| 782 | Console log guards (5 statements) |
| 783 | OAuth fetch timeouts (Google) |
| 784 | Complete fetch timeout audit (deploy, email, enrichment) |
| 785 | NaN validation on lat/lng query params |
| 786 | Trust proxy for Railway (rate limiting, secure cookies) |
| 787 | Session fixation prevention (all 4 auth endpoints) |
| 788 | Logout session destroy + cookie clear |
| 789 | Remove unused RECORD_AUDIO Android permission |

---

## Questions for External Review

1. **Session management completeness:** Sprint 787 regenerates on login, Sprint 788 destroys on logout. Is there anything else missing? Should we bind sessions to IP/User-Agent for additional protection?

2. **Trust proxy value:** We set `trust proxy` to `1` (trust one hop). Railway uses a single reverse proxy. Is this the correct value, or should we use the Railway-specific proxy IP range?

3. **NaN validation approach:** Sprint 785 validates at the route level (isNaN check on parseFloat). Should we centralize this into a reusable `sanitizeFloat` utility, or is the one-off check sufficient?

4. **Fetch timeout values:** We use 5s for fire-and-forget (ntfy), 10s for most API calls (Google, Resend, Places), 15s for client-side requests. Are these appropriate?

5. **Permission audit depth:** Sprint 789 removed RECORD_AUDIO. Should we also audit READ_EXTERNAL_STORAGE (deprecated in Android 13+) and RECEIVE_BOOT_COMPLETED?

6. **Error message leakage:** 4xx errors still return business logic messages (e.g., "Already rated", "Account too new"). Are these acceptable for client UI, or should they be encoded as error codes?

---

## Current Metrics

- **13,347 tests** across 594 files
- **Build:** 666.8kb (max 750kb)
- **Security score:** 97/100 per ARCH-AUDIT-790
- **OWASP coverage:** All 10 categories addressed
