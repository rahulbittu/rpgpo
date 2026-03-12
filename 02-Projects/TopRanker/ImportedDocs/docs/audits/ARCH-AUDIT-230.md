# Architecture Audit #28 — Sprint 230

Date: 2026-03-09
Auditor: Amir Patel (Architecture)
Previous: Audit #27 (Sprint 225, Grade: A)

## Executive Summary
Grade: A (5th consecutive A-range)
- 0 Critical
- 0 High
- 2 Medium
- 2 Low

## Findings

### MEDIUM: Email module directory needed
- Now 7 email-related files in server/: email.ts, email-drip.ts, email-owner-outreach.ts, email-weekly.ts, email-tracking.ts, email-ab-testing.ts, unsubscribe-tokens.ts
- Recommend consolidating under server/email/ directory
- Not blocking — each module is well-scoped

### MEDIUM: In-memory stores growing
- alerting.ts (200), email-tracking.ts (1000), email-ab-testing.ts (50 experiments + assignments map), outreach-history.ts (unbounded Map)
- outreach-history has no size limit — add eviction
- Action: Add MAX_HISTORY_ENTRIES to outreach-history.ts

### LOW: Scheduler count at 4
- weekly digest, daily drip, hourly challenger, weekly outreach
- All follow same pattern, but no unified scheduler framework
- Acceptable — each has different cadence and logic

### LOW: Google Place enrichment not automated
- server/google-place-enrichment.ts exists but requires manual CLI run
- Should be triggered automatically for beta city businesses
- P3 for future sprint

## Metrics

| Metric | Audit #27 | Audit #28 | Delta |
|--------|-----------|-----------|-------|
| Test files | 155 | 159 | +4 |
| Tests | 4,110 | 4,222 | +112 |
| Server modules | 32 | 36 | +4 |
| Active cities | 5+1 beta | 5+2 beta | +1 beta |
| Email modules | 5 | 7 | +2 |
| Schedulers | 3 | 4 | +1 |
| as any casts | ~50 | ~50 | 0 |

## Module Health

New modules (Sprints 226-229):
- unsubscribe-tokens.ts: 43 LOC
- email-ab-testing.ts: 98 LOC
- routes-webhooks.ts: 72 LOC
- outreach-history.ts: 71 LOC
- google-place-enrichment.ts: ~90 LOC
- outreach-scheduler.ts: ~120 LOC

## Grade History
| Audit | Sprint | Grade |
|-------|--------|-------|
| #24 | 210 | A |
| #25 | 215 | A |
| #26 | 220 | A |
| #27 | 225 | A |
| #28 | 230 | A |

## Recommendations
1. Create server/email/ directory to consolidate 7 email modules
2. Add MAX_HISTORY_ENTRIES to outreach-history.ts
3. Automate Google Place enrichment for beta cities
4. Consider unified scheduler registration pattern
5. Next audit: Sprint 235
