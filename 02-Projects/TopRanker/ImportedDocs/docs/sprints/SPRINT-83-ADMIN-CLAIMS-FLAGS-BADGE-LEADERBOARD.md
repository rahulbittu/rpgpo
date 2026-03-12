# Sprint 83 — Admin Claims/Flags API Wiring + Badge Leaderboard

## Mission Alignment
Sprint 83 delivers two overdue features: real API wiring for admin claims/flags review (replacing mock data) and a badge leaderboard ranking members by total badges earned. The claims/flags feature was first planned in Sprint 79 and flagged as 4 sprints overdue in the Sprint 82 retro.

## CEO Directives
> "Admin claims/flags is overdue. Wire the real APIs — Sage and Priya need to close this out. And Jordan, the badge leaderboard needs to ship this sprint."

## Backlog Refinement
**Selected**:
- Claims/flags storage module + API routes (5 pts) — **Sage + Priya**
- Wire admin panel claims/flags tabs to real endpoints (3 pts) — **Priya + James Park**
- Badge leaderboard API + screen (5 pts) — **Jordan + James Park**
- Fix pre-existing logger call errors in routes.ts (1 pt) — **Sage**
- Admin claims/flags + leaderboard tests (2 pts) — **Carlos**

**Total**: 16 story points

## Team Discussion — Every Member Speaks

### Rahul Pitta (CEO)
"This sprint closes a 5-sprint-old debt. Admin claims and flags are now real — no more mock data. And the badge leaderboard gives Jordan's reward system its first competitive surface. This is what engagement looks like."

### Marcus Chen (CTO)
"The storage barrel pattern continues to scale cleanly. `claims.ts` joins 7 other domain modules. The admin routes follow our established RBAC pattern — `isAdminEmail` check on every endpoint. Good architectural consistency."

### James Park (Frontend Architect)
"The admin panel now has real react-query hooks for claims and flags — `useQuery` for fetching, `useMutation` for review actions. Same pattern as the suggestions tab from Sprint 78. The badge leaderboard screen uses our standard layout: hero card, loading state, empty state, ranked list with medal icons for top 3."

### Jordan — Chief Value Officer
"The badge leaderboard is the first competitive surface for the badge system. Members can now see where they rank globally by badge count. Top 3 get gold-highlighted rows with medal emojis. This drives collection behavior — members will want to climb the leaderboard."

### Sage (Backend Engineer #2)
"Six storage functions in `claims.ts` — three for claims, three for flags. All use Drizzle joins for business/member names. The badge leaderboard query uses `GROUP BY` + `COUNT` + `ORDER BY DESC` — clean SQL, no N+1. Also fixed 4 pre-existing logger call errors where `log()` was called as a function instead of `log.error()`."

### Carlos Ruiz (QA Lead)
"12 new tests covering claims validation, flags validation, badge leaderboard contract, and RBAC guard verification. Total: 220 tests across 19 files, sub-550ms. All green."

### Nadia Kaur (VP Security + Legal)
"All 6 new admin endpoints require authentication and admin email verification. The RBAC pattern is consistent with the category suggestions endpoint. No new attack surface — these are admin-only operations."

### Priya Sharma (RBAC Lead)
"Admin RBAC is now consistent across all admin endpoints: category suggestions, claims, and flags. Each uses the same `isAdminEmail(req.user?.email)` guard. The mutations in the admin panel also use `useMutation` with optimistic invalidation."

### Suki (Design Lead)
"The badge leaderboard follows our established visual language — Playfair Display headers, DM Sans body, amber accent for top performers. The medal emojis for top 3 are consistent with our rank display pattern."

### Mei Lin (Type Safety Lead)
"Fixed 4 pre-existing TypeScript errors where `log()` was called as a function. The logger exports an object with `.error()`, `.info()`, etc. methods. Production cast count: 3 (stable). No new `as any` introduced."

## Changes

### New Files
- `server/storage/claims.ts` — Admin claims/flags storage (6 functions)
- `app/badge-leaderboard.tsx` — Badge leaderboard screen with ranked member list
- `tests/admin-claims-flags.test.ts` — 12 tests for claims, flags, leaderboard, RBAC

### Modified Files
- `server/storage/index.ts` — Added claims + badge leaderboard exports
- `server/storage/badges.ts` — Added `getBadgeLeaderboard` function
- `server/routes.ts` — Added 7 new routes (claims CRUD, flags CRUD, badge leaderboard) + fixed logger calls
- `lib/api.ts` — Added API client functions for claims, flags, badge leaderboard
- `app/admin/index.tsx` — Replaced mock queue with real react-query hooks for claims/flags
- `app/(tabs)/profile.tsx` — Badge count tappable → navigates to leaderboard

## Test Results
```
220 tests | 19 test files | 549ms
TypeScript: 0 new errors (3 pre-existing)
as any casts: 3 (production, stable)
```

## Employee Performance

| Employee | Role | Tickets Assigned | Tickets Completed | Rating |
|----------|------|-----------------|-------------------|--------|
| Sage | Backend Engineer #2 | Claims storage + routes + logger fix | 3/3 (100%) | A+ |
| Priya Sharma | RBAC Lead | Admin RBAC + panel wiring | 2/2 (100%) | A+ |
| Jordan | Chief Value Officer | Badge leaderboard strategy | 1/1 (100%) | A+ |
| James Park | Frontend Architect | Admin panel + leaderboard UI | 2/2 (100%) | A+ |
| Carlos Ruiz | QA Lead | 12 new tests | 1/1 (100%) | A |
| Mei Lin | Type Safety Lead | Logger call fix verification | 1/1 (100%) | A |
| Nadia Kaur | VP Security | Admin endpoint security review | 1/1 (100%) | A |
| Suki | Design Lead | Leaderboard visual review | 1/1 (100%) | A |
| Marcus Chen | CTO | Architecture review | 1/1 (100%) | A |

## Sprint Velocity
- **Story Points Completed**: 16
- **Files Created**: 3
- **Files Modified**: 6
- **Tests**: 220 (+12 from Sprint 82)
- **TypeScript Errors**: 0 new
