# Sprint 213 — Settings Feedback Link + About/Marketing Page

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

## Mission Alignment

Make feedback discoverable and create a marketing landing page within the app. The feedback link in settings ensures every beta user can find the form. The about page serves double duty: marketing for web visitors and feature overview for app users.

## Team Discussion

**Leo Hernandez (Frontend):** "Two additions: feedback link in settings under a new 'HELP & FEEDBACK' section, and the /about page with full marketing content — hero, features, how it works, CTA. Consistent brand language throughout."

**Marcus Chen (CTO):** "The about page is our marketing page for now. It works on web via Expo Router, so anyone hitting topranker.com/about gets the pitch. Later we can build a dedicated marketing site."

**Jasmine Taylor (Marketing):** "Four features highlighted: trust-weighted rankings, credibility tiers, challenger battles, trust network. The 4-step 'how it works' is the conversion narrative — rate → build credibility → grow influence → discover."

**Sarah Nakamura (Lead Eng):** "Simple router.push('/feedback') from settings. No deep linking complexity — just a direct navigation row in the existing settings card layout."

## Deliverables

### Settings Feedback Link (`app/settings.tsx`)
- New "HELP & FEEDBACK" section
- "Send Feedback" NavigationRow → `/feedback`

### About/Marketing Page (`app/about.tsx`)
- Hero: "Rankings You Can Trust" with trust narrative
- Features: 4 cards with icons and descriptions
- How It Works: 4-step numbered guide
- CTA: "Get Started" → signup
- Trust message footer

## Tests

- 24 new tests in `tests/sprint213-settings-link-about.test.ts`
- Full suite: **3,789+ tests across 143 files, all passing**
