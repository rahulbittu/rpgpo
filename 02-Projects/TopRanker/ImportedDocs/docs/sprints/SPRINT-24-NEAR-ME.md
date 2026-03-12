# Sprint 24 — Near Me Filter

## Mission Alignment
"When I open DoorDash, I immediately see what's near me." — Rahul Pitta, CEO. Location-aware discovery is table stakes for any food platform. The Near Me filter surfaces the closest businesses first, turning TopRanker from a static leaderboard into a contextual, "what's near me right now" experience.

## Team Discussion

### Rahul Pitta (CEO)
"This is the feature I've been asking for since day one. When someone's walking around Deep Ellum at 8pm, they don't want to see the #1 restaurant in Far North Dallas. They want the best place within walking distance. Near Me changes how people use TopRanker — from 'research at home' to 'discover on the go.'"

### Marcus Chen (CTO)
"Zero extra API calls — the Haversine distance calculation runs entirely client-side using the lat/lng already on each business object. Location permission is requested only when the user taps 'Near Me,' not on app launch. Battery-friendly: we use `Accuracy.Balanced` instead of `Accuracy.Highest`."

### David Okonkwo (VP Product)
"Near Me was one of the top PRD gaps. Combined with our existing Open Now filter, users can now find 'what's open near me' — that's the DoorDash moment Rahul keeps referencing. This moves us from a 'ranking research tool' to a 'dining decision tool.'"

### Elena Torres (VP Design)
"The Near Me chip gets a special navigate icon to distinguish it from text-only filters. Distance displays in the card metadata row: '0.3km' or '2.1km' in amber — the color draws the eye to the most relevant data point. Under 1km shows meters for precision."

### James Park (Frontend Architect)
"Used `expo-location` (already in package.json) for foreground location. The Haversine formula gives great-circle distance — accurate enough for city-scale proximity. The filter sorts by distance ascending, so closest businesses appear first. Price filter still applies on top of Near Me."

### Mei Lin (Mobile Architect)
"Location permission uses the iOS/Android native dialog. We request `foregroundPermissions` only — no background tracking. The location is stored in component state (not persisted), so it refreshes each session. Performance: sorting 50 items by distance is sub-millisecond."

### Nadia Kaur (Cybersecurity Lead)
"Good privacy hygiene: location is never sent to our servers, never persisted to storage. It lives only in React state for the duration of the session. The permission prompt clearly states 'while using the app.' No background location tracking — that's a privacy red flag we avoid."

### Carlos Ruiz (QA Lead)
"Verified: Tapping 'Near Me' triggers location permission dialog. Once granted, businesses re-sort by distance. Distance labels appear on each card (e.g., '0.8km'). Switching to another filter clears distance display. TypeScript clean. No new warnings."

### Aisha Fernandez (Community Manager)
"This is perfect for our 'Dallas Foodie Walk' social content series. We can create neighborhood guides: 'Top 5 within 1km of Deep Ellum.' The Near Me data helps users discover hidden gems in their own backyard."

## Changes
- `app/(tabs)/search.tsx`:
  - Added `expo-location` import
  - Added `haversineKm()` utility function for great-circle distance calculation
  - Added "Near Me" to `FilterType` union and `FILTERS` array
  - Added `userLocation` and `locationLoading` state
  - Added `requestLocation()` callback — triggers on Near Me tap
  - Filter logic: sorts by distance ascending when Near Me active
  - BusinessCard accepts optional `distanceKm` prop
  - Distance display: amber text with navigate icon (meters <1km, km otherwise)
  - Near Me chip gets navigate-outline icon prefix
  - Shows "Locating..." while acquiring GPS
- Styles: `cardDistance`

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Haversine formula, filter integration, distance display | A+ |
| Mei Lin | Mobile Architect | expo-location integration, permission flow, battery optimization | A |
| Elena Torres | VP Design | Distance display design, navigate icon, amber color choice | A |
| Nadia Kaur | Cybersecurity Lead | Privacy review — no server-side location, session-only state | A |
| Carlos Ruiz | QA Lead | Permission dialog testing, distance accuracy, filter switching | A |
| Tommy Nguyen | Frontend | Filter chip icon integration | B+ |
| Aisha Fernandez | Community Manager | Neighborhood guide content strategy | A- |
| David Okonkwo | VP Product | PRD gap closure verification | A |

## Sprint Velocity
- **Story Points Completed**: 8
- **Files Modified**: 1
- **Lines Changed**: ~50
- **Time to Complete**: 0.5 days
- **Blockers**: None (expo-location already installed)

## PRD Gaps Closed
- Near Me filter using device location (distance-sorted results with km/m display)
