# Sprint 198 — Mobile Native Expo Build

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Native mobile builds are part of the product promise. While web-first is right for beta, we need the infrastructure ready so native builds can ship quickly after beta validation. This sprint sets up EAS Build, production app config, and environment management.

## Team Discussion

**Marcus Chen (CTO):** "We're not launching native for beta wave 1, but the build pipeline needs to be ready. When we get positive beta signal, I want to ship iOS TestFlight within 24 hours, not scramble to configure builds."

**Amir Patel (Architecture):** "Three build profiles — dev (simulator), preview (internal testing), production (app store). APP_ENV propagates from eas.json through to the app-env module. Clean separation."

**Sarah Nakamura (Lead Eng):** "The app.json was still pointing expo-router origin at replit.com. Fixed to topranker.com. Also added proper iOS permission descriptions and Android permissions — things that would have blocked App Store review."

**Nadia Kaur (Cybersecurity):** "Critical additions: `usesNonExemptEncryption: false` for iOS (avoids export compliance issues), credential files in .gitignore, and the Google service JSON excluded from source control."

**Jasmine Taylor (Marketing):** "The join page deep link now works on Android native too — intent filter added for /join path. When beta users share invite links, they'll work whether the recipient has the app or opens in browser."

**Rachel Wei (CFO):** "EAS Build is free tier for now. Preview builds for internal testing, production builds when we're ready for app stores. No cost until we actually submit."

**Jordan Blake (Compliance):** "Permission descriptions are user-friendly and specific: 'TopRanker uses your location to find restaurants near you.' Not generic 'this app needs location.' Apple reviews this."

## Deliverables

### EAS Build Configuration (`eas.json`)
- Development profile: dev client, iOS simulator support
- Preview profile: internal distribution, preview update channel
- Production profile: auto-increment, production channel
- Submit config for iOS (App Store Connect) and Android (Google Play internal track)

### App.json Production Updates (`app.json`)
- App name: "Top Ranker" → "TopRanker" (consistent branding)
- Origin: `replit.com` → `topranker.com` (production domain)
- Runtime version policy for OTA updates
- EAS update URL configuration
- iOS: permission descriptions (location, camera, photo library), non-exempt encryption
- Android: explicit permissions, /join deep link in intent filters, version code
- Notification plugin with brand amber color icon
- Location and image picker plugins with permission strings

### App Environment Module (`lib/app-env.ts`)
- `getAppEnvironment()` — reads EAS env or falls back to `__DEV__`
- `getApiBaseUrl()` — environment-specific API URLs
- Exports: APP_ENV, IS_PRODUCTION, IS_PREVIEW, IS_DEVELOPMENT, APP_VERSION, BUILD_NUMBER

### Build Scripts (`package.json`)
- `build:dev` / `build:preview` / `build:ios` / `build:android` / `build:all`
- `submit:ios` / `submit:android` — app store submission
- `update` — OTA updates via EAS Update

### Gitignore Updates (`.gitignore`)
- Added `google-services.json` and `GoogleService-Info.plist`

## Tests

- 48 new tests in `tests/sprint198-mobile-native.test.ts`
- Full suite: **3,382 tests across 129 files, all passing in ~2s**

### Test Coverage
1. EAS Build configuration (8 tests)
2. App.json production settings (6 tests)
3. Deep linking for join page (3 tests)
4. Build scripts (7 tests)
5. App environment module (8 tests)
6. Notification plugin config (2 tests)
7. Platform permissions (6 tests)
8. Location plugin (2 tests)
9. Image picker plugin (2 tests)
10. Gitignore native artifacts (4 tests)
