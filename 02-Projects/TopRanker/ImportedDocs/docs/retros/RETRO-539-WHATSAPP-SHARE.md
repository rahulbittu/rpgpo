# Retro 539: WhatsApp Share Deeplinks — "Best In" Format Sharing

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "WhatsApp sharing is now live across all three share surfaces: business action bar, dish leaderboard hero, and individual entry cards. The 'Best In' controversy format is exactly what the marketing strategy called for."

**Jasmine Taylor:** "The share text formats are optimized for WhatsApp group dynamics. #1 rankings get 'Agree or disagree?' which invites pushback. Lower-ranked businesses get 'Think they should be higher?' which invites action. Both drive engagement."

**Sarah Nakamura:** "Clean integration — three new utility functions, no new dependencies. wa.me universal links work cross-platform without conditional logic. The whatsapp:// fallback is there but rarely needed."

**Amir Patel:** "Good design decision replacing 'Copy Link' with 'WhatsApp' on BusinessActionBar. WhatsApp is higher-intent sharing for our target demographic. Copy Link was the least-used action."

## What Could Improve

- **No share analytics yet for WhatsApp** — We track 'whatsapp' as the method, but can't verify actual delivery or conversion. Need UTM tracking or short links.
- **Share domain mismatch** — `getShareUrl` uses `topranker.app` but app.json configures deeplinks for `topranker.com`. Should align to prevent broken universal links.
- **No WhatsApp preview image** — OG tags exist on web but WhatsApp may not render in-app previews correctly. Need to test with actual WhatsApp groups.
- **DishEntryCard city prop is optional** — Falls back to "Dallas" which is fine for Phase 1 but needs explicit passing when multi-city.

## Action Items

- [ ] Sprint 540: Governance (SLT-540 + Audit #66 + Critique 536-539) — **Owner: Sarah**
- [ ] Future: Align share domain (topranker.app vs topranker.com) — **Owner: Amir**
- [ ] Future: UTM-tracked short links for WhatsApp shares — **Owner: Jasmine**

## Team Morale
**9/10** — Feature cycle (538-539) delivered high-impact user-facing features. Dish leaderboard visit type filtering + WhatsApp sharing complete the SLT-535 roadmap. Ready for governance sprint 540.
