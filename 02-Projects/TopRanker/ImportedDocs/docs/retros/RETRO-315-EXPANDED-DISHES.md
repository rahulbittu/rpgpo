# Retrospective — Sprint 315

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "19 dish leaderboards now live. Every cuisine has related dishes. The Sprint 314 discovery loop works for all cuisines, not just Indian and American."

**Amir Patel:** "Caught the multi-word slug matching bug. 'butter-chicken' ILIKE wouldn't match 'butter chicken' in normalized names. The hyphen-to-space fix is backward-compatible and affects all future multi-word boards."

**Rachel Wei:** "9 new SEO pages at zero engineering cost beyond data expansion. Each page has JSON-LD structured data, canonical URLs, and OpenGraph tags from Sprint 174."

## What Could Improve

- **Seed data is static** — 19 boards but all seed entries are pre-computed. Real user ratings will replace these quickly in production.
- **Banh Mi hyphenation** — CUISINE_DISH_MAP uses 'banh-mi' but Vietnamese users may search 'banh mi' (space). Search matching already handles this since it checks both slug and name.
- **No leaderboard thumbnail** — New boards (sushi, pasta, wings) have no custom hero images. Using business photos as fallback.

## Action Items
- [ ] Sprint 316+: Continue dish/cuisine refinements
- [ ] Future: Custom hero images per leaderboard
- [ ] Future: Consider adding Korean and Thai cuisines to CUISINE_DISH_MAP

## Team Morale: 9/10
Data completeness sprint. Less glamorous than UI work but critical for the discovery loop to function properly.
