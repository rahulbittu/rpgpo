# Sprint 48 Retrospective — Referral System

**Date:** March 7, 2026
**Sprint Duration:** 0.5 days
**Story Points:** 5
**Facilitator:** Sarah Nakamura (VP Engineering)

## What Went Well
- **Marco Silva**: "The four reward tiers create a gamification loop. Users want to hit 3, then 5, then 10. Each milestone feels achievable and rewarding."
- **Olivia Hart**: "'Grow the Trust Network' reframes referrals from selfish to altruistic. Users aren't begging friends to download an app — they're building something better together."
- **Victoria Ashworth**: "Clean legal compliance. No contact access, user-initiated sharing only, visible referral code. This is how referrals should work."

## What Could Improve
- **Marco Silva**: "We need server-side referral attribution. When someone signs up with a referral code, we need to credit the referrer and update their count."
- **James Park**: "The copy button should use Clipboard API for instant copy instead of opening the share sheet as fallback."

## Action Items
- [ ] Build `POST /api/signup` referral code attribution — **Priya Sharma**
- [ ] Add `referralCode` and `referredBy` columns to members table — **Priya Sharma**
- [ ] Use `expo-clipboard` for copy button — **James Park**
- [ ] Track referral_share and referral_signup analytics events — **Marco Silva**

## Team Morale: 9/10
Growth features energize the team. Everyone wants to see viral coefficient > 1.
