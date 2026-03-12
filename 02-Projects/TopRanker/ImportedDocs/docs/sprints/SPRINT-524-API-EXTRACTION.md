# Sprint 524: api.ts Domain Extraction

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 24 new (9,715 total across 413 files)

## Mission

Extract admin-specific types and functions from `lib/api.ts` (766 LOC) into `lib/api-admin.ts` to resolve the Audit #62 watch file. Maintain backward compatibility via re-exports.

## Team Discussion

**Amir Patel (Architecture):** "766→625 LOC, a 141-line reduction. The admin module at 200 LOC is self-contained with its own apiFetch/apiRequest helpers to avoid circular imports. Re-exports in api.ts ensure zero breaking changes for consumers."

**Marcus Chen (CTO):** "This resolves the api.ts watch file from Audit #62. The extraction pattern is clean: move types + functions, add re-exports, redirect tests. Same pattern we used for ClaimsTabContent in Sprint 516."

**Sarah Nakamura (Lead Eng):** "Three test files needed redirect: sprint509 (claim evidence), sprint517 (digest copy), sprint519 (templates). Each test's describe block now reads api-admin.ts instead of api.ts. All assertions pass against the new file."

**Rachel Wei (CFO):** "No feature changes — pure refactoring. But it unblocks future admin function additions without growing the main api.ts file."

## Changes

### New Files

| File | LOC | Purpose |
|------|-----|---------|
| `lib/api-admin.ts` | 200 | Admin types + functions: claims, flags, members, evidence, digest, templates |
| `__tests__/sprint524-api-extraction.test.ts` | 108 | 24 tests covering extraction and re-exports |

### Modified Files

| File | Before | After | Delta | Change |
|------|--------|-------|-------|--------|
| `lib/api.ts` | 766 | 625 | -141 | Replaced inline admin code with re-exports |
| `__tests__/sprint509-claim-v2-dashboard.test.ts` | — | — | 0 | Redirect to api-admin.ts |
| `__tests__/sprint517-digest-copy-test.test.ts` | — | — | 0 | Redirect to api-admin.ts |
| `__tests__/sprint519-notification-template-editor.test.ts` | — | — | 0 | Redirect to api-admin.ts |

### Extracted to api-admin.ts

- 7 interfaces: AdminClaim, AdminFlag, ClaimDocumentMetadata, ClaimEvidence, DigestCopyTestStatus, NotificationTemplate, AdminMember
- 15 functions: fetchPendingClaims, fetchClaimEvidence, fetchAllClaimEvidence, reviewAdminClaim, fetchPendingFlags, reviewAdminFlag, fetchAdminMembers, fetchDigestCopyTestStatus, seedDigestCopyTest, stopDigestCopyTest, fetchNotificationTemplates, fetchTemplateVariables, createNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate

## Test Summary

- `__tests__/sprint524-api-extraction.test.ts` — 24 tests
  - api-admin.ts: 17 tests (7 interfaces, 8 functions, helpers, LOC)
  - api.ts: 7 tests (re-export from api-admin, LOC < 650, retained non-admin exports)
