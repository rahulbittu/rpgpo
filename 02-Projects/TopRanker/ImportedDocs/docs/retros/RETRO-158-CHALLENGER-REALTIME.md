# Retro 158: Challenger Real-Time Feedback

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 3
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Marcus Chen:** "One line of broadcast closes a feature gap. This is the right size for a sprint fix — surgical, tested, done."
- **Amir Patel:** "Google Maps audit confirmed it's working. We can stop worrying about it and focus on core loop."
- **Sarah Nakamura:** "5 tests lock in the challenger broadcast chain. If anyone removes that line, CI catches it."

## What Could Improve
- Challenger still lacks a closure mechanism — when challenges end, no backend job archives them
- Winner determination is client-side only — should be server-authoritative
- The hardcoded `city: "Dallas"` in ranking_updated is misleading (though unused)

## Action Items
- [ ] **Sprint 159+:** Add challenger closure batch job (runs hourly, closes expired challenges)
- [ ] **Sprint 159+:** Server-side winner determination and persistence
- [ ] **Low priority:** Fix hardcoded "Dallas" in ranking_updated broadcast payload

## Team Morale
**9/10** — Two real-time features fixed in back-to-back sprints. The core loop is now genuinely live-updating across rankings and challengers. Team confidence is high.
