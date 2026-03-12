# Critique Request: Sprints 651-654

**Date:** 2026-03-11
**Requester:** Engineering Team
**Sprints covered:** 651 (Search actions hook), 652 (Pro features), 653 (Pricing + Stripe), 654 (Claim verification UI)

## Summary of Changes

### Sprint 651: Extract useSearchActions Hook
- Extracted URL sync + share handler from search.tsx into `lib/hooks/useSearchActions.ts`
- Reduced search.tsx from 596→567 LOC (98%→93% ceiling)

### Sprint 652: Business Pro Feature Set
- Dashboard now gates insights tab behind Pro subscription
- Pro badge in dashboard header and on business detail pages
- Priority support indicator for Pro subscribers
- Upsell card is now tappable with navigation to checkout

### Sprint 653: Pricing Page + Stripe Checkout
- New `/pricing` page with three tiers: Free, Pro ($49/mo), Featured ($199/wk)
- Fixed Stripe Checkout redirect — production now redirects to Stripe hosted checkout
- FAQ section addressing "Does Pro affect my ranking?" (No)

### Sprint 654: Claim Verification UI
- Claim page now handles `requiresCode: true` from Sprint 649's email verification
- 6-digit code entry screen with amber-bordered input
- Verification success navigates to owner dashboard
- Fixed "Coming Soon" claim button to navigate to actual claim flow

## Questions for Reviewer

1. **Pro badge visibility:** We show a PRO badge on business detail pages for all users to see. Is this the right choice? It could create FOMO for business owners (good) but might concern users who think they can "buy" rankings (bad).

2. **Pricing page conversion:** The "Get Started" button on Dashboard Pro goes to search (to find their business, then claim). Should it go directly to a "Find Your Business" flow instead?

3. **Claim verification UX:** The code input is a single TextInput with letter-spacing. Should we use 6 separate digit boxes (like banking apps) for better UX? Current approach is simpler but less polished.

4. **Stripe redirect flow:** In production, we redirect to Stripe's hosted checkout. After successful payment, Stripe redirects back to `/business/:slug/dashboard?subscription=success`. We don't currently show a success toast on that redirect. Should we?

5. **api.ts at 98% ceiling:** We added 2 lines (subscriptionStatus + isPro mapping). The file is now at 560/570. Is extracting mapApiBusiness the right approach, or should we raise the ceiling?
