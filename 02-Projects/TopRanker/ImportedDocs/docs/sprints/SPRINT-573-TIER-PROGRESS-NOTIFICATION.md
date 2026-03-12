# Sprint 573: Tier Progress Notification

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 26 new (10,853 total across 463 files)

## Mission

Add a tier progress notification banner that appears on the profile page when a user is close to reaching their next credibility tier. Shows progress percentage, points remaining, next tier weight multiplier, and contextual tips for advancing. This creates a motivational feedback loop that strengthens the core Rate → Consequence → Ranking chain by making tier progression feel tangible and actionable.

## Team Discussion

**Marcus Chen (CTO):** "Tier progression is one of our most important feedback loops. Users who understand how close they are to the next tier rate more frequently. The notification surfaces at 60% progress — not too early to be noise, not too late to be useless."

**Sarah Nakamura (Lead Eng):** "The component is self-contained at 207 LOC. It reads TIER_SCORE_RANGES to calculate progress, uses pct() for the progress bar, and cycles through TIER_TIPS based on totalRatings for variety. Returns null for top tier users or those below the proximity threshold."

**Amir Patel (Architecture):** "profile.tsx grew from 448 to 455 LOC — just the import and 6 lines of JSX. The component handles all its own logic including the nextTierMap, progress calculation, and null guards. No new API calls."

**Rachel Wei (CFO):** "This directly drives conversion to higher tiers, which means higher-weight ratings, which means more trustworthy rankings. Users at the city→trusted transition are our most engaged cohort — surfacing proximity here reinforces the behavior we want."

**Nadia Kaur (Cybersecurity):** "The component only reads from existing profile data passed as props. No new API surface, no new data fetching. The TIER_TIPS are hardcoded strings — no user-generated content risk."

**Leo Hernandez (Design):** "The notification uses the next tier's color for the progress bar and icon background, creating a visual pull toward the destination. The tip row with bulb icon gives it a coaching feel rather than a system notification."

## Changes

### New: `components/profile/TierProgressNotification.tsx` (207 LOC)
- `TierProgressNotificationProps`: tier, credibilityScore, totalRatings, delay, onDismiss
- PROXIMITY_THRESHOLD (0.60) — only shows when 60%+ toward next tier
- TIER_TIPS — actionable guidance per current tier (community, city, trusted)
- TIER_ICONS — trophy, shield-checkmark, star, person per tier
- Progress bar colored to next tier, percentage badge, points-needed subtitle
- Tip row cycles through tips based on totalRatings for variety
- FadeInDown animation, returns null for top tier or below threshold
- Dismissible via onDismiss callback

### Modified: `app/(tabs)/profile.tsx` (448→455 LOC, +7)
- Added import: TierProgressNotification
- Renders after ProfileCredibilitySection, before AchievementsSection
- Passes tier, credibilityScore, totalRatings, delay=200

### Modified: `shared/thresholds.json`
- Added TierProgressNotification.tsx: maxLOC 210, current 207
- Tests: currentCount 10827→10853

## Test Summary

- `__tests__/sprint573-tier-progress-notification.test.ts` — 26 tests
  - Component: 21 tests (export, interface, props, imports, pct, threshold, tips, icons, null guards, points calc, animation, title, weight, progress bar, tip row, dismiss, styling, LOC)
  - Profile integration: 5 tests (import, render, credibilityScore prop, totalRatings prop, delay)
