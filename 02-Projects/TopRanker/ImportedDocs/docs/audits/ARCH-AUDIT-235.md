# Architectural Audit #29

**Date:** 2026-03-09
**Auditors:** Marcus Chen (CTO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng), Nadia Kaur (Cybersecurity)
**Scope:** Full codebase — Sprints 231-234 changes + cumulative health

---

## Executive Summary

The codebase maintains excellent health. Grade **A** (up from A- at Audit #28, Sprint 230). Zero Critical and zero High findings. Four Low-severity items carried forward, all acceptable at current scale with documented migration paths.

Q3 additions (city engagement dashboard, DB outreach history, email ID mapping, admin experiment UI, city promotion auto-gate, Memphis/Nashville expansion, expansion pipeline module) were built with consistent patterns: small modules, tagged loggers, comprehensive tests, no DB coupling in test suites.

**Overall Grade: A**
**Findings: 0 Critical, 0 High, 0 Medium, 4 Low**

---

## Scorecard

| Category | Grade | Notes |
|----------|-------|-------|
| Architecture | A | 40+ server modules, all <100 LOC. Expansion pipeline is clean abstraction. Module boundaries well-defined. |
| Testing | A+ | 4,394 tests across 164 files, <2.5s execution. 284 new tests in Q3. Static analysis pattern avoids DB deps. |
| Security | A | HMAC unsubscribe tokens, webhook signature verification, password validation fix, CAN-SPAM compliance. |
| Performance | A- | <2.5s test execution. In-memory stores provide fast reads. No CDN configured (headers ready). |
| Documentation | A | Sprint docs, retros, SLT meetings, audit trail all current. Expansion pipeline has inline docs. |

**Cumulative Grade: A**

---

## Grade Trajectory

| Audit | Sprint | Grade | Notes |
|-------|--------|-------|-------|
| #24 | 215 | A- | Post-email infrastructure |
| #25 | 220 | A | Email pipeline maturity |
| #26 | 225 | A | 5th consecutive A-range |
| #27 | 225 | A | SLT cycle audit |
| #28 | 230 | A | Mid-year review |
| **#29** | **235** | **A** | **Q3 review — current** |

---

## Findings

### CRITICAL (fix immediately)

None.

### HIGH (P1 — fix within 2 sprints)

None.

### MEDIUM (P2 — fix within 4 sprints)

None.

### LOW (P3 — backlog)

#### L1: 108+ `as any` Casts (Stable)
**Location:** Various app/ files
**Impact:** Known React Native limitation for percentage widths in StyleSheet. Count stable across last 5 audits.
**Status:** Accepted. Documented in MEMORY.md. No action required.

#### L2: No Automated DB Backup Cron
**Location:** `scripts/` directory
**Impact:** Backup scripts exist (`scripts/db-backup.sh`) but are not scheduled via cron or CI. Manual execution only.
**Action:** Schedule via Railway cron or GitHub Actions workflow when Railway migration completes.
**Status:** Carried forward from Audit #28. Blocked on Railway migration.

#### L3: No CDN Configured
**Location:** Server static asset serving
**Impact:** Cache-Control and ETag headers are set correctly, but no CDN layer exists. Direct server serving for all assets.
**Action:** Configure CDN (Cloudflare or CloudFront) post-Railway migration.
**Status:** Carried forward from Audit #28. Blocked on deployment infrastructure.

#### L4: In-Memory Stores for Email Tracking / A/B Testing / Outreach Scheduling
**Location:** `server/email-tracking.ts`, `server/email-ab-testing.ts`, `server/outreach-scheduler.ts`
**Impact:** Data resets on server restart. Outreach history was migrated to DB in Sprint 231 (resolved). Three remaining stores are acceptable at current scale (<1K daily emails, <10 active experiments).
**Action:** Migrate to Redis or PostgreSQL when scale triggers: >50 cities, >10K daily emails, or >50 concurrent experiments.
**Status:** Partially resolved (outreach history migrated). Remaining stores tracked for future migration.

---

## Previous Findings Status

| Finding | Audit Introduced | Current Status |
|---------|-----------------|----------------|
| In-memory outreach history | #27 (Sprint 225) | **RESOLVED** — Migrated to DB in Sprint 231 |
| Email module proliferation | #28 (Sprint 230) | **ACCEPTED** — 7 email files in server/ root. Consolidation to server/email/ is P3. Works fine as-is. |
| No automated DB backup cron | #27 (Sprint 225) | **OPEN (L2)** — Blocked on Railway migration |
| No CDN configured | #27 (Sprint 225) | **OPEN (L3)** — Blocked on deployment infrastructure |
| `as any` casts | #1 (Sprint 95) | **ACCEPTED (L1)** — Known RN limitation, stable count |
| In-memory email tracking/A/B | #28 (Sprint 230) | **OPEN (L4)** — Acceptable at current scale |

---

## Sprint 231-234 Additions Reviewed

| Addition | Quality | Notes |
|----------|---------|-------|
| City engagement metrics | GOOD | Per-city signup/rating counts, clean API |
| DB-backed outreach history | GOOD | Proper Drizzle migration, replaces in-memory store |
| Email ID mapping | GOOD | Maps Resend email_id to internal tracking IDs |
| Admin experiment UI | GOOD | CRUD for A/B experiments, results dashboard |
| City promotion auto-gate | GOOD | Engagement threshold triggers, configurable per city |
| Password validation fix | GOOD | Minimum 8 chars, security gap closed |
| Memphis seed data (10 businesses) | GOOD | Follows established pattern, proper neighborhoods |
| Nashville seed data (10 businesses) | GOOD | Follows established pattern, proper neighborhoods |
| Expansion pipeline module | GOOD | Clean stage management, tagged logger, 40+ tests |

---

## Metrics Comparison (Audit #28 → #29)

| Metric | Audit #28 (Sprint 230) | Audit #29 (Sprint 235) | Delta |
|--------|------------------------|------------------------|-------|
| Total Tests | 4,222 | 4,394 | +172 |
| Test Files | 159 | 164 | +5 |
| Test Execution | <2.4s | <2.5s | +0.1s |
| Server Modules | 36+ | 40+ | +4 |
| Cities | 7 (5 active, 2 beta) | 9 (5 active, 2 beta, 2 planned) | +2 |
| DB Tables | Stable | Stable (+outreach_history) | +1 |
| CRITICAL findings | 0 | 0 | 0 |
| HIGH findings | 0 | 0 | 0 |
| MEDIUM findings | 2 | 0 | -2 |
| LOW findings | 4 | 4 | 0 |

---

## Recommendations for Next Quarter (Sprints 236-240)

1. **Rate limit dashboard** — Admin visibility into rate limiting is critical as city count grows. Abuse detection alerts should trigger on anomalous patterns.
2. **Business claim verification** — The claim workflow is the next revenue-critical feature. Multi-step verification with document upload needs careful security review.
3. **Redis migration planning** — Begin scoping Redis for email tracking and A/B testing stores. Target Sprint 241+ unless scale triggers hit earlier.
4. **CDN configuration** — Post-Railway migration, configure CDN for static assets. Cache-Control headers are already set.
5. **Reputation scoring v2** — The credibility algorithm needs decay factors and cross-city scoring to prevent gaming at scale.

---

## Next Audit

**Audit #30 — Sprint 240** (SLT Mid-Year Review cycle)
