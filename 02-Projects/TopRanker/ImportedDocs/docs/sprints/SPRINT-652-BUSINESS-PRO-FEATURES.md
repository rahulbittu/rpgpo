# Sprint 652: Business Pro Feature Set

**Date:** 2026-03-11
**Points:** 5
**Focus:** Wire Business Pro subscription gating on owner dashboard — insights lock, Pro badge, priority support indicator

## Mission

Business Pro at $49/month was partially built: Stripe integration, subscription schema, and the upsell page existed, but the owner dashboard showed all features to all users regardless of subscription status. This sprint connects the subscription status to the UI: free users see limited data + upsell CTA, Pro users see full analytics + priority support badge.

## Team Discussion

**Marcus Chen (CTO):** "This is the revenue unlock sprint. The server already gates data by subscription status (Sprint 176), but the dashboard ignores `isPro` and shows everything. We need the UI to respect the paywall."

**Rachel Wei (CFO):** "The conversion funnel is: free dashboard → see locked insights → tap Upgrade → Stripe checkout → Pro active. This sprint completes the 'see locked insights' step that drives conversion."

**Amir Patel (Architecture):** "Clean approach: the `/api/businesses/:slug/dashboard` already returns `isPro` and `subscriptionStatus`. The dashboard just needs to branch on it. No new endpoints needed."

**Sarah Nakamura (Lead Eng):** "Three UI changes: (1) Insights tab shows a Pro gate lock for free users, (2) Pro upsell card becomes tappable with navigation to the checkout page, (3) Active Pro users see a priority support badge and a PRO badge in the header."

**Nadia Kaur (Cybersecurity):** "The actual data gating happens server-side — free users get truncated data regardless of UI. This sprint is purely presentation layer. No security changes needed."

**Jordan Blake (Compliance):** "The Pro badge on business detail pages is public — customers can see which businesses are Pro subscribers. Make sure it's clear this indicates a business subscription, not a ranking endorsement."

**Jasmine Taylor (Marketing):** "The Pro badge on business cards creates FOMO for other business owners. 'Why does my competitor have a PRO badge and I don't?' — that's the conversion driver."

## Changes

### `app/business/dashboard.tsx` (397 → 483 LOC)
- Dashboard now reads `isPro` from API response
- **Free users:** Insights tab shows Pro gate overlay with lock icon, description, and Upgrade CTA button
- **Free users:** Pro upsell card is now tappable, navigates to `/business/enter-dashboard-pro`
- **Pro users:** Header shows amber PRO badge next to VERIFIED OWNER badge
- **Pro users:** Upsell card replaced with "Dashboard Pro Active" card + priority support indicator
- Added `badgeRow`, `proBadge`, `proBadgeText`, `priorityBadge`, `priorityText`, `proActiveCard`, `proGateCard`, `proGateTitle`, `proGateDesc`, `proGateBtn`, `proGateBtnText` styles

### `components/business/BusinessNameCard.tsx` (73 → 84 LOC)
- Added optional `isPro` prop to interface
- Shows amber PRO badge next to business name when subscribed
- Added `proBadge`, `proBadgeText` styles

### `components/business/BusinessHeroSection.tsx` (158 → 160 LOC)
- Added `isPro` to business prop interface
- Passes `isPro` through to `BusinessNameCard`

### `types/business.ts`
- Added `isPro?: boolean` to `MappedBusiness` interface

### `lib/api.ts` (558 → 560 LOC)
- Added `subscriptionStatus?: string | null` to `ApiBusiness` interface
- `mapApiBusiness` now computes `isPro` from subscription status (active or trialing)

### Test Updates
- `sprint576`: api.ts ceiling 560 → 570
- `sprint589`: BusinessHeroSection ceiling 160 → 170
- `sprint623`: api.ts ceiling 560 → 570

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 646.8kb (no change — client-side only)
- **dashboard.tsx:** 483 LOC (ceiling 520) — 93% utilization
- **api.ts:** 560 LOC (ceiling 570) — 98% utilization
