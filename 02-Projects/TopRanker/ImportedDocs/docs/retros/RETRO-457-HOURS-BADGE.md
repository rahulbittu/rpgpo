# Retro 457: Search Card Hours Badge Enhancement

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The three-state status pill (open/closing soon/closed) is a small but meaningful UX improvement. It respects the user's time by distinguishing between 'you have hours' and 'better hurry' — that's trust-building behavior."

**Amir Patel:** "Fixing the API mapping gap was important. The server was computing and returning closingTime/nextOpenTime since Sprint 447, but the client wasn't mapping them. Now the full pipeline is connected: server computes → API returns → client maps → card displays."

**Priya Sharma:** "The isClosingSoon helper is a clean pure function. No side effects, no state dependencies. Easy to test, easy to reason about. The amber glow on the pill matches our 'warning' visual pattern."

## What Could Improve

- **60-minute threshold is hardcoded** — Should be configurable per user preference. Some users might want 30 or 90 minutes.
- **Timezone assumption** — isClosingSoon uses `new Date().getHours()` which is the device's local time. Works when user is in the same timezone as the restaurant, but breaks for cross-timezone browsing.
- **No todayHours display on card** — We added todayHours to MappedBusiness but don't yet show it on the search card. Could be a subtle subtitle under the status pill.

## Action Items

- [ ] Begin Sprint 458 (Admin enrichment bulk operations) — **Owner: Sarah**
- [ ] Consider todayHours subtitle on search card in Sprint 459 — **Owner: Priya**
- [ ] Evaluate timezone-aware closing soon in Sprint 460 — **Owner: Amir**

## Team Morale
**8/10** — Good UX-focused sprint. The closing soon badge is the kind of detail that makes users feel the app is looking out for them. Fixing the API mapping gap also resolved a subtle data pipeline issue.
