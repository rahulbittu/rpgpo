# Retro 399: Search Autocomplete Improvements

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Jasmine Taylor:** "Cuisine chips in autocomplete are a power move. Type 'ind' → see Indian chip → tap → all Indian restaurants. Two taps, no typing. That's how mobile-first products should work."

**Amir Patel:** "HighlightedName is a clean, reusable component. It handles edge cases (no match, query too short) and works for both business results and dish leaderboard results. AMBER highlighting ties it to our brand."

**Sarah Nakamura:** "Only 1 test cascade (sprint313) and it was a simple fix — template literal vs JSX. The pattern of testing source contents is mature enough that cascades are predictable and small."

## What Could Improve

- **No keyboard-driven selection** — Users can't arrow-key through autocomplete results. Desktop UX gap.
- **Cuisine chips don't animate** — They appear statically in the dropdown.
- **No 'See all results' action** — When autocomplete shows partial results, there's no explicit CTA to run full search.

## Action Items

- [ ] Consider keyboard navigation for autocomplete (desktop/web UX) — **Owner: Priya (future sprint)**
- [ ] Evaluate 'See all results' CTA at bottom of autocomplete — **Owner: Amir (future sprint)**

## Team Morale
**8/10** — Clean sprint, good enhancements. Autocomplete feels noticeably more helpful.
