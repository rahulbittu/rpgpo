# Sprint 394: Business Claim Verification Improvements

**Date:** 2026-03-09
**Type:** Enhancement
**Story Points:** 3

## Mission

Strengthen the business claim verification flow by collecting more verification signals: business email, website URL, and preferred verification method. Give admins richer data for faster, more confident claim decisions.

## Team Discussion

**Marcus Chen (CTO):** "Our claim form currently collects role and phone — that's barely enough for a decision. Adding business email and website gives admins two more signals. A matching domain email is strong evidence of ownership."

**Amir Patel (Architecture):** "The verification method selector (email/phone/document) tells the admin HOW to verify. If someone picks 'email' and provides owner@restaurant.com, admin sends a code. If 'document', admin requests a license upload. Structured workflow instead of guessing."

**Priya Sharma (Frontend):** "The method chips use the same design language as our sort chips. Context-specific hints below the chips explain what each method means. The form still works with just role — new fields are optional for backwards compatibility."

**Jordan Blake (Compliance):** "Business email addresses should match the business domain where possible. We should flag claims where the email domain doesn't match the website domain — future anti-fraud signal."

**Rachel Wei (CFO):** "Faster claim verification = faster Business Pro conversions. If we can verify in hours instead of days, we close the gap between 'interested' and 'paying.'"

**Sarah Nakamura (Lead Eng):** "Server-side, we sanitize all new inputs and pack them into the verificationMethod string using pipe separators. No schema changes needed — we're using the existing text field more effectively."

## Changes

### Modified Files
- `app/business/claim.tsx` — Added businessEmail, website, verificationMethod states. 3 new form fields, method selector chips with contextual hints. 5 new styles.
- `server/routes-businesses.ts` — Parses new fields (businessEmail, website, verificationMethod), builds structured verification string with pipe separators.

### New Files
- `tests/sprint394-claim-verification.test.ts` — 20 tests

## Test Results
- **299 files**, **7,203 tests**, all passing
- Server build: **601.1kb**, 31 tables
