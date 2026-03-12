# Retro 649: Business Claim Email Verification

**Date:** 2026-03-11
**Duration:** 15 min
**Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well
- **Marcus Chen:** "First step toward monetization complete. Email verification enables self-service business claims, which unblocks Business Pro."
- **Rachel Wei:** "The revenue timeline is back on track. Verified claims → Business Pro → $49/month per business."
- **Nadia Kaur:** "Security is solid: max 5 attempts, 48-hour expiry, auth-gated endpoint, code sent to business email (not user email)."
- **Sarah Nakamura:** "Clean branching in the claim route. Email path and manual path coexist without code duplication."
- **Amir Patel:** "Storage functions are self-contained. `verifyClaimByCode` handles validation, approval, AND ownership transfer in one atomic operation."

## What Could Improve
- Should add rate limiting on the verify endpoint to prevent brute force (6 digits = 1M combinations, 5 attempts is fine but rate limiting adds defense in depth).
- Need a "resend code" endpoint for cases where the email doesn't arrive.
- The email template should include the business name in the subject for better inbox recognition.
- routes-businesses.ts at 347/360 LOC — should extract claim routes to `routes-claims.ts` soon.

## Action Items
- [ ] Add rate limiting on /api/businesses/claims/:claimId/verify (Owner: Nadia)
- [ ] Add "resend code" endpoint (Owner: Sarah)
- [ ] Extract claim routes to `routes-claims.ts` if file grows further (Owner: Amir)
- [ ] Wire UI for claim verification code input on business detail page (Owner: Design team)

## Team Morale
8.5/10 — Highest-impact sprint in the batch. Revenue-aligned, security-conscious, clean execution.
