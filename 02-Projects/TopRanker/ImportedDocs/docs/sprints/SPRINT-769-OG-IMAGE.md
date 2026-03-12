# Sprint 769 — OG Image + Social Sharing Meta

**Date:** 2026-03-12
**Theme:** Create branded OG image and fix social sharing URLs
**Story Points:** 2 (P1 — marketing/sharing)

---

## Mission Alignment

- **WhatsApp-first marketing (Marketing Strategy):** When users share topranker.io links in WhatsApp groups, the preview card needs to look professional with the brand image, not show a broken image icon.
- **Brand consistency (Constitution #14):** All social sharing URLs were pointing to topranker.com instead of topranker.io.

---

## Changes

1. **Created OG image** (1200x630px) with navy gradient background, amber accent, TopRanker branding, and "Best In" tagline
2. **Updated meta tags** in `app/+html.tsx` from `topranker.com` to `topranker.io`
3. **Fixed image path** from `/assets/images/og-image.png` to `/og-image.png` (served from `public/`)

---

## Team Discussion

**Jasmine Taylor (Marketing):** "This is critical for Phase 1. When I share topranker.io in the Irving WhatsApp groups, the preview card IS the first impression. A broken image would kill credibility."

**Sarah Nakamura (Lead Eng):** "The image is generated with sharp, so we can regenerate it programmatically if the brand evolves. No manual Photoshop dependency."

**Marcus Chen (CTO):** "Every touchpoint matters. The OG card is often the first thing someone sees before they even visit the site."

---

## Tests

- **New:** 8 tests in `__tests__/sprint769-og-image.test.ts`
- **Total:** 13,182 tests across 576 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.4kb / 750kb (88.7%) |
| Tests | 13,182 / 576 files |
| topranker.io | LIVE |
