# Sprint 84 — Badge Share-by-Link + TypeScript Error Fixes

## Mission Alignment
Sprint 84 delivers badge share-by-link — a server-rendered OG meta page that enables rich social previews when users share badge links on iMessage, Twitter, Slack, etc. Also eliminates all remaining TypeScript errors (3 pre-existing) for a clean `tsc --noEmit` zero-error build.

## CEO Directives
> "The badge pipeline is now: earn → toast → persist → display → share image → share link. That's a complete viral loop. And zero TypeScript errors — this is what production-grade looks like."

## Backlog Refinement
**Selected**:
- Badge share-by-link server endpoint with OG meta (5 pts) — **Marcus + Sage**
- Copy Link button in BadgeDetailModal (3 pts) — **Suki + James Park**
- Fix pre-existing TS errors: MemberImpact type, business lat/lng (2 pts) — **Mei Lin**
- Install expo-clipboard dependency (1 pt) — **James Park**
- Badge share-link tests (2 pts) — **Carlos**

**Total**: 13 story points

## Team Discussion — Every Member Speaks

### Rahul Pitta (CEO)
"The badge viral loop is now complete. Earn a badge, share it as an image OR as a link with rich previews. The OG meta page is the missing piece — when someone pastes a TopRanker badge link in iMessage, it shows the badge name, description, and rarity with our navy/amber branding. This is how badges spread."

### Marcus Chen (CTO)
"The `/share/badge/:badgeId` route serves static HTML with OG meta tags. No React rendering on the server — just string template HTML with inline SVG for the OG image. Cache-Control is set to 1 hour for CDN friendliness. The badge metadata is a server-side lookup table (10 popular badges) — we can expand this to all 61 as needed."

### James Park (Frontend Architect)
"Added a 'Copy Link' button alongside the existing 'Share' button in BadgeDetailModal. Uses `expo-clipboard` for clipboard access. The `getBadgeShareUrl` utility constructs the full URL with optional username parameter. The two buttons sit side-by-side in a row — amber filled for Share, amber outline for Copy Link."

### Jordan — Chief Value Officer
"The share-by-link completes the badge engagement funnel. Image sharing works for direct sends, link sharing works for social platforms and forums. The OG card shows the badge with its rarity tier — this drives curiosity and FOMO. 'I want that legendary badge too.'"

### Sage (Backend Engineer #2)
"The `badge-share.ts` module is self-contained — no DB queries, no auth. It's a pure HTML generator with a badge metadata lookup. The SVG OG image uses the rarity color system for the badge ring. Response is text/html with 1-hour cache. Very lightweight."

### Carlos Ruiz (QA Lead)
"11 new tests covering URL construction, OG meta validation, rarity colors, and HTML structure. Total: 231 tests across 20 files, sub-530ms. All green."

### Nadia Kaur (VP Security + Legal)
"The badge share endpoint is public (no auth required) — intentionally so, since the whole point is social sharing. The HTML contains no user PII beyond the username (which is already public). The SVG is server-generated, no user input interpolation risk."

### Priya Sharma (RBAC Lead)
"No RBAC changes. The share endpoint is deliberately unauthenticated for social reach."

### Suki (Design Lead)
"The badge share page uses our brand colors — navy (#0D1B2A) background, amber (#C49A1A) accents, rarity-colored badge ring. The 'Copy Link' button in the modal uses the amber outline style to differentiate from the filled 'Share' button."

### Mei Lin (Type Safety Lead)
"Fixed all 3 pre-existing TypeScript errors: (1) `MemberImpact.businessesMovedToFirst` made optional to match `ApiMemberImpact`, (2) `business.lat`/`business.lng` converted to string with `String()` before passing to `LocationCard`. Zero TS errors for the first time in 5+ sprints."

## Changes

### New Files
- `server/badge-share.ts` — Server-rendered badge share page with OG meta tags + inline SVG
- `tests/badge-share-link.test.ts` — 11 tests for share URL, OG meta, rarity, HTML structure

### Modified Files
- `server/routes.ts` — Added `/share/badge/:badgeId` route + import
- `lib/badge-sharing.ts` — Added `getBadgeShareUrl()` utility
- `components/badges/BadgeDetailModal.tsx` — Added "Copy Link" button + `expo-clipboard` import
- `lib/hooks/useBadgeContext.ts` — Fixed `MemberImpact.businessesMovedToFirst` type (optional)
- `app/business/[id].tsx` — Fixed lat/lng type conversion for LocationCard
- `package.json` — Added `expo-clipboard` dependency

## Test Results
```
231 tests | 20 test files | 530ms
TypeScript: 0 errors (all pre-existing errors fixed!)
as any casts: 3 (production, stable)
```

## Employee Performance

| Employee | Role | Tickets Assigned | Tickets Completed | Rating |
|----------|------|-----------------|-------------------|--------|
| Marcus Chen | CTO | Badge share architecture + review | 1/1 (100%) | A+ |
| Sage | Backend Engineer #2 | Badge share endpoint | 1/1 (100%) | A+ |
| James Park | Frontend Architect | Copy Link button + expo-clipboard | 2/2 (100%) | A+ |
| Suki | Design Lead | Share page + button design | 1/1 (100%) | A+ |
| Mei Lin | Type Safety Lead | 3 TS error fixes — zero errors! | 1/1 (100%) | A+ |
| Carlos Ruiz | QA Lead | 11 new tests | 1/1 (100%) | A |
| Jordan | Chief Value Officer | Share viral loop strategy | 1/1 (100%) | A |
| Nadia Kaur | VP Security | Share endpoint security review | 1/1 (100%) | A |

## Sprint Velocity
- **Story Points Completed**: 13
- **Files Created**: 2
- **Files Modified**: 6
- **Tests**: 231 (+11 from Sprint 83)
- **TypeScript Errors**: 0 (down from 3!)
