# Retro 481: Push Notification Triggers

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 4
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Clean trigger pattern — each function follows: query affected users → check preferences → send push → log. Consistent with existing onTierUpgrade and onClaimDecision patterns."

**Amir Patel:** "Significance thresholds (delta >= 2) on both onRankingChange and sendCityHighlightsPush prevent notification spam. Users only get alerted for meaningful changes."

**Jasmine Taylor:** "City Highlights push is the most impactful notification for our marketing strategy. 'Best biryani in Irving just changed' drives exactly the controversy-based engagement we want."

## What Could Improve

- **notification-triggers.ts is now ~310 LOC** — Getting large. Could extract the 3 new triggers to a separate module (e.g., `notification-triggers-v2.ts` or split by category).
- **No integration with rating submission flow yet** — onNewRatingForBusiness is exported but not called from POST /api/ratings. Need to wire it up.
- **No integration with rank recalculation** — onRankingChange is exported but not called from the rank computation pipeline. Need to wire it up.
- **sendCityHighlightsPush not scheduled yet** — Function exists but not added to the weekly scheduler. Should integrate with startWeeklyDigestScheduler.

## Action Items

- [ ] Sprint 482: Dashboard chart components — **Owner: Sarah**
- [ ] Sprint 483: Infinite scroll for search — **Owner: Sarah**
- [ ] Future: Wire onNewRatingForBusiness into POST /api/ratings — **Owner: TBD**
- [ ] Future: Wire onRankingChange into rank recalculation — **Owner: TBD**
- [ ] Future: Add sendCityHighlightsPush to weekly scheduler — **Owner: TBD**

## Team Morale
**8/10** — Solid infrastructure sprint. The preference→delivery pipeline is complete. Wiring up the triggers to actual events is the remaining gap.
