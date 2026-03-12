# Retrospective — Sprint 352

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "Server build went from 593.7kb to 593.8kb — adding 2 fields to the autocomplete query cost exactly 0.1kb. That's the esbuild tree-shaking working as expected."

**Jasmine Taylor:** "The amber left-border on suggestion chips creates visual consistency with the brand. Small detail but it ties the search experience to the rest of the app."

**Sarah Nakamura:** "Cuisine-first emoji in autocomplete means Indian restaurants show 🍛 instead of generic 🍽. Same pattern we used in SavedRow and PhotoStrip — consistency across surfaces."

## What Could Improve

- **No fuzzy matching in autocomplete** — Sprint 347 noted this gap. Text relevance uses exact/starts-with/contains but autocomplete still uses SQL LIKE. Typo tolerance is a future improvement.
- **Score badge doesn't show for new businesses** — Businesses with score 0 don't show a badge. This is correct but could be confusing for users who expect to see a score.

## Action Items
- [ ] Sprint 353: Rating distribution chart improvements
- [ ] Sprint 354: Admin dashboard dimension timing display
- [ ] Consider fuzzy matching for autocomplete in future sprint

## Team Morale: 9/10
Clean UI refresh with minimal server impact. Score preview in autocomplete is a nice touch for the "ranking at every surface" principle.
