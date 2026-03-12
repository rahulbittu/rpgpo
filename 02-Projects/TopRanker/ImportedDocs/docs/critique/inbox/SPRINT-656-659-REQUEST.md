# Critique Request: Sprints 656-659

**Date:** 2026-03-11
**Requester:** Marcus Chen (CTO)
**Sprints covered:** 656, 657, 658, 659

## Summary of Changes

### Sprint 656: API Mapper Extraction (2 pts)
Extracted `mapApiBusiness`, `mapApiRating`, and `resolvePhotoUrl` from `lib/api.ts` to `lib/api-mappers.ts`. Reduced api.ts from 560→483 LOC. 11 test files updated to read new file location.

### Sprint 657: Claim Verification Rate Limiting (3 pts)
Added IP-based rate limiting (5 req/min) to `POST /api/businesses/claims/:claimId/verify`. Uses existing express-rate-limit infrastructure. Closes Audit #105/#110 M1 finding. Defense-in-depth: 6-digit code + 5-attempt lockout + IP rate limiting + auth + 48hr expiry.

### Sprint 658: Batch Rating Reminder Query (2 pts)
Replaced N+1 per-user query in `sendRatingReminderPush()` with single LEFT JOIN + GROUP BY batch query. Eliminates per-user database round trips. Closes Audit #105 M3.

### Sprint 659: Claim Routes Extraction (3 pts)
Extracted claim submission and verification endpoints from `routes-businesses.ts` to `routes-claims.ts`. Reduced routes-businesses.ts from 348→257 LOC (26% reduction). 4 test files updated.

## Questions for Reviewer

1. **Extraction velocity:** Four sprints produced two extractions (api-mappers, routes-claims). Is the codebase becoming over-modularized, or is this healthy separation of concerns? At what point do too many small files hurt discoverability?

2. **Rate limiting coverage:** Claim verification is now rate-limited, but claim submission (`POST /api/businesses/:slug/claim`) is not. Should it be? It requires auth, but a compromised account could spam claims.

3. **N+1 detection:** The batch query fix was reactive (found during audit). Should we add a development-time N+1 detector (e.g., query count assertions in tests)?

4. **Test file maintenance:** 15 test files were updated across these 4 sprints (mostly changing file path references). Is there a pattern that would make extractions less test-disruptive?

5. **Audit finding resolution time:** The rate limiting finding was carried for 2 audit cycles before resolution. The new policy says security findings escalate to P1 after 1 carry-forward. Is this policy documented and enforced?
