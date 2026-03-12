# Architectural Audit #135

**Date:** 2026-03-11
**Auditor:** Amir Patel (Architecture)
**Scope:** Full codebase — sprints 676–679 changes + cumulative health

---

## Executive Summary

The codebase remains in excellent shape. Sprints 676–679 resolved audit finding A130-L1 (notification channel duplication), added 66 tests, introduced service flags display, and built personalized rating reminders. No critical or high-severity findings. One medium issue (schema approaching ceiling) and three low items. The 75th consecutive A-grade audit.

**Overall Grade: A**

---

## Previous Audit

Audit #130 (Sprint 675) — Grade A

---

## Automated Checks

| Check | Result | Threshold | Status |
|-------|--------|-----------|--------|
| Server build size | 662.3kb | 750kb max | PASS |
| Test count | 11,763 | — | PASS |
| Test files | 502 | — | PASS |
| Test pass rate | 100% | 100% | PASS |
| Schema LOC | 911 | 950 max | PASS |
| Tracked files | 33 | — | PASS |
| Tracked violations | 0 | 0 | PASS |
| `as any` count | 114 | 130 max | PASS |

---

## Findings

### CRITICAL (fix immediately)

None.

### HIGH (P1 — fix within 2 sprints)

None.

### MEDIUM (P2 — fix within 4 sprints)

#### A135-M1: Schema Approaching Ceiling (911/950 LOC)

**Location:** `shared/schema.ts`
**Impact:** 5 service flag columns added in Sprint 678 brought schema to 911 LOC (95.9% of 950 ceiling). Only 39 LOC remain before ceiling. New feature columns will require either raising the ceiling or extracting to a second schema file.
**Action:** Before adding new columns, evaluate whether archiving old columns or splitting the schema is needed. Consider `shared/schema-analytics.ts` for future analytics/reporting tables.
**Owner:** Amir Patel

#### A135-M2: Placeholder Apple Team ID (carried from A130-M1)

**Location:** `eas.json` (submit config)
**Impact:** Placeholder values still present. Apple Developer enrollment is done but account not yet activated.
**Action:** Update once Apple account activation completes and Team ID is available.
**Owner:** CEO

---

### LOW (P3 — backlog)

#### A135-L1: notification-triggers.ts Growing (306 LOC)

**Location:** `server/notification-triggers.ts`
**Impact:** Sprint 679's personalized reminder added 41 LOC, bringing file from 265 to 306. Ceiling at 320. Two-tier personalization logic could be extracted if more trigger types are added.
**Action:** If file exceeds 320 LOC, extract personalized reminder logic to `server/notification-reminder-personal.ts`.
**Owner:** Sarah Nakamura

#### A135-L2: N+1 Query in Personalized Reminder

**Location:** `server/notification-triggers.ts` (sendRatingReminderPush)
**Impact:** For each inactive user, a separate query fetches the last-rated business. At current user volume this is acceptable, but at 1,000+ eligible users per batch, this becomes a performance concern.
**Action:** Batch the last-rated-business lookup into a single query with window functions when user volume warrants it.
**Owner:** Amir Patel

#### A135-L3: google-places.ts Still at 481 LOC

**Location:** `server/google-places.ts`
**Impact:** File grew by 5 LOC (service flag saves). At 481 LOC, approaching 500 threshold from Audit #130.
**Action:** If file exceeds 500 LOC, split enrichment functions to `server/google-places-enrichment.ts`.
**Owner:** Amir Patel

---

## Findings Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 2 |
| LOW | 3 |

---

## Resolved from Previous Audit

| Finding | Resolution |
|---------|------------|
| A130-L1: Notification Channel Map Duplicated | Sprint 676: extracted to `shared/notification-channels.ts` |

---

## Metrics Comparison (Audit #130 to #135)

| Metric | Audit #130 | Audit #135 | Delta |
|--------|------------|------------|-------|
| Build size | 659.9kb | 662.3kb | +2.4kb |
| Tests | 11,697 | 11,763 | +66 |
| Test files | 501 | 502 | +1 |
| Tracked files | 33 | 33 | 0 |
| Violations | 0 | 0 | 0 |
| `as any` count | ≤130 | 114 | improved |
| CRITICAL findings | 0 | 0 | 0 |
| HIGH findings | 0 | 0 | 0 |

---

## Sprint 676–679 Additions Reviewed

| Addition | Quality | Notes |
|----------|---------|-------|
| shared/notification-channels.ts | GOOD | Clean single-source-of-truth extraction, getChannelId() with fallback |
| 66 new tests (enrichment/deeplink/channels) | GOOD | Contract + runtime testing, edge cases covered |
| Service flags (5 boolean columns + UI) | GOOD | Pill chips with Ionicons, conditional rendering |
| Personalized rating reminder | GOOD | Two-tier logic, business name lookup, deep linking |
| Client notification template (ratingReminder) | GOOD | Matches server-side personalization pattern |

---

## Grade History

| Audit | Sprint | Grade |
|-------|--------|-------|
| #115 | 555 | A |
| #120 | 560 | A |
| #125 | 670 | A |
| #130 | 675 | A |
| #135 | 680 | A |

**Grade trajectory:** ...A -> A -> A -> A -> A -> A -> A -> A (75th consecutive)

---

**Next audit:** Sprint 685 (Audit #140)
