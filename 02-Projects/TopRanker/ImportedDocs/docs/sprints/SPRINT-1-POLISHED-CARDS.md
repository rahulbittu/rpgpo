# Sprint 1: Polished Cards (v1.1-Polished-Cards)

**Sprint Goal:** Elevate the tactile feel and interactivity of all card components across the app, add missing micro-interactions, and tighten input validation.

**Status:** In Progress
**Target Tag:** `v1.1-Polished-Cards`

---

## Tickets

### TICKET-1.1: Press Animations on All Tappable Cards
- **Architect:** NOVA (Micro-interactions)
- **Priority:** P0
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/index.tsx` — RankedCard, HeroCard
  - `app/(tabs)/search.tsx` — BusinessCard, MapBusinessCard
  - `app/(tabs)/challenger.tsx` — ChallengeCard (fighter TouchableOpacity)
- **Description:**
  Every tappable card now uses `Animated.spring` to scale to 0.97 on press and back to 1.0 on release. This gives a native-quality "push-in" feel on every card surface. Uses `useNativeDriver: true` for 60fps on all platforms.
- **Implementation:**
  - Created a reusable `usePressAnimation()` hook returning `{ scaleValue, onPressIn, onPressOut, animatedStyle }`
  - Wrapped each card's `TouchableOpacity` in `Animated.View` with the scale transform
  - Spring config: `toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4`
- **Testing:**
  - Tap any card — should see subtle scale-down
  - Release — should spring back smoothly
  - Long press then drag away — should still animate back

### TICKET-1.2: Search Input Length Limit
- **Architect:** SIERRA (Safety & Limits)
- **Priority:** P1
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/index.tsx` — leaderboard filter input
  - `app/(tabs)/search.tsx` — discover search input
- **Description:**
  All search/filter TextInputs now have `maxLength={100}` to prevent excessively long queries from hitting the API or causing layout issues.
- **Testing:**
  - Type more than 100 characters — input should stop accepting
  - Paste a long string — should be truncated at 100

### TICKET-1.3: Tab Bar Active Dot Indicator
- **Architect:** UXO (Visual Polish)
- **Priority:** P1
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/_layout.tsx`
- **Description:**
  Active tab now shows a small amber dot below the icon, providing a clear visual indicator of the current tab beyond just color change. The dot is 5px wide with a 2.5px border radius, positioned below the icon with a subtle amber glow shadow.
- **Testing:**
  - Switch between tabs — dot should appear under active tab only
  - Check both iOS and web rendering

### TICKET-1.4: Score Counter Animation on Business Detail
- **Architect:** NOVA (Micro-interactions)
- **Priority:** P2
- **Status:** In Progress
- **Files Modified:**
  - `app/business/[id].tsx`
- **Description:**
  The weighted score on the business detail hero section now animates from 0.0 to the actual value using a counting animation when the page loads. Creates an engaging "reveal" effect.
- **Implementation:**
  - `useEffect` with `Animated.timing` over 800ms using `Easing.out(Easing.cubic)`
  - Listener updates displayed text on each frame
  - Score displays with 1 decimal place throughout animation
- **Testing:**
  - Navigate to any business detail — score should count up from 0.0
  - Should complete in ~800ms
  - Should show correct final value

### TICKET-1.5: Open Now Filter on Discover
- **Architect:** FELIX (Feature)
- **Priority:** P1
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  Added "Open Now" as a new filter option in the Discover tab's filter chips. When active, only businesses with `isOpenNow === true` are shown. Integrates seamlessly with existing filter system.
- **Testing:**
  - Tap "Open Now" chip — only open businesses shown
  - Combine with other filters (e.g., "Top 10" + "Open Now")
  - If no businesses are open, empty state should show

### TICKET-1.6: Daily Rating Activity Indicator on Cards
- **Architect:** REX (Data Display)
- **Priority:** P2
- **Status:** In Progress
- **Files Modified:**
  - `app/(tabs)/index.tsx` — RankedCard
  - `app/(tabs)/search.tsx` — BusinessCard
- **Description:**
  Cards with high recent rating activity (ratingCount >= 20) now show a subtle "trending" fire indicator, signaling to users that a business is getting active community engagement.
- **Testing:**
  - Businesses with 20+ ratings should show fire icon
  - Icon should be subtle, not overwhelming the card layout

---

## Release Checklist
- [ ] All 6 tickets implemented
- [ ] No TypeScript errors
- [ ] Visual QA on web
- [ ] Git tag: `v1.1-Polished-Cards`
