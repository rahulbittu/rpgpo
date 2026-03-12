# Sprint 611: MapBusinessCard Rate CTA + Analytics Events

**Date:** 2026-03-11
**Story Points:** 2
**Owner:** Priya Sharma
**Status:** Done

## Mission

Extend the "Rate this" CTA pattern from Sprint 609 to MapBusinessCard (map view), and add analytics event tracking for rate CTA taps and WhatsApp share taps across all surfaces.

## Team Discussion

**Priya Sharma (Engineering):** "The map card rate CTA is a star icon button — more compact than the full 'Rate this' text button on BusinessCard because map cards are tighter. Both surfaces now fire `rate_cta_discover_tap` with a surface property ('card' or 'map_card') so we can compare tap rates."

**Jasmine Taylor (Marketing):** "The WhatsApp share analytics (`share_whatsapp_tap`) are critical for measuring Sprint 608's impact. We can track how many users tap the WhatsApp button on the confirmation screen. If the tap rate is >10% of rating completions, the share prompt is working."

**Marcus Chen (CTO):** "Two new analytics events added to the typed event system: `rate_cta_discover_tap` and `share_whatsapp_tap`. Both have context properties so we can slice by surface. This is the instrumentation layer we needed."

**Amir Patel (Architecture):** "The analytics module grew by 10 lines — two event types, two convenience functions. Clean additions that follow the existing pattern. analytics.ts is still well under any capacity concern at ~295 LOC."

## Changes

### Modified: `lib/analytics.ts` (+10 LOC)
- Added `rate_cta_discover_tap` event type
- Added `share_whatsapp_tap` event type
- Added `Analytics.rateCtaDiscoverTap(slug, surface)` convenience function
- Added `Analytics.shareWhatsAppTap(slug, context)` convenience function

### Modified: `components/search/SubComponents.tsx` (+15 LOC)
- Added `import { Analytics }` from analytics
- BusinessCard rate CTA: fires `Analytics.rateCtaDiscoverTap(item.slug, "card")`
- MapBusinessCard: added star-outline rate button in `mapCardRight`
  - Fires `Analytics.rateCtaDiscoverTap(item.slug, "map_card")`
  - Navigates to `/rate/[id]`
- Added `mapCardActions`, `mapRateBtn` styles

### Modified: `components/rate/RatingConfirmation.tsx` (+2 LOC)
- Added `import { Analytics }` from analytics
- WhatsApp share button: fires `Analytics.shareWhatsAppTap(businessSlug, "confirmation")`

## Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| analytics.ts LOC | 284 | 294 | +10 |
| SubComponents.tsx LOC | 445 | 460 | +15 |
| RatingConfirmation LOC | 449 | 451 | +2 |
| Tests | 11,327 | 11,327 | 0 |
| Server Build | 730.0kb | 730.0kb | 0 |
