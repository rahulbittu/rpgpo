# Retro 464: Rating Note Sentiment Indicators

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The 3-file architecture is right: pure utility (lib/), display component (components/rate/), minimal integration (2 lines in RatingExtrasStep). When RatingExtrasStep eventually needs extraction, the sentiment work is already isolated."

**Amir Patel:** "Good restraint — keyword-based is appropriate for 160-char notes. We don't need ML or API calls for this. The word lists are domain-specific (restaurant terms), which gives better accuracy than generic sentiment for our use case."

**Nadia Kaur:** "Correct privacy posture — client-side only, no server component, no data collection. The sentiment analysis is purely for the user's own guidance. This is how UX nudges should work."

## What Could Improve

- **RatingExtrasStep at 97% (582/600)** — We're 18 lines from threshold. This file needs extraction in the next cycle. The photo prompts, receipt prompts, and now sentiment indicator have all added small increments.
- **Word lists are English-only** — Our target market is Indian-American in Dallas, but some users may write notes in Hindi or mixed language. Keyword matching would miss those entirely.
- **No tuning data** — We have no real-world data to validate the 0.2 score threshold. It might be too sensitive or not sensitive enough. Needs iteration once we see real user notes.

## Action Items

- [ ] Begin Sprint 465 (Governance: SLT-465 + Audit #51 + Critique) — **Owner: Sarah**
- [ ] Plan RatingExtrasStep extraction sprint — **Owner: Amir** (P0 given 97% threshold)
- [ ] Monitor sentiment indicator user interaction patterns post-launch — **Owner: Jasmine**

## Team Morale
**8/10** — Good sprint. The sentiment indicator is a small, tasteful UX addition that respects user autonomy. Team is aware that RatingExtrasStep extraction is now the top file health priority.
