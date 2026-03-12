# Retrospective — Sprint 192: Client-side Referral UI

**Date:** 2026-03-09
**Duration:** 1 session
**Story Points:** 8
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Mock data elimination. The referral screen was the last holdout with useState(0). Now every user-facing data point comes from the API."

**Jasmine Taylor:** "The referral network list with activation indicators is exactly what we needed for the beta invite flow. Users can track their impact."

**Amir Patel:** "TypeScript interfaces for ReferralStats and ReferralEntry make the API contract explicit. No more guessing what the endpoint returns."

## What Could Improve

- **Referral code validation** in the signup form (client-side) still not built
- **Clipboard copy** uses share sheet fallback — should use actual Clipboard API
- **No push notification** when a referral activates (signs up and rates)

## Action Items

| Item | Owner | Sprint |
|------|-------|--------|
| Add referral code input to signup form | Dev Team | 194+ |
| Implement Clipboard API for code copy | Sarah Nakamura | 194+ |
| Push notification on referral activation | Dev Team | 195+ |

## Team Morale

**8/10** — Satisfying sprint. Closing the mock data gap gives confidence in the beta. The referral screen now tells a real story.
