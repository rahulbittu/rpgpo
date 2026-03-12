# Sprint 35 — Deep Linking & URL Handling

## Mission Alignment
Every shared link and QR code should open directly in the TopRanker app. Deep linking is the infrastructure that connects our viral growth features (Share Challenge, QR codes) to actual app engagement. Without it, shared links open in a browser — with it, they open the exact business page inside the app.

## Team Discussion

### Rahul Pitta (CEO)
"When someone shares a Challenger result on Instagram and a friend taps the link, they should land directly on that business in our app. Not a browser page, not the home screen — the exact business. This is the last mile of our viral loop."

### Marcus Chen (CTO)
"The `+native-intent.tsx` file is Expo Router's deep link handler. It maps incoming URLs to app routes. We handle three URL formats: `topranker://business/slug` (app scheme), `https://topranker.com/business/slug` (universal link), and direct path routes. The iOS `associatedDomains` and Android `intentFilters` in app.json enable native deep link interception."

### Alex Volkov (Infra Architect)
"For iOS universal links to work in production, we'll need an `apple-app-site-association` file at `https://topranker.com/.well-known/apple-app-site-association`. For Android, the `autoVerify: true` flag triggers Digital Asset Links verification. Both require the domain to be configured correctly."

### James Park (Frontend Architect)
"The redirect function handles path cleaning (strip protocol/domain), route matching (business, challenger, profile, discover), and fallback to home. It gracefully handles malformed URLs with a try-catch. The business route check excludes non-slug paths (claim, qr, enter-challenger) to avoid routing conflicts."

### Carlos Ruiz (QA Lead)
"Verified: `topranker://business/pecan-lodge` routes to `/business/pecan-lodge`. `https://topranker.com/business/uchi` routes correctly. Unknown paths fall back to home. Challenger, profile, and discover deep links all work. TypeScript clean."

## Changes
- `app/+native-intent.tsx`: Full deep link handler
  - Handles `topranker://` scheme URLs
  - Handles `https://topranker.com/` universal links
  - Routes: business (by slug), challenger, profile, discover
  - Excludes non-slug business paths (claim, qr, enter-challenger)
  - Graceful fallback to `/` for unknown paths
- `app.json`:
  - iOS: Added `associatedDomains` for universal links
  - Android: Added `intentFilters` for business URLs with `autoVerify`

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Deep link handler implementation | A |
| Marcus Chen | CTO | URL scheme architecture, Expo Router integration | A |
| Alex Volkov | Infra Architect | Universal link / Digital Asset Links spec | A |
| Carlos Ruiz | QA Lead | Deep link route testing across formats | A |

## Sprint Velocity
- **Story Points Completed**: 5
- **Files Modified**: 2
- **Lines Changed**: ~50
- **Time to Complete**: 0.5 days
- **Blockers**: Domain verification files needed for production (AASA for iOS, assetlinks for Android)

## PRD Gaps Closed
- Deep linking for QR codes and share links
- Universal links (iOS) and intent filters (Android)
