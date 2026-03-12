# Retrospective — Sprint 272
**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "The IMDB weighted rating formula is well-understood and battle-tested. We didn't need to invent anything — just apply a proven statistical technique. The implementation in the score engine is 10 lines of code. Simple, correct, powerful."

**Sarah Nakamura:** "The integration was one line in `recalculateBusinessScore`. The Bayesian prior sits on top of the existing weighted average. No restructuring needed. The entire Phase 3b was additive."

**Nadia Kaur:** "The anti-gaming impact is significant. Perfect scores from thin data are now mathematically discounted. This removes a key exploit vector without any user-facing friction."

## What Could Improve

- **Prior mean is hardcoded at 6.5**: Should eventually be computed per-category or per-city. A fine dining category might have a different natural average than fast casual. For V1, the global 6.5 is fine.
- **No admin UI to adjust prior parameters**: Prior strength and mean are constants in the score engine. Should be admin-configurable in the future.
- **Score breakdown doesn't show Bayesian adjustment**: Users see the final score but don't know it's been shrunk. A "confidence-adjusted" label could help.

## Action Items
- [ ] Sprint 273: Leaderboard minimum requirements enforcement — Marcus
- [ ] Per-category prior mean computation — backlog
- [ ] Admin UI for Bayesian parameters — backlog
- [ ] Confidence-adjusted label in score breakdown — backlog

## Team Morale: 9/10
Phase 3b complete. The scoring system now incorporates Bayesian shrinkage, making low-data scores honest and high-data scores dominant. Combined with temporal decay (Sprint 271), the ranking algorithm is statistically sound: recent ratings matter more, credible raters matter more, verified ratings matter more, and data density matters more. The formula from the Rating Integrity doc is fully live.
