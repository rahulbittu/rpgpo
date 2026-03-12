# Sprint 746 — Input Validation Hardening

**Date:** 2026-03-12
**Theme:** Defense-in-depth input validation for write endpoints + dead code removal
**Story Points:** 2

---

## Mission Alignment

- **Rating system integrity (THE product):** Receipt flag and anti-gaming flags are now strictly validated — clients cannot inject arbitrary values into the credibility pipeline
- **6 Anti-Gaming Layers:** Strengthened by ensuring flag booleans are true/false only, not arbitrary truthy values
- **Security:** URL protocol validation prevents javascript: injection in business action links

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "The `isReceipt` flag controls a +25% verification boost. Without strict boolean validation, a malicious client could send `isReceipt: 'yes'` or `isReceipt: 1` and get unearned receipt verification. Now it must be exactly `true`."

**Marcus Chen (CTO):** "The rating flag booleans (q1-q5) feed directly into the anti-gaming pipeline. Arbitrary truthy values could corrupt the signal. `=== true` ensures only intentional boolean flags are processed."

**Sarah Nakamura (Lead Eng):** "The claim rejection reason was the only admin write endpoint without sanitization. Even though it's admin-only, defense-in-depth means we validate at every boundary."

**Amir Patel (Architecture):** "The URL protocol validation closes a real XSS vector. Business owners submit action URLs (menu, order, DoorDash). Without protocol validation, `javascript:alert(1)` could be stored and executed when users click the link."

**Jordan Blake (Compliance):** "The dead `const log = console.log` in server/index.ts was confusing — it shadowed the structured logger import. Removing it eliminates a maintenance hazard."

---

## Changes

### Critical: Boolean Validation

| File | Field | Fix |
|------|-------|-----|
| `server/routes-rating-photos.ts` | `isReceipt` | Extract as `rawIsReceipt`, validate with `=== true` |
| `server/routes-ratings.ts` | `q1NoSpecificExperience` | `req.body.q1 === true` |
| `server/routes-ratings.ts` | `q2ScoreMismatchNote` | `req.body.q2 === true` |
| `server/routes-ratings.ts` | `q3InsiderSuspected` | `req.body.q3 === true` |
| `server/routes-ratings.ts` | `q4CoordinatedPattern` | `req.body.q4 === true` |
| `server/routes-ratings.ts` | `q5CompetitorBombing` | `req.body.q5 === true` |

### Critical: String Sanitization

| File | Field | Fix |
|------|-------|-----|
| `server/routes-admin-claims-verification.ts` | `req.body.reason` | Added `sanitizeString(reason, 500)` |

### High: URL Protocol Validation

| File | Fix |
|------|-----|
| `server/routes-businesses.ts` | Validate action URLs with `new URL()` + protocol whitelist (http/https only) |

### Dead Code Removal

| File | Fix |
|------|-----|
| `server/index.ts` | Removed unused `const log = console.log` |

---

## Tests

- **New:** 18 tests in `__tests__/sprint746-input-validation.test.ts`
- **Total:** 12,880 tests across 553 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 663.5kb / 750kb (88.5%) |
| Tests | 12,880 / 553 files |
| Unvalidated boolean inputs | 0 (was 6) |
| Unsanitized admin string inputs | 0 (was 1) |
| URL fields without protocol validation | 0 (was 6) |
| Dead code in server entry | 0 (was 1) |
