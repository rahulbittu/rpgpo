# Retro 174: SEO for Dish Leaderboard Pages

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 5
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Marcus Chen:** "First organic search channel. Dish leaderboard pages are now crawlable, shareable, and indexable. This was the missing link between our content and Google."
- **Sarah Nakamura:** "Clean separation of concerns — SEO routes in their own module, dish page follows existing patterns, no impact on mobile app performance. Head component only renders on web."
- **Jasmine Taylor:** "The Open Graph tags mean every shared dish leaderboard link shows a rich preview. This is free marketing for every share."
- **Amir Patel:** "The sitemap generates dynamically from the database. When new dishes are activated, they automatically appear. Zero maintenance."

## What Could Improve
- No server-side rendering yet — Google can execute JS but it delays indexing
- Sitemap doesn't include individual business pages (could be thousands)
- No image sitemap for photo-heavy pages
- No meta tag testing tool integrated into CI
- The dish page could benefit from a "Share this ranking" button

## Action Items
- [ ] **Sprint 175:** Push notification infrastructure + SLT meeting + Audit #17
- [ ] **Future:** SSR/prerendering for high-traffic dish pages
- [ ] **Future:** Business page sitemap generation
- [ ] **Future:** Share button on dish leaderboard page

## Team Morale
**9/10** — Four consecutive sprints of clean execution (171-174). Revenue pipeline (claims) and growth pipeline (SEO) both shipping. Team is hitting stride after the technical debt window.
