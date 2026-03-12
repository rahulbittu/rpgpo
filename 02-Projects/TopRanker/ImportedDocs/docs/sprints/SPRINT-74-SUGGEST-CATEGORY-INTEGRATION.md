# Sprint 74 — Suggest Category Integration + API Wiring + sortBy Fix

## Mission Alignment
Sprint 74 connects the user-facing SuggestCategory UI to the backend API, making the full suggestion pipeline live. The leaderboard now has a "Suggest" chip that opens a modal form. Plus, the sortBy `as any` cast is eliminated — production casts now at 3.

## CEO Directives
> "I want users to feel ownership over what categories exist. That 'Suggest' button on the leaderboard isn't a feature — it's a philosophy. We grow because our users tell us what they need."

## Backlog Refinement
**Selected**:
- Wire SuggestCategory to leaderboard + API (5 pts) — **James Park**
- Category suggestion validation tests (3 pts) — **Carlos Ruiz**
- sortBy `as any` elimination (1 pt) — **Mei Lin**
- API client functions (submitCategorySuggestion, fetchCategorySuggestions) (2 pts) — **James Park**

**Total**: 11 story points

## Team Discussion — Every Member Speaks

### Rahul Pitta (CEO)
"The 'Suggest' chip sits right after the category chips on the leaderboard. Dashed amber border — it's inviting, not intrusive. Tap it, modal slides up, fill in name/description/vertical, submit. That hits our backend, validates through Zod, and stores in category_suggestions. When enough users suggest the same thing, we know what to build next."

### Marcus Chen (CTO)
"The API wiring is clean: `submitCategorySuggestion()` posts to `/api/category-suggestions`, handles errors gracefully, and the modal dismisses on success. The `fetchCategorySuggestions()` function is ready for when we build the admin panel to review pending suggestions."

### James Park (Frontend Architect)
"Added the Suggest chip to the horizontal ScrollView in index.tsx. It's always the last chip — a dashed border differentiates it from regular category chips. The Modal uses `animationType='slide'` with a transparent overlay. The SuggestCategory component's onSubmit callback calls the API, and onClose dismisses the modal."

### Jordan — Chief Value Officer
"This completes the suggestion loop. Users see categories, rate businesses within them, and now they can propose new ones. The voteCount field means popular suggestions surface to the top for admin review. It's democratic category expansion."

### Mei Lin (Type Safety Lead)
"Fixed the sortBy cast in search.tsx. The `as const` tuple already provides the correct literal type for `key`, so `setSortBy(key)` works without any cast. Production `as any` is now at 3: iframe style, cardRef, mapRef. All three are genuine web/native bridge limitations."

### Sage (Backend Engineer #2)
"The POST endpoint validates through `insertCategorySuggestionSchema` — Zod ensures name (2-50 chars), description (10-200 chars), and vertical (one of 5 values). Auth required. The GET endpoint returns pending suggestions sorted by vote count."

### Carlos Ruiz (QA Lead)
"11 new validation tests for category suggestions. Edge cases: empty name, 1-char name, 2-char name (min), description under/at 10 chars, name/description over max, all valid verticals, invalid vertical, missing required fields. 170 tests total across 13 files now."

### Nadia Kaur (VP Security + Legal)
"Category suggestion submission requires authentication. The Zod schema prevents injection through strict length limits and enum validation. The modal form has client-side maxLength enforcement as well — defense in depth."

### Priya Sharma (RBAC Lead)
"POST requires auth, GET is public. Admin review is in storage but not routed yet — that's intentional for the admin panel sprint."

### Suki (Design Lead)
"The Suggest chip uses a dashed amber border — visually distinct from solid category chips. It says 'this is different, tap me.' The modal overlay darkens the background to focus attention on the form."

## Changes

### New Files
- `tests/category-api.test.ts` — 11 suggestion validation tests

### Modified Files
- `app/(tabs)/index.tsx` — Added Suggest chip + modal integration
- `app/(tabs)/search.tsx` — Removed sortBy `as any` cast
- `lib/api.ts` — Added `submitCategorySuggestion` and `fetchCategorySuggestions`

## `as any` Cast Progress
| Audit | Count | Change |
|-------|-------|--------|
| Audit #4 (S70) | 43 | — |
| Post-TypedIcon (S70) | 27 | -16 |
| Post-pct() (S71) | 17 | -10 |
| Post-SafeImage (S72) | 7 | -10 |
| Post-GMaps decl (S73) | 4 | -3 |
| Post-sortBy (S74) | 3 | -1 |

**Total elimination: 43 -> 3 production casts (93% reduction in 5 sprints)**

## Test Results
```
170 tests | 13 test files | 388ms
TypeScript: 0 errors
as any casts: 3 (production)
```

## Employee Performance

| Employee | Role | Tickets Assigned | Tickets Completed | Rating |
|----------|------|-----------------|-------------------|--------|
| James Park | Frontend Architect | SuggestCategory integration + API | 2/2 (100%) | A+ |
| Carlos Ruiz | QA Lead | Validation tests | 1/1 (100%) | A+ |
| Mei Lin | Type Safety Lead | sortBy cast fix | 1/1 (100%) | A |
| Jordan (CVO) | Chief Value Officer | Suggestion strategy review | 1/1 (100%) | A |
| Sage | Backend Engineer #2 | API review | 1/1 (100%) | A |
| Marcus Chen | CTO | Architecture review | 1/1 (100%) | A |
| Suki | Design Lead | Suggest chip design | 1/1 (100%) | A |
| Nadia Kaur | VP Security/Legal | Security review | 1/1 (100%) | A |
| Priya Sharma | RBAC Lead | Auth review | 1/1 (100%) | A |

## Sprint Velocity
- **Story Points Completed**: 11
- **Files Modified**: 3
- **Files Created**: 1 (category-api.test.ts)
- **`as any` Casts Eliminated**: 1 (4 -> 3 production)
- **Tests**: 170 (+11 new)
- **TypeScript Errors**: 0
