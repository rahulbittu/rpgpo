# Retro 394: Business Claim Verification Improvements

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "No schema changes. We used the existing verificationMethod text field more effectively. The pipe-separated format (`role:Owner | method:email | email:owner@biryani.com | website:biryani.com`) gives admins structured data without a migration."

**Priya Sharma:** "The test suite caught me — sprint153 tests explicitly forbid '24-48 hours' in the claim form to prevent over-promising. Good guardrail. Fixed the copy immediately."

**Jordan Blake:** "Business email verification is the strongest ownership signal after a physical visit. Domain matching (email domain = website domain) is a future anti-fraud layer we can build on this."

## What Could Improve

- **No actual verification code flow yet** — The method selector says 'we'll send a code' but we don't actually do that yet. Sprint 238's in-memory verification system exists but isn't wired in.
- **Document upload not implemented** — Selecting 'Document' method doesn't provide an upload UI. That's a future sprint.
- **Admin UI doesn't show the new structured fields** — Admin sees the raw verificationMethod string. Should parse and display fields separately.

## Action Items

- [ ] Wire Sprint 238 verification code system to email method — **Owner: Amir Patel (future sprint)**
- [ ] Add document upload UI for claim verification — **Owner: Priya Sharma (future sprint)**
- [ ] Admin UI: Parse and display claim verification fields — **Owner: Sarah Nakamura (future sprint)**

## Team Morale
**8/10** — Practical improvement. The form looks more professional and gives admins real data to work with.
