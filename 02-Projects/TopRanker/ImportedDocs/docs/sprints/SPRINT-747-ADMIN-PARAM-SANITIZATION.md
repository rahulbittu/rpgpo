# Sprint 747 — Admin Route Parameter Sanitization

**Date:** 2026-03-12
**Theme:** Defense-in-depth input sanitization for all admin write endpoints
**Story Points:** 2

---

## Mission Alignment

- **Security (6 Anti-Gaming Layers):** Admin routes control city promotion, claim verification, templates — all sensitive operations that must be sanitized at the boundary
- **Defense-in-depth:** Even though Drizzle ORM uses parameterized queries, we sanitize inputs before they reach storage functions

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "We now have sanitizeString on every admin write endpoint. Template names are validated against an alphanumeric pattern to prevent directory traversal. Push template fields are length-capped. City params are sanitized."

**Marcus Chen (CTO):** "This is the kind of work that prevents incidents. Admin routes have elevated privileges — they can promote cities, reject claims, create templates. Every one of these inputs must be validated."

**Amir Patel (Architecture):** "The pattern is consistent across all admin routes: import sanitizeString, apply it to every string input, validate booleans with `=== true`, validate numbers with `Number()`. This makes code review trivial."

**Sarah Nakamura (Lead Eng):** "Combined with Sprint 746, we've now sanitized every user-facing and admin-facing write endpoint. The entire server boundary layer is validated."

**Jordan Blake (Compliance):** "Input sanitization at every boundary is a regulatory requirement for handling user data. We're now compliant across all endpoints."

---

## Changes

| File | Fields Sanitized |
|------|-----------------|
| `server/routes-admin-templates.ts` | Template name param (alphanumeric validation) |
| `server/routes-admin-push-templates.ts` | id, name, category, title, body (create), name/category/title/body/active (update) |
| `server/routes-admin-promotion.ts` | City param in status + promote routes |
| `server/routes-admin-claims-verification.ts` | Document fileName, fileType, fileSize, documentType |

### Test Fix

| File | Fix |
|------|-----|
| `__tests__/sprint496-claim-v2-wiring.test.ts` | Updated assertions for sanitizeString pattern |

---

## Tests

- **New:** 18 tests in `__tests__/sprint747-admin-param-sanitization.test.ts`
- **Updated:** 1 test in sprint496
- **Total:** 12,898 tests across 554 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.3kb / 750kb (88.6%) |
| Tests | 12,898 / 554 files |
| Admin routes without input sanitization | 0 |
