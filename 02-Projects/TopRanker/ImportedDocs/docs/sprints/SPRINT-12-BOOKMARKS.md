# Sprint 12: Bookmarks / Save Places (v1.12-Bookmarks)

**Sprint Goal:** Let users save businesses they love. Local-first with AsyncStorage, per-user isolation.

**Status:** Complete
**Tag:** `v1.12-Bookmarks`

---

## Architecture Council Discussion

**David Okonkwo (VP Product):** Bookmarks are table stakes. Users find a great restaurant, want to remember it for Friday night. Without save, we lose that engagement. Yelp, Google Maps, TripAdvisor — all have it. We need it.

**Marcus Chen (CTO):** The question is: server-side or client-side? Server gives us cross-device sync. Client gives us speed and offline.

**Priya Sharma (Backend Arch):** We'd need a `bookmarks` table — memberId, businessId, createdAt. But modifying the DB schema mid-sprint without full server access is risky. Let's go local-first.

**James Park (Frontend Arch):** AsyncStorage with React Context. Same proven pattern as CityContext. Per-user storage key so bookmarks don't bleed across accounts. When we add the server endpoint later, we sync.

**Mei Lin (Mobile Arch):** Local-first is the right call. Users get instant response, no network latency on save. The optimistic UX is actually BETTER than server-first.

**Elena Torres (VP Design):** Bookmark icon in the business profile nav bar — filled when saved, outline when not. Gold color for saved state to match our brand. Haptic feedback on tap.

**Carlos Ruiz (QA Lead):** Test: bookmark, close app, reopen — bookmark persists. Switch user — bookmarks are separate. Unbookmark — removes from set.

**Alex Volkov (Infra Arch):** AsyncStorage has a 6MB limit on Android. Even 10,000 bookmarks is well under 100KB. No capacity concern.

**Nina Petrov (DevOps):** No server changes. Pure client deploy.

---

## Tickets

### TICKET-12.1: BookmarksContext Provider
- **Owner:** James Park (Frontend Arch)
- **Files Created:**
  - `lib/bookmarks-context.tsx`
- **Description:**
  React Context + AsyncStorage. Per-user storage key (`topranker_bookmarks_{userId}`). Exposes `isBookmarked(id)`, `toggleBookmark(id)`, `bookmarkCount`. Set-based for O(1) lookup. Persists on every toggle.

### TICKET-12.2: Root Layout Integration
- **Owner:** Ryan Mitchell (Sr Frontend)
- **Files Modified:**
  - `app/_layout.tsx`
- **Description:**
  Wrapped app in `<BookmarksProvider>` inside CityProvider. All routes have access to bookmarks.

### TICKET-12.3: Business Profile — Bookmark Button
- **Owner:** Tommy Nguyen (Frontend)
- **Files Modified:**
  - `app/business/[id].tsx`
- **Description:**
  Added bookmark icon to nav bar (next to share button). Uses `useBookmarks()` hook. Filled gold bookmark when saved, outline white when not. Haptic feedback on toggle. New `navBtnGroup` style for button row layout.

---

## Future Work (Sprint 13+)

- **Server sync:** POST /api/bookmarks endpoint, bidirectional sync on login
- **Saved tab:** View all bookmarked businesses in Profile or dedicated tab
- **Bookmark from cards:** Quick-save from Rankings/Discover without opening profile
- **Collections:** Group bookmarks into lists ("Date Night", "Business Lunch")

---

## Release Checklist
- [x] BookmarksContext with AsyncStorage persistence
- [x] Per-user storage isolation
- [x] Root layout wraps BookmarksProvider
- [x] Business profile bookmark button
- [x] Haptic feedback on toggle
- [x] TypeScript clean
