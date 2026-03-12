# Sprint 653: Pricing Page + Stripe Checkout Wiring

**Date:** 2026-03-11
**Points:** 5
**Focus:** Public pricing page showing all business tiers + fix Stripe checkout redirect in production

## Mission

Two pieces needed for revenue launch: (1) A marketing-oriented pricing page accessible without auth, showing Free, Dashboard Pro ($49/mo), and Featured Placement ($199/wk) with feature comparisons and FAQ. (2) The Stripe checkout redirect was missing — in production, the server returns a Stripe Checkout URL, but the client never redirected to it.

## Team Discussion

**Marcus Chen (CTO):** "This is the final sprint before we can accept money. The pricing page is the conversion funnel entry point. The Stripe redirect fix ensures production checkout actually works."

**Rachel Wei (CFO):** "The pricing page design follows SaaS best practices: three tiers, clear feature comparison, highlighted 'Most Popular' tier, FAQ addressing the #1 concern ('Does Pro affect my ranking?'). The answer is no — and we say it clearly."

**Amir Patel (Architecture):** "The pricing page is a pure client-side screen — no new server endpoints. It reads pricing from `shared/pricing.ts` for consistency. The Stripe redirect fix is 8 lines: check if `json.data.url` exists, redirect via `window.location.href` on web or `Linking.openURL` on native."

**Sarah Nakamura (Lead Eng):** "The TierCard component handles all three tiers with a highlight variant for Dashboard Pro. The `MOST POPULAR` badge draws attention. The CTA buttons route appropriately — Free to search, Pro to search (then claim flow), Featured to feedback/contact."

**Nadia Kaur (Cybersecurity):** "The pricing page is public — no auth required. No sensitive data exposed. The Stripe redirect is to Stripe's hosted checkout, so we don't handle card data directly."

**Jordan Blake (Compliance):** "The FAQ explicitly states that Pro doesn't affect rankings. This is important for trust — business owners need to know they can't buy a higher rank."

**Jasmine Taylor (Marketing):** "This page is a landing page target. We can link to `/pricing` from WhatsApp messages, social posts, and email campaigns. The three-tier layout is industry standard — removes decision paralysis."

## Changes

### `app/pricing.tsx` (NEW — 192 LOC)
- Public pricing page with three tier cards: Free, Dashboard Pro, Featured Placement
- `TierCard` component with name, price, period, feature list, highlight variant
- Dashboard Pro highlighted with `MOST POPULAR` badge + amber border
- FAQ section: cancellation policy, ranking independence, verification process
- Stripe security badge at bottom
- Responsive for web and native

### `app/business/enter-dashboard-pro.tsx` (328 → 337 LOC)
- Added Stripe Checkout redirect for production: when server returns `url`, redirect via `window.location.href` (web) or `Linking.openURL` (native)
- Added `Linking` import from react-native
- In dev mode (no URL returned), continues to show immediate confirmation

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 646.8kb (no change — client-side only)
- **pricing.tsx:** 192 LOC (new file, not tracked)
