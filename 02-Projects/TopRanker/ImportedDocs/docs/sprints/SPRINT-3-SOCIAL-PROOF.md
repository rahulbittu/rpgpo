# Sprint 3: Social Proof & Engagement (v1.3-Social-Proof)

**Sprint Goal:** Add social proof indicators, enhance rank change visibility, add haptic feedback to card presses, improve the tier journey on profile, and polish skeleton loading states.

**Status:** In Progress
**Target Tag:** `v1.3-Social-Proof`

---

## Tickets

### TICKET-3.1: Rating Velocity Indicator on Hero Card
- **Architect:** REX (Data Display)
- **Priority:** P1
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/index.tsx` — HeroCard
- **Description:**
  The #1 ranked hero card now shows the total number of ratings with a "trending" label when rating count is high (50+). Adds social proof that the top business is actively being reviewed by the community.
- **Testing:**
  - View #1 card with 50+ ratings — should show "Hot" indicator
  - Cards with fewer ratings show normal count

### TICKET-3.2: Enhanced Rank Delta Display
- **Architect:** UXO (Visual Polish)
- **Priority:** P1
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/index.tsx` — RankedCard rank delta styling
- **Description:**
  Rank change deltas on leaderboard cards now have background color pills instead of plain text. Green background for rank up, red background for rank down. Makes rank changes much more visible and scannable.
- **Testing:**
  - Business with positive rankDelta shows green pill with up arrow
  - Business with negative rankDelta shows red pill with down arrow
  - Zero delta shows nothing (no change)

### TICKET-3.3: Haptic Feedback on Card Press
- **Architect:** NOVA (Micro-interactions)
- **Priority:** P2
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/index.tsx` — RankedCard, HeroCard
  - `app/(tabs)/search.tsx` — BusinessCard
- **Description:**
  Card presses now trigger a light haptic (Haptics.impactAsync Light) alongside the existing spring animation. Provides tactile confirmation of the press interaction.
- **Testing:**
  - Tap any card — should feel subtle vibration on supported devices
  - Web platform skips haptics gracefully

### TICKET-3.4: Tier Journey Timeline Enhancement
- **Architect:** ARIA (Architecture)
- **Priority:** P2
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/profile.tsx`
- **Description:**
  The credibility tiers section now shows a vertical timeline connector line between tiers, making it clear that tiers are a progression journey. The active tier is highlighted with a pulsing border effect, and completed tiers show a checkmark.
- **Testing:**
  - View profile — tier list shows connecting line
  - Current tier is highlighted
  - Tiers below current show checkmarks

### TICKET-3.5: Enhanced Skeleton Shimmer
- **Architect:** UXO (Visual Polish)
- **Priority:** P3
- **Status:** In Progress
- **Files Modified:**
  - `components/Skeleton.tsx`
- **Description:**
  Added animated shimmer opacity pulse to skeleton loading states. The skeleton blocks now pulse between 30% and 70% opacity in a 1-second loop, creating a more polished loading experience.
- **Testing:**
  - Navigate to any tab with slow connection
  - Skeleton blocks should pulse/shimmer

### TICKET-3.6: "In Challenge" Badge with Glow
- **Architect:** FELIX (Feature)
- **Priority:** P2
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/index.tsx` — challengerPill styles
- **Description:**
  The "IN CHALLENGE" pill on leaderboard cards now has a subtle navy glow shadow and slightly larger text for better visibility. Makes it easier to spot which businesses are currently in active challenges.
- **Testing:**
  - Find a business that isChallenger — badge should have visible glow
  - Badge text is slightly larger and more legible

---

## Release Checklist
- [ ] All 6 tickets implemented
- [ ] No TypeScript errors
- [ ] Visual QA on web
- [ ] Git tag: `v1.3-Social-Proof`
