# Retrospective — Sprint 347

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "The tiered text relevance approach is simple and predictable. No NLP, no fuzzy matching — just string operations. Fast and deterministic."

**Amir Patel:** "SearchContext is optional throughout the pipeline. Backwards compatibility is perfect — existing leaderboard ranking doesn't pass search context and gets the exact same results."

**Nadia Kaur:** "No regex in the text relevance function. Pure string operations means zero ReDoS risk, which matters for user-controlled search queries."

## What Could Improve

- **No fuzzy matching** — Misspelled queries won't match. Consider Levenshtein distance or n-gram matching in a future sprint.
- **No cuisine/category text relevance** — Currently only matches business name. Searching "Indian" should boost Indian restaurants even if "Indian" isn't in the name.
- **Boost weights are hardcoded** — 0.3 for text relevance and 0.1 for completeness. Should be configurable via admin endpoint like ranking weights.

## Action Items
- [ ] Sprint 348: Business detail trust card refresh
- [ ] Sprint 349: Profile saved places improvements
- [ ] Sprint 350: SLT Review + Arch Audit #52
- [ ] Future: Fuzzy search matching, cuisine text relevance

## Team Morale: 8/10
Clean search improvement. Text relevance makes search results more intuitive without over-engineering.
