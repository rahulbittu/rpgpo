# Sprint 278: Rating Submission Validation Hardening

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Strengthen input validation on rating submission schema and remove legacy casts

## Mission
Security hardening pass on the rating submission pipeline. Enforce integer scores, require visitType, sanitize notes (HTML stripping, length cap), and remove the `as any` cast for visitType in submitRating.

## Team Discussion

**Nadia Kaur (Cybersecurity):** "Four changes. First, scores must be integers — the 1-5 picker doesn't generate floats, but the API should reject them. Second, visitType is now required in the schema, not optional. Third, notes are stripped of HTML tags and capped at 2000 chars. Fourth, the `(data as any).visitType` cast in submitRating is gone because visitType is now typed properly."

**Sarah Nakamura (Lead Eng):** "The HTML stripping uses a simple regex `/<[^>]*>/g` in a Zod transform. This handles basic XSS vectors. For production, we should consider a proper sanitization library, but for V1 this catches the obvious cases. The note was previously capped at 160 chars — we bumped it to 2000 to allow more thoughtful reviews while still preventing abuse."

**Marcus Chen (CTO):** "Making visitType required is a breaking change for any client not sending it. But since Sprint 261, the UI always sends visitType. Old clients would get a 400 error with a clear message. This is acceptable for V1."

**Amir Patel (Architecture):** "The `as any` cast removal is a type safety win. One fewer `as any` in the codebase (71 → 70 technically, though it was in a different pattern). Every cast we remove is a potential bug we prevent."

## Changes

### Schema — Input Validation
- **`shared/schema.ts`**:
  - `q1Score`, `q2Score`, `q3Score`: Added `.int()` — rejects float values
  - `visitType`: Changed from `.optional()` to required `z.enum(["dine_in", "delivery", "takeaway"])`
  - `note`: Added `.max(2000)` cap with `.transform()` that strips HTML tags
  - Removed duplicate `note` field (old 160-char limit)

### Server — Rating Submission
- **`server/storage/ratings.ts`**:
  - Replaced `(data as any).visitType || "dine_in"` with `data.visitType as VisitType`
  - No fallback needed since visitType is now required by schema

### Tests
- **19 new tests** in `tests/sprint278-validation-hardening.test.ts`
- Schema tests: valid payload, float rejection (q1/q2/q3), range enforcement, visitType required, invalid visitType, HTML stripping, note length, timeOnPageMs validation
- Server tests: visitType usage, account age check, duplicate daily check, ban check

## Test Results
- **199 test files, 5,486 tests, all passing** (~2.8s)
- +19 new tests from Sprint 278
- 0 regressions
