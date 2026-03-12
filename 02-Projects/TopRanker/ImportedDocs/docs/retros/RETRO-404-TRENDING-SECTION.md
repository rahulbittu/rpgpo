# Retro 404: Discover Trending Section Refresh

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "search.tsx dropped from 84% to 76% of threshold. That's the biggest single-sprint reduction for search.tsx since Sprint 193 (the original SearchOverlays extraction). And we got UX improvements too — net positive in both architecture and user experience."

**Amir Patel:** "Zero test cascades on extraction. The old trending section was tested through broader search tests that check search.tsx for 'trending' strings — those still match the import and component usage. Clean extraction."

**Priya Sharma:** "Photo thumbnails make trending immediately visual. Before it was just text rows with a green delta badge. Now it's a photo, name, score, rank, category, and 'up X this week.' Much richer."

## What Could Improve

- **No animation on trending rows** — Static rendering. A subtle slide-in stagger would feel more dynamic for a 'trending' section.
- **Only 3 businesses shown** — The fetchTrending call limits to 3. Could show more with a 'See all trending' link.
- **No score trend sparkline** — We have ScoreTrendSparkline on business detail but not in trending rows.

## Action Items

- [ ] Consider expanding trending to 5 businesses with 'See all' CTA — **Owner: Amir (future sprint)**
- [ ] Evaluate adding mini sparklines to trending rows — **Owner: Priya (future sprint)**

## Team Morale
**9/10** — Extraction + enhancement in one sprint. search.tsx is healthiest it's been in months. Strong finish to the SLT-400 window.
