# Retro 538: Dish Leaderboard UX — Visit Type Filter + Enhanced Photos

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "First feature sprint after the health cycle. Visit type filtering on dish leaderboards extends our core competitive advantage — no other platform answers 'best biryani for delivery in Irving'. This creates 3x the shareable content from each leaderboard."

**Amir Patel:** "No schema changes needed. The visit type breakdown is computed from existing ratings.visitType via a single grouped query. The per-business re-ranking joins through dishVotes → ratings, which is efficient since dish leaderboards typically have <50 entries."

**Sarah Nakamura:** "The filter chip UX is clean — auto-hides when only one visit type exists, resets when switching dishes, color-coded to match our visit type system. The 160px photo height gives better visual impact without excessive scrolling."

**Jasmine Taylor:** "Each dish leaderboard now generates 3-4 shareable angles instead of 1. 'Best biryani for dine-in', 'for delivery', 'for takeaway' — each sparks a different debate in WhatsApp groups."

## What Could Improve

- **Re-ranking on filter is server-side** — Each visit type filter triggers a new API call with per-business score recalculation. Could cache pre-computed visit type scores in dishLeaderboardEntries for faster response.
- **No A/B testing on photo height** — 160px was chosen by feel, not data. Monitor scroll depth when we have analytics.
- **Visit type chip counts are total ratings, not unique businesses** — Might confuse users expecting entry count.

## Action Items

- [ ] Sprint 539: WhatsApp share deeplinks — "Best In" format sharing — **Owner: Sarah**
- [ ] Sprint 540: Governance (SLT-540 + Audit #66 + Critique) — **Owner: Sarah**

## Team Morale
**9/10** — Strong feature sprint after health cycle. Visit type filtering on dish leaderboards is a meaningful competitive differentiator. Ready for WhatsApp sharing sprint.
