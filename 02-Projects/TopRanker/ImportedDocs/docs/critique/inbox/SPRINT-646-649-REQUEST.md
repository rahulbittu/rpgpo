# Critique Request: Sprints 646-649

**Date:** 2026-03-11
**Requester:** Engineering Team
**Sprints covered:** 646 (Native share), 647 (URL sync), 648 (Rating reminder), 649 (Claim email verification)

## Summary of Changes

### Sprint 646: Native Share Sheet
- Upgraded search share from clipboard-only to native `Share.share()` with clipboard fallback
- Added profile sharing with tier-aware text ("Trusted Judge on TopRanker with N ratings!")

### Sprint 647: Search URL Sync
- Filter state now syncs to browser URL via `history.replaceState`
- Enables browser back/forward and bookmarkable search views

### Sprint 648: Rating Reminder Push
- Daily push notification at 6pm UTC for users inactive 7+ days
- Personalized with first name and selected city
- Respects `ratingReminders` notification preference

### Sprint 649: Business Claim Email Verification
- Owner-facing email verification: 6-digit code → 48-hour expiry → auto-approve
- New `POST /api/businesses/claims/:claimId/verify` endpoint
- Branded email template with verification code
- Max 5 attempts before lockout

## Questions for Reviewer

1. **Email verification security:** We send the code to the *business* email, not the user's email. Is this sufficient proof of ownership? What if the business email is a generic Gmail (e.g., bestbiryani@gmail.com)?

2. **Rating reminder frequency:** Currently runs daily and checks if user rated in last 7 days. A user who continues not rating gets a reminder every day. Should we cap at once per 7 days?

3. **URL sync on web:** We use `history.replaceState` not `history.pushState`. This means filter changes don't create new history entries. Is this the right UX? Should some filter changes (like query) use pushState?

4. **Profile share text:** Currently static text. Should we include a deep link to the user's profile? We don't have public profile URLs yet.

5. **Build size trend:** 637.9kb → 646.8kb in 4 sprints (+9kb). All server-side. Is this growth rate sustainable, or should we be more aggressive about tree-shaking?
