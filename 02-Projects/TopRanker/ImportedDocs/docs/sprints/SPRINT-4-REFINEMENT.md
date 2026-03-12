# Sprint 4: Refinement (v1.4-Refinement)

**Sprint Goal:** Code quality, visual polish, accessibility, and brand consistency based on full Architect Council v2.0 assessment.

**Status:** In Progress
**Target Tag:** `v1.4-Refinement`

**Council Members Contributing:**
- REX (Code Quality) — shared hook extraction
- NOVA (Motion) — card entrance animations
- ARIA (UI/Visual) — section dividers
- LENA (Layout/IA) — review prominence
- ALEX (Accessibility) — improved labels and hints
- DANTE (Typography/Brand) — rankings subtitle

---

## Tickets

### TICKET-4.1: Extract usePressAnimation to Shared Hook
- **Architect:** REX (Code Quality)
- **Priority:** P0
- **Files Modified:**
  - `hooks/usePressAnimation.ts` (NEW)
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/search.tsx`
  - `app/(tabs)/challenger.tsx`
- **Description:**
  The `usePressAnimation()` hook was duplicated in 3 tab files. Extracted to a single shared hook file at `hooks/usePressAnimation.ts`. All 3 files now import from the shared location, eliminating 30+ lines of duplicated code.

### TICKET-4.2: Leaderboard Card Entrance Animation
- **Architect:** NOVA (Motion)
- **Priority:** P1
- **Files Modified:**
  - `app/(tabs)/index.tsx`
- **Description:**
  RankedCards on the leaderboard now fade in with a subtle slide-up as they enter the viewport. Uses `Animated.timing` with opacity (0->1) and translateY (10->0) over 300ms. The animation is triggered on mount via useEffect inside the memoized component.

### TICKET-4.3: Section Dividers on Business Detail
- **Architect:** ARIA (UI/Visual)
- **Priority:** P1
- **Files Modified:**
  - `app/business/[id].tsx`
- **Description:**
  Added subtle horizontal dividers between major sections in the business detail page (after description, after score card, after action bar, after dishes). Creates clear visual separation and reduces the "wall of content" feel.

### TICKET-4.4: Review Count Preview Above Fold
- **Architect:** LENA (Layout/IA)
- **Priority:** P1
- **Files Modified:**
  - `app/business/[id].tsx`
- **Description:**
  Added a review summary row in the stats bar area that shows "X community reviews" with a down-arrow hint. This surfaces review content above the fold so users know reviews exist before scrolling all the way down.

### TICKET-4.5: Accessibility Improvements
- **Architect:** ALEX (Accessibility)
- **Priority:** P0
- **Files Modified:**
  - `app/(tabs)/search.tsx` — price filter accessibility hints
  - `app/(tabs)/index.tsx` — category chip hints
- **Description:**
  - Price filter chips now have `accessibilityHint="Double tap to filter by this price range"`
  - Category chips have `accessibilityHint="Double tap to view this category"`
  - All filter chips properly announce selected state

### TICKET-4.6: Rankings Tab Subtitle
- **Architect:** DANTE (Typography/Brand)
- **Priority:** P2
- **Files Modified:**
  - `app/(tabs)/index.tsx`
- **Description:**
  Added a subtle subtitle under the logo on the Rankings tab: "Top-rated in Dallas" with the city name. Reinforces brand positioning and gives context about what the leaderboard shows.

---

## Council Sign-off
- Marcus: "[PENDING]"

## Release Checklist
- [ ] All 6 tickets implemented
- [ ] No TypeScript errors
- [ ] Visual QA on web
- [ ] Git tag: `v1.4-Refinement`
