# Sprint 7: Infrastructure, Visual Testing & Photo Proxy (v1.7-Infra)

**Sprint Goal:** Add auto-deploy webhook, visual regression testing, Google Places photo proxy, and comprehensive error detection.

**Status:** Complete
**Target Tag:** `v1.7-Infra`

---

## Tickets

### TICKET-7.1: GitHub Webhook Auto-Deploy
- **Priority:** P0 (Infrastructure)
- **Files Created:**
  - `server/deploy.ts`
- **Files Modified:**
  - `server/routes.ts`
- **Description:**
  Added `POST /api/webhook/deploy` endpoint that GitHub calls on push to `main`. Runs git pull, npm install, Expo static build, and server build in sequence. Includes GitHub webhook signature verification (optional), deploy-in-progress guard, and push notifications via ntfy.sh. Status endpoint at `GET /api/deploy/status` returns current deploy state.

### TICKET-7.2: Visual Regression Testing with Playwright
- **Priority:** P0 (Testing)
- **Files Created:**
  - `scripts/visual-test.mjs`
- **Description:**
  Comprehensive visual testing script using Playwright headless Chromium. Screenshots every page and state: home, discover (list/map), all filters, price filters, search, business profile, challenger, profile, city picker. Captures all network errors (500s, 404s), console errors, and Google Maps specific errors. Generates a full report with deduplicated error patterns.

### TICKET-7.3: Google Places Photo Proxy
- **Priority:** P0 (Bug Fix)
- **Files Created:**
  - `server/photos.ts`
- **Files Modified:**
  - `server/routes.ts`
- **Description:**
  Added `GET /api/photos/proxy?ref=...` endpoint to proxy Google Places photo references. Photo URLs in the database are stored as `/api/photos/proxy?ref=places/ChIJ.../photos/ATCDNf...` which require a server-side API key. The proxy fetches from Google Places API v1 media endpoint with fallback to legacy Places Photo API. Includes 24-hour cache headers, timeout protection, and proper error handling. Fixes 207 photo 404 errors found during visual testing.

### TICKET-7.4: Google Maps Auth Error Detection
- **Priority:** P1 (UX)
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  Added `gm_authFailure` window callback to detect Google Maps API key rejection (RefererNotAllowedMapError, InvalidKeyMapError). Shows actionable error message guiding user to fix API key restrictions in Google Cloud Console. Previously the map showed Google's generic "Oops! Something went wrong" with no guidance.

---

## Visual Test Results (Pre-fix baseline)

### Issues Found:
1. **Google Maps: RefererNotAllowedMapError** — API key has HTTP referrer restrictions blocking Replit domain. Fix: Add `*.replit.dev/*` to allowed referrers in Google Cloud Console.
2. **Photos: 207 x 404 errors** — `/api/photos/proxy` endpoint didn't exist. Fix: TICKET-7.3.
3. **Fonts: 86 x 500 errors** — Metro dev server serving font assets with intermittent 500 status codes. Known Metro behavior under load; fonts render correctly on retry.

### Pages Tested:
- Home / Rankings (Dallas, Austin)
- Discover List (all filters, price filters, search)
- Discover Map (pin interaction)
- Business Profile (top, mid, bottom scroll)
- Challenger Tab
- Profile (logged out)
- City Picker

---

## Release Checklist
- [x] All 4 tickets implemented
- [x] No TypeScript errors
- [x] Visual test script operational
- [ ] Photo proxy verified on Replit (needs API key in env)
- [ ] Map referrer restriction fixed in Google Cloud Console
- [ ] Git tag: `v1.7-Infra`
