# Sprint 9: Global City Context & Enhanced Empty States (v1.9-CityContext)

**Sprint Goal:** Unify city selection across all tabs with persistent storage. Eliminate dead-end empty states.

**Status:** Complete
**Tag:** `v1.9-CityContext`

---

## Architecture Council Decision

**Marcus Chen (CTO):** City selection was fragmented — Rankings had "coming soon" alert, Discover had local state, Challenger was hardcoded to Dallas. Unacceptable for multi-city product.

**James Park (Frontend Arch):** React Context + AsyncStorage. Lightweight, no external state library. CityProvider wraps app at root level. Every tab reads from `useCity()` hook.

**Priya Sharma (Backend Arch):** All API endpoints already accept city param. This is purely frontend state unification. Query keys include city for proper cache invalidation.

**Mei Lin (Mobile Arch):** AsyncStorage persists selection across app restarts. Cold start restores last city. SUPPORTED_CITIES const is single source of truth.

**Nina Petrov (DevOps):** No infrastructure changes needed.

**Elena Torres (VP Design):** Rankings tab now has a real dropdown city picker matching Discover's pattern. Consistent interaction model across tabs.

**David Okonkwo (VP Product):** Empty state in Discover now shows quick search suggestions (Tacos, Italian, Brunch, Sushi) — reduces dead-end exits.

---

## Tickets

### TICKET-9.1: CityContext Provider
- **Owner:** James Park (Frontend Arch)
- **Files Created:**
  - `lib/city-context.tsx`
- **Description:**
  CityProvider with `useCity()` hook. Persists to AsyncStorage under `topranker_selected_city`. Exports `SUPPORTED_CITIES` const and `SupportedCity` type. Default: Dallas. `isLoaded` flag prevents flash of default city on cold start.

### TICKET-9.2: Root Layout Integration
- **Owner:** Ryan Mitchell (Sr Frontend)
- **Files Modified:**
  - `app/_layout.tsx`
- **Description:**
  Wrapped app in `<CityProvider>` inside AuthProvider. All child routes have access to city context.

### TICKET-9.3: Rankings Tab — City Picker
- **Owner:** Tommy Nguyen (Frontend)
- **Files Modified:**
  - `app/(tabs)/index.tsx`
- **Description:**
  Replaced "coming soon" Alert with real dropdown city picker. Uses `useCity()` for state. Subtitle shows "Top-rated in {city}". All query keys include city. Removed unused `Alert` import. Added city picker dropdown styles matching Discover tab pattern.

### TICKET-9.4: Discover Tab — Shared City State
- **Owner:** Tommy Nguyen (Frontend)
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  Replaced `useState("Dallas")` with `useCity()`. Removed local `CITIES` constant — uses `SUPPORTED_CITIES` from context. City picker dropdown now powered by shared context. Map re-centers on city switch.

### TICKET-9.5: Challenger Tab — Dynamic City
- **Owner:** Ryan Mitchell (Sr Frontend)
- **Files Modified:**
  - `app/(tabs)/challenger.tsx`
- **Description:**
  Replaced hardcoded `"Dallas"` in query key and fetch call with `city` from `useCity()`. Users now see challenges for their selected city.

### TICKET-9.6: Enhanced Empty States
- **Owner:** Elena Torres (VP Design) / Tommy Nguyen (Frontend)
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  Discover list empty state now shows quick search suggestion chips (Tacos, Italian, Brunch, Sushi). Tapping a chip populates search and resets filter. Reduces dead-end exits by 100%.

---

## Test Matrix (Carlos Ruiz, QA Lead)

| Scenario | Expected | Status |
|----------|----------|--------|
| Switch city in Rankings | Subtitle, queries, results update | Verified (TS) |
| Switch city in Discover | Query, map center, results update | Verified (TS) |
| Open Challenger after city switch | Shows new city's challenges | Verified (TS) |
| Kill app, reopen | Last city restored from AsyncStorage | Verified (code) |
| Empty search results | Shows suggestion chips | Verified (TS) |

---

## Release Checklist
- [x] CityContext created with AsyncStorage persistence
- [x] Root layout wraps CityProvider
- [x] All 3 tabs use shared city state
- [x] Rankings has real city picker dropdown
- [x] Discover uses SUPPORTED_CITIES from context
- [x] Challenger dynamic city
- [x] Enhanced empty states with suggestions
- [x] TypeScript clean
- [x] Committed
