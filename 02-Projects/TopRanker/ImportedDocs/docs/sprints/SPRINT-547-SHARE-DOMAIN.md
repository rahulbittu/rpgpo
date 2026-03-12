# Sprint 547: Share Domain Alignment — topranker.app → topranker.com

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 18 new (10,251 total across 436 files)

## Mission

Align all share URLs from `topranker.app` to `topranker.com` to match app.json deeplink configuration. This mismatch was flagged in SLT-540 and SLT-545 as critical for WhatsApp campaign launch — shared links wouldn't trigger in-app deeplinks.

## Team Discussion

**Marcus Chen (CTO):** "This has been on the radar since SLT-540. WhatsApp shares generating topranker.app URLs that don't match our topranker.com deeplinks means zero in-app conversion from shared links. This is a launch blocker that needed to be resolved before any external sharing campaign."

**Jasmine Taylor (Marketing):** "Every WhatsApp share we've been testing internally has been generating broken deeplinks. Users click the link and get a web browser instead of the app opening. This completely breaks the viral loop — the whole point of WhatsApp sharing is frictionless app entry."

**Amir Patel (Architecture):** "The fix is straightforward — 4 files, consistent domain swap. The deeplink parser now accepts both topranker.com (primary) and topranker.app (legacy) for backwards compatibility, so any old links that were shared before this fix will still work."

**Sarah Nakamura (Lead Eng):** "The test suite now enforces that production code uses topranker.com exclusively. The only allowed topranker.app references are in comments (migration notes) and the deeplink parser's legacy fallback. This prevents domain drift in future sprints."

## Changes

### Client — Sharing Utility (`lib/sharing.ts`, 116→118 LOC)
- `SHARE_DOMAINS` changed from `["topranker.app", "www.topranker.app"]` → `["topranker.com", "www.topranker.com"]`
- `getShareUrl()` generates `https://topranker.com/...` URLs
- `getShareText()` uses `https://topranker.com` fallback
- `getDeepLinkParams()` accepts both `topranker.com` (primary) and `topranker.app` (legacy)

### Client — SharePreviewCard (`components/business/SharePreviewCard.tsx`)
- Domain display changed from `topranker.app` → `topranker.com`

### Client — RatingConfirmation (`components/rate/RatingConfirmation.tsx`)
- Share fallback URL changed from `https://topranker.app` → `https://topranker.com`

### Test Threshold Redirections
- `sprint118-i18n-sharing.test.ts` — domain assertions: topranker.app → topranker.com (3 tests)
- `sprint378-share-preview.test.ts` — domain label: topranker.app → topranker.com (1 test)

## Test Summary

- `__tests__/sprint547-share-domain.test.ts` — 18 tests
  - Sharing utility: 8 tests (SHARE_DOMAINS, no .app primary, getShareUrl, getShareText, deeplink .com, deeplink legacy .app, Sprint 547 ref)
  - SharePreviewCard: 2 tests (displays .com, no .app)
  - RatingConfirmation: 2 tests (uses .com, no .app)
  - app.json consistency: 3 tests (iOS associatedDomains, Android intentFilters, no .app in iOS config)
  - Production code audit: 3 tests (sharing.ts .app only in comments/parser, SharePreviewCard clean, RatingConfirmation clean)
