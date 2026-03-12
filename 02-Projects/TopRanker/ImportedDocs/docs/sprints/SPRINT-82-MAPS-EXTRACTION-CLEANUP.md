# Sprint 82 — Google Maps Extraction + Business Detail Cleanup

## Mission Alignment
Sprint 82 follows Audit #6's recommendation to extract the Google Maps and location sections from `business/[id].tsx`. Two new sub-components — `OpeningHoursCard` and `LocationCard` — move ~40 LOC and 1 `as any` cast out of the main screen into the established SubComponents pattern.

## CEO Directives
> "The audit flagged business/[id].tsx at 848 LOC. Extract what you can — the map embed, opening hours, location card. Keep using the SubComponents pattern that's worked since Sprint 61."

## Backlog Refinement
**Selected**:
- Extract OpeningHoursCard + LocationCard to SubComponents (5 pts) — **James Park**
- Remove unused styles and imports from business/[id].tsx (2 pts) — **James Park**
- Verify as-any count stability (1 pt) — **Mei Lin**

**Total**: 8 story points

## Team Discussion — Every Member Speaks

### Rahul Pitta (CEO)
"Audit-driven cleanup. business/[id].tsx drops below 820 LOC now. The `OpeningHoursCard` highlights today's hours in amber — that's a nice UX detail preserved in the extraction."

### Marcus Chen (CTO)
"The `as any` cast for the iframe style moved from business/[id].tsx to SubComponents.tsx — same count (3), different file. This is actually better: the cast is now co-located with the component that owns it."

### James Park (Frontend Architect)
"Two extractions: `OpeningHoursCard` takes the opening hours IIFE (today detection, highlight) and `LocationCard` takes the Google Maps iframe, address text, and directions button. The `Feather` import was only used in the directions button, so it's removed from business/[id].tsx."

### Jordan — Chief Value Officer
"No functional changes. Same user experience, cleaner code."

### Sage (Backend Engineer #2)
"No backend changes. Pure frontend refactoring."

### Carlos Ruiz (QA Lead)
"208 tests stable. No new tests needed — the extractions are purely structural."

### Nadia Kaur (VP Security + Legal)
"The iframe src uses hardcoded Google Maps URL pattern — no user input interpolation risk since lat/lng come from our database."

### Priya Sharma (RBAC Lead)
"No RBAC changes."

### Suki (Design Lead)
"Visual parity verified. The extracted components use slightly updated styles (14px padding vs 14px, consistent border radius)."

### Mei Lin (Type Safety Lead)
"The `as any` cast moved from line 465 of business/[id].tsx to SubComponents.tsx. This is correct — the cast belongs with the iframe component. The `Feather` unused import removal is a nice cleanup. Production cast count: 3 (stable)."

## Changes

### Modified Files
- `components/business/SubComponents.tsx` — Added `OpeningHoursCard` and `LocationCard` with styles
- `app/business/[id].tsx` — Replaced inline hours/location with extracted components, removed ~40 LOC + unused `Feather` import

## Test Results
```
208 tests | 18 test files | 537ms
TypeScript: 0 errors
as any casts: 3 (production, stable — cast moved to SubComponents)
```

## Employee Performance

| Employee | Role | Tickets Assigned | Tickets Completed | Rating |
|----------|------|-----------------|-------------------|--------|
| James Park | Frontend Architect | OpeningHoursCard + LocationCard extraction + cleanup | 2/2 (100%) | A+ |
| Mei Lin | Type Safety Lead | as-any audit verification | 1/1 (100%) | A |
| Marcus Chen | CTO | Architecture review | 1/1 (100%) | A |
| Carlos Ruiz | QA Lead | Regression verification | 1/1 (100%) | A |

## Sprint Velocity
- **Story Points Completed**: 8
- **Files Created**: 0
- **Files Modified**: 2
- **Tests**: 208 (stable)
- **TypeScript Errors**: 0
- **business/[id].tsx LOC reduction**: ~40 lines (848 → ~808)
