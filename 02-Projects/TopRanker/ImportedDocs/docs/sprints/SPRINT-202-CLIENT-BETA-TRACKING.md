# Sprint 202 — Client-Side Beta Tracking

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

## Mission Alignment

Complete the beta analytics loop. Server-side tracking (Sprint 199) captures API events. Client-side tracking captures user intent: page views, CTA taps, referral shares. Together, they give the full picture of how beta users move through the funnel.

## Team Discussion

**Marcus Chen (CTO):** "Server analytics tell us what happened. Client analytics tell us what users tried to do. We need both to understand the beta experience."

**Rachel Wei (CFO):** "Now we can measure: How many invite recipients viewed the join page? How many tapped the CTA? How many completed signup with a referral code? Every step of the funnel is instrumented."

**Sarah Nakamura (Lead Eng):** "Four new event types, four convenience functions, three pages instrumented. Clean integration — Analytics.betaJoinPageView, Analytics.betaJoinCtaTap, Analytics.betaSignupWithReferral, Analytics.betaReferralShare."

**Jasmine Taylor (Marketing):** "The referral_code property on every beta event lets us track which referral codes drive the most conversions. That's how we identify our best beta advocates."

## Deliverables

### Client-Side Beta Events (`lib/analytics.ts`)
- 4 new event types: `beta_join_page_view`, `beta_join_cta_tap`, `beta_signup_with_referral`, `beta_referral_share`
- 4 convenience functions on Analytics object with referral code tracking

### Join Page Instrumentation (`app/join.tsx`)
- `Analytics.betaJoinPageView(referralCode)` on mount
- `Analytics.betaJoinCtaTap(referralCode)` on CTA button press

### Signup Tracking (`app/auth/signup.tsx`)
- `Analytics.signupComplete("email")` on successful signup
- `Analytics.betaSignupWithReferral(referralParam)` when referral code present

### Referral Share Tracking (`app/referral.tsx`)
- `Analytics.betaReferralShare("share_sheet")` on referral share action

## Tests

- 20 new tests in `tests/sprint202-client-beta-tracking.test.ts`
- Full suite: **3,466 tests across 132 files, all passing in ~2s**
