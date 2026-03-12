# Sprint 126: Credibility UX & Data Honesty

**Date:** 2026-03-08
**Sprint Goal:** Make the credibility system feel empowering, not punishing. Add honest low-data labels. Reduce false precision across the app.

## Mission Alignment
Every change in this sprint serves the trust thesis: if the app claims to be about trust and credibility, the UX must be honest about its own confidence levels and must make contributors feel welcomed, not diminished.

## Team Discussion

**Sarah Nakamura (Lead Engineer):** "The confirmation screen showing x0.10 to new users was technically correct but emotionally hostile. A trust product cannot make contributors feel powerless on their first interaction."

**Marcus Chen (CTO):** "The false precision problem was systemic — 893.233 weighted votes, 2235.65 on challenger cards. That level of decimal display creates fake objectivity. Real products round aggressively in the UI and keep precision in the backend."

**James Park (Frontend Lead):** "The profile page was the worst offender. 'Vote Weight 0.10x' as a headline metric made new members feel like their opinion doesn't count. Replacing it with 'Starter Influence' communicates the same system without the emotional damage."

**Amir Patel (Architecture):** "The rank confidence system is architecturally simple but product-critical. A place with 1 rating should never be presented with the same authority as a place with 50. We added 4 confidence levels that map directly to totalRatings thresholds."

**Nadia Kaur (Security/Trust):** "The offline banner was using emergency-red (#E53935). For a trust product, that color should be reserved for actual security events, not network status. Navy is calmer and more premium."

**Rachel Wei (CFO):** "From a business perspective, showing '0% would return' on a restaurant with 1 rating is actively hostile to business owners. The formatReturnRate function now shows '--' until sample size is meaningful."

## Changes

### 1. Rating Confirmation Redesign
- **File:** `components/rate/SubComponents.tsx`
- "Rating Submitted" → "Your Rating is Live"
- "Your weighted vote has been counted" → "Your voice is now part of this ranking"
- Removed raw weight display (x0.10), replaced with influence label
- "Weighted Score" → "Contribution"
- Added growth hint: "Rate consistently to grow your influence"
- Reduced decimal precision from .toFixed(2) to .toFixed(1)

### 2. Influence Label System
- **File:** `lib/data.ts`
- New `TIER_INFLUENCE_LABELS`: Starter / Growing / Strong / Maximum Influence
- Applied to confirmation screen, profile page, and tier journey
- Raw multipliers (0.10x, 0.35x, etc.) hidden from user-facing surfaces
- Math unchanged — only the presentation layer

### 3. Rank Confidence System
- **File:** `lib/data.ts`
- New `getRankConfidence()` function: provisional (<3), early (<10), established (<25), strong (25+)
- New `RANK_CONFIDENCE_LABELS` with descriptions
- **File:** `app/business/[id].tsx` — confidence badge below stats bar
- **File:** `components/leaderboard/SubComponents.tsx` — confidence pill on ranked cards
- Trust explainer text adapts for low-data businesses

### 4. Profile Page Credibility Redesign
- **File:** `app/(tabs)/profile.tsx`
- "Credibility Score" → "Credibility"
- "Vote Weight 0.10x" → "Starter Influence · New Member"
- Tier journey now shows influence labels instead of raw weights

### 5. Precision & Honesty Cleanup
- **File:** `lib/style-helpers.ts` — new `formatCompact()` and `formatReturnRate()`
- **File:** `app/business/[id].tsx` — "Would Return" shows "--" when < 2 ratings
- **File:** `app/(tabs)/challenger.tsx` — vote counts use formatCompact (893.233 → 893)
- **File:** `components/NetworkBanner.tsx` — offline banner: red → navy

### 6. No Behavioral Changes
- All credibility math is identical
- Tier thresholds unchanged
- Weight calculations unchanged
- Only presentation layer modified

## Tests
- 24/24 credibility tests passing
- Zero new TypeScript errors from changes

## PRD Gap Closure
- Closes: "New user emotional onboarding" — users now feel progress, not punishment
- Closes: "Low-data false authority" — rankings honestly report confidence
- Closes: "Precision theater" — numbers are now UI-appropriate

## Files Changed
| File | Change |
|------|--------|
| `lib/data.ts` | +TIER_INFLUENCE_LABELS, +getRankConfidence, +RANK_CONFIDENCE_LABELS |
| `lib/style-helpers.ts` | +formatCompact, +formatReturnRate |
| `components/rate/SubComponents.tsx` | Confirmation redesign, influence labels |
| `app/rate/[id].tsx` | Step 2 summary uses influence labels |
| `app/(tabs)/profile.tsx` | Credibility card + tier journey redesign |
| `app/business/[id].tsx` | Confidence badge, safe return rate, adaptive trust text |
| `components/leaderboard/SubComponents.tsx` | Confidence pills on ranked cards |
| `app/(tabs)/challenger.tsx` | formatCompact on vote counts |
| `components/NetworkBanner.tsx` | Offline banner color: red → navy |
