# Architecture Audit #27 — Sprint 225

Date: 2026-03-09
Auditor: Amir Patel (Architecture)
Previous: Audit #26 (Sprint 220, Grade: A)

## Executive Summary
Grade: A (4th consecutive A-range)
- 0 Critical
- 0 High
- 2 Medium
- 1 Low

## Findings

### MEDIUM: Email module proliferation
- email.ts, email-drip.ts, email-owner-outreach.ts, email-weekly.ts, email-tracking.ts — 5 email-related modules
- Consider consolidating under an `email/` directory in a future sprint
- Not urgent: each module is <120 LOC with clear single responsibility

### MEDIUM: In-memory stores accumulating
- alerting.ts (200 max), email-tracking.ts (1000 max), analytics buffer (30s flush)
- Combined worst-case: ~1300 objects in memory
- Acceptable for current scale, but should add memory budget monitoring
- Action: Add heap snapshot to perf-monitor stats

### LOW: Unsubscribe token uses raw member ID
- Currently sends member UUID in unsubscribe links
- Should migrate to HMAC-signed tokens to prevent enumeration
- Planned for Sprint 226 per SLT-225

## Metrics

| Metric | Audit #26 | Audit #27 | Delta |
|--------|-----------|-----------|-------|
| Test files | 152 | 154 | +2 |
| Tests | 4,033 | 4,088 | +55 |
| Server modules | 28 | 32 | +4 |
| Active cities | 5 | 5+1 beta | +1 beta |
| Email templates | 7 | 10 | +3 |
| Schedulers | 2 | 3 | +1 |
| `as any` casts | ~50 | ~50 | 0 |
| Largest file | routes-admin.ts (536) | routes-admin.ts (536) | 0 |

## Module Health

All new modules under 100 LOC:
- drip-scheduler.ts: 95 LOC
- routes-unsubscribe.ts: 88 LOC
- email-owner-outreach.ts: 238 LOC (largest new module — HTML templates)
- email-tracking.ts: 95 LOC

## Grade History
| Audit | Sprint | Grade |
|-------|--------|-------|
| #24 | 210 | A |
| #25 | 215 | A |
| #26 | 220 | A |
| #27 | 225 | A |

## Recommendations
1. Create `server/email/` directory to group email modules (email.ts, email-drip.ts, email-owner-outreach.ts, email-weekly.ts, email-tracking.ts)
2. Add memory budget monitoring to perf-monitor (track in-memory store sizes)
3. Implement signed unsubscribe tokens before OKC goes from beta to active
4. Next audit: Sprint 230
