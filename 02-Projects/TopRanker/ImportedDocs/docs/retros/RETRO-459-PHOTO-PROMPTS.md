# Retro 459: Visit-Type-Aware Photo Prompts

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The visit type → photo prompt mapping is exactly the kind of small UX touch that compounds. Delivery users now see 'Photo the packaging' instead of generic tips. This makes photo verification more meaningful for the credibility engine."

**Amir Patel:** "Pure function, no side effects, no state changes. getPhotoPromptsByVisitType is trivially testable and extensible. If we add a new visit type later, it's one switch case. Good pattern."

**Nadia Kaur:** "Soft verification layer without any friction. Users don't feel surveilled — they feel guided. The prompts make them want to take better photos, which happens to also make those photos better verification signals."

## What Could Improve

- **No analytics on prompt effectiveness** — We don't yet track whether visit-type prompts increase photo upload rates. Would need before/after comparison once live.
- **PhotoTips component now unused** — The generic PhotoTips from PhotoBoostMeter.tsx is no longer rendered. Could clean up or keep as fallback.
- **No prompt for receipt section** — Receipt upload hints are still generic regardless of visit type. Delivery receipts vs dine-in receipts could have different suggestions.

## Action Items

- [ ] Begin Sprint 460 (Governance: SLT-460 + Audit #50 + Critique) — **Owner: Sarah**
- [ ] Track photo upload rate before/after prompt change — **Owner: Jasmine**
- [ ] Consider visit-type-aware receipt prompts in Sprint 462 — **Owner: Amir**

## Team Morale
**8/10** — Small, focused sprint that cleanly extends the visit type system into the photo flow. The team appreciates that this strengthens rating integrity without adding complexity.
