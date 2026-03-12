# Sprint 134: Test Coverage, Admin Thresholds & Critical Bugfixes

**Date:** 2026-03-08
**Story Points:** 8
**Sprint Goal:** Close accumulated test coverage gaps (Sprints 127-133), fix two critical user-reported bugs, and ship a read-only admin endpoint for confidence threshold configuration.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** We've been accumulating test debt for seven sprints now. Every retro since 129 has flagged it. This sprint, we batch-close all of it — 47 new tests covering NetworkBanner, mapApiRating, category display mapping, mapApiBusiness, tier/confidence labels, banner state logic, and the new admin thresholds endpoint. The strategy is to write tests that mirror the exact data shapes our components consume so we catch mapping regressions before they hit production. I also want to formally document TD-013 for the pagination risk on the "Your Previous Rating" card — that's been an open action item since RETRO-129.

**Marcus Chen (CTO):** The admin confidence-thresholds endpoint is intentionally read-only for now. GET /api/admin/confidence-thresholds returns all category threshold configs plus defaults. Architecture-wise, it reads directly from the exported CATEGORY_CONFIDENCE_THRESHOLDS in lib/data.ts — no database layer yet. The PUT endpoint for dynamic tuning is Sprint 136 scope. We want the admin UI team to have something to build against immediately, and a read-only endpoint is zero-risk to ship.

**Amir Patel (Architecture):** The Google Maps CSP issue is embarrassing — we integrated Maps back in Sprint 82 and never updated the Content-Security-Policy to allow maps.googleapis.com and maps.gstatic.com in script-src. The fix is straightforward: add both domains to script-src and connect-src in server/security-headers.ts. But the deeper lesson is that CSP should be part of every integration checklist. Any time we add an external service, the PR should include a CSP diff or an explicit "no CSP change needed" note.

**Elena Rodriguez (Design):** The false "No internet connection" banner was a terrible UX failure. Users on perfectly good connections were seeing a persistent red banner telling them they were offline. That erodes trust — which is literally our product. The root cause was a fetch to clients3.google.com/generate_204 that was failing due to CORS in Expo dev. The fix removes that external ping entirely and relies on the browser-native navigator.onLine API plus online/offline event listeners. Simpler, more reliable, no false positives.

**Priya Sharma (Frontend):** I want to flag that navigator.onLine is not perfect — it only tells you if the device has a network interface, not whether there's actual internet connectivity. On desktop browsers it's reliable enough, but on mobile it can lag. For native builds, we should investigate @react-native-community/netinfo which gives us actual reachability checks. I'm putting that on the Sprint 136 backlog. For now, the browser-native approach is a massive improvement over the CORS-failing external fetch.

**Liam O'Brien (Analytics):** From a deployment confidence perspective, going from 1230 to 1277 tests is significant. More importantly, the tests we added cover trust-critical surfaces — the rating mapper, confidence labels, tier influence labels, and the banner state decision tree. These are the exact areas where a silent regression would damage user trust without throwing an error. Test coverage on these paths means we can deploy with confidence and catch data-shape changes before they ship.

**Nadia Kaur (Cybersecurity):** On the CSP changes — adding maps.googleapis.com and maps.gstatic.com to script-src is necessary but it does expand our attack surface. Both are Google-controlled domains with strong security posture, so the risk is low. I've verified the CSP still blocks inline scripts, eval, and all non-whitelisted domains. The connect-src addition is also required for the Maps JavaScript API to fetch tile data. Going forward, I'm adding a CSP review step to the PR checklist for any external service integration — that's my action item for Sprint 135.

---

## Changes

### 1. CRITICAL FIX: False "No internet connection" banner
- **File:** `components/NetworkBanner.tsx`
- **Problem:** External URL ping to `clients3.google.com/generate_204` caused CORS failures in Expo dev, triggering false offline detection. Users on working connections saw a persistent red "No internet connection" banner.
- **Fix:** Removed external URL ping entirely. Now uses browser-native `navigator.onLine` property plus `online`/`offline` event listeners. No external fetches, no CORS issues, no false positives.

### 2. CRITICAL FIX: Google Maps not loading
- **File:** `server/security-headers.ts`
- **Problem:** Content-Security-Policy was blocking `maps.googleapis.com` and `maps.gstatic.com` in `script-src`, preventing the Google Maps JavaScript API from loading.
- **Fix:** Added both domains to `script-src` and `connect-src` directives.

### 3. 47 new tests (1230 -> 1277)
- **Files:** `tests/sprint134-trust-surfaces.test.ts` (new), `tests/sprint134-admin-thresholds.test.ts` (new)
- Closed test gaps accumulated from Sprints 127-133:
  - NetworkBanner mock data tracking (4 tests)
  - mapApiRating memberId + defaults (9 tests)
  - Category display mapping roundtrip (5 tests)
  - mapApiBusiness photo resolution + Google Places proxy (7 tests)
  - TIER_INFLUENCE_LABELS completeness (4 tests)
  - RANK_CONFIDENCE_LABELS completeness (4 tests)
  - Banner state decision tree (6 tests)
  - Admin confidence thresholds (8 tests)

### 4. GET /api/admin/confidence-thresholds
- **File:** `server/routes-admin.ts`
- Read-only admin endpoint returning all category threshold configs + defaults
- Enables future admin UI for dynamic threshold tuning (PUT endpoint planned for Sprint 136)

### 5. TECH-DEBT.md TD-013
- **File:** `docs/TECH-DEBT.md`
- Documented pagination risk for "Your Previous Rating" card
- From RETRO-129 action item, owner: Sarah Nakamura

### 6. Exported CATEGORY_CONFIDENCE_THRESHOLDS
- **File:** `lib/data.ts`
- Exported the constant for server-side use by the admin endpoint

---

## Files Changed
| File | Change |
|------|--------|
| `components/NetworkBanner.tsx` | Replaced external URL ping with navigator.onLine + event listeners |
| `server/security-headers.ts` | Added maps.googleapis.com and maps.gstatic.com to CSP script-src and connect-src |
| `lib/data.ts` | Exported CATEGORY_CONFIDENCE_THRESHOLDS |
| `server/routes-admin.ts` | Added GET /api/admin/confidence-thresholds endpoint |
| `docs/TECH-DEBT.md` | Added TD-013 pagination risk for Previous Rating card |
| `tests/sprint134-trust-surfaces.test.ts` | NEW — 39 tests for trust-critical surfaces |
| `tests/sprint134-admin-thresholds.test.ts` | NEW — 8 tests for admin confidence thresholds endpoint |

---

## PRD Gap Impact
- Test coverage strategy now catches trust-surface regressions before deployment
- Admin threshold endpoint lays groundwork for dynamic category tuning (PRD Section 4.2)
- CSP fix restores Google Maps integration to full functionality
