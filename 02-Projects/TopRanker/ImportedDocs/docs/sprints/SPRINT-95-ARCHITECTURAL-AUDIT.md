# Sprint 95 — Architectural Audit

**Date**: 2026-03-08
**Theme**: Scheduled Codebase Health Check
**Story Points**: 5

---

## Mission Alignment

Every 5 sprints we stop and audit. Trust in our rankings requires trust in our code. This
audit covers sprints 91-94 (payments infrastructure) plus cumulative health.

---

## Team Discussion

**Marcus Chen (CTO)**: "Overall codebase health is 8.5/10, up from 7.5 at audit #90.
The payment infrastructure was built systematically and cleanly. One critical finding —
API keys in .env under version control. We need to rotate those immediately."

**Nadia Kaur (Cybersecurity)**: "The .env exposure is my top priority. Those Google API keys
need rotation within 24 hours. I also flagged the password minimum — 6 characters is too weak.
We're going to 8 minimum with numeric requirement."

**Sarah Nakamura (Lead Engineer)**: "routes.ts grew 50 lines since the last audit. Badge
endpoints are self-contained — easy extraction target for Sprint 96. We also have 6 server
modules without test files. I'll prioritize push.ts and analytics.ts."

**Jordan Blake (Compliance)**: "The payment cancellation auth ordering is a real concern.
We're mutating state before verifying ownership. That's a compliance issue — unauthorized
state changes, even temporary ones, need to be eliminated."

**Rachel Wei (CFO)**: "357 tests and 3 revenue products fully operational. From a business
standpoint, the payment infrastructure built in sprints 91-94 is audit-ready. The receipt
emails and webhook logging show financial maturity."

---

## Findings Summary

| Severity | Count | Key Issues |
|----------|-------|------------|
| CRITICAL | 1 | API keys in .env under version control |
| HIGH | 5 | routes.ts 715 LOC, weak passwords, cancel auth ordering, search.tsx 845 LOC, 6 untested modules |
| MEDIUM | 5 | Missing index, console-only email, placement cancel, webhook replay, mock data |
| LOW | 4 | as any casts, seed logging, TODO marker, webhook rate limit |

---

## Full Audit

See `/docs/audits/ARCH-AUDIT-95.md` for complete findings, metrics comparison, and
priority queue.

---

## What's Next (Sprint 96)

Priority fixes from audit:
1. Rotate API keys, add .env to .gitignore
2. Fix cancellation auth ordering
3. Extract badge routes from routes.ts
4. Password minimum to 8 characters
5. Add tests for push.ts, analytics.ts
