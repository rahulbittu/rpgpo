# Retrospective — Sprint 276
**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "The rank_history table was already collecting the data we needed. The endpoint was a simple SELECT + ORDER BY. The SVG sparkline is lightweight — no charting library dependency."

**Amir Patel:** "The self-fetching component pattern (introduced in Sprint 268 with ScoreBreakdown) works well. ScoreTrendSparkline owns its data, handles loading, and renders independently. No prop drilling from the business page."

**Jasmine Taylor:** "The trend direction indicator is a strong UX element. Up arrow green, down arrow red — instant understanding. This will be a key visual for marketing content."

## What Could Improve

- **No score trend for new businesses**: Businesses with <2 history snapshots see nothing. Could show a "trend will appear after your first score change" placeholder.
- **SVG rendering on native**: SVG works on web but React Native's SVG support varies. May need `react-native-svg` for native rendering. Fine for web-first V1.
- **No annotation for score changes**: The sparkline shows direction but not why. A chef change or renovation isn't visible. Could add annotation markers in a future sprint.

## Action Items
- [ ] Sprint 277: Dish leaderboard enrichment — Amir
- [ ] react-native-svg compatibility check — backlog
- [ ] Score trend placeholder for new businesses — backlog
- [ ] Trend annotation markers — backlog

## Team Morale: 9/10
The business detail page is now the most informative restaurant page in any ranking app: score breakdown by visit type, confidence badges, and score trend sparkline. Users see not just a number but the full story behind a ranking.
