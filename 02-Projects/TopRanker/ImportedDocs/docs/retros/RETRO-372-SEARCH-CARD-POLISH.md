# Retrospective — Sprint 372

**Date:** March 10, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "Clean additive changes — 3 new styles, 2 type fields, zero breaking changes. SubComponents.tsx grew only 3 lines because the JSX additions are compact."

**Jasmine Taylor:** "The Google rating comparison is the kind of subtle competitive positioning that makes users think. It's not an attack on Google — it's context. 'Here's what we see vs what they see.'"

**Priya Sharma:** "All 16 tests passed first run after a minor string assertion fix. The test pattern for optional UI features (guard checks + style existence) is well-established."

## What Could Improve

- **Server-side data mapping needed** — `googleRating` and `isClaimed` fields added to MappedBusiness type but server doesn't populate them yet. Need to wire up Google Places data and claim status in the business mapper.
- **NEW badge threshold (< 5) may need tuning** — could be too aggressive or too conservative depending on rating velocity in production.

## Action Items
- [ ] Sprint 373: Business detail breadcrumb navigation
- [ ] Sprint 374: Admin dashboard link to moderation page
- [ ] Sprint 375: SLT Review + Arch Audit #57

## Team Morale: 8/10
Card polish feels tangible. The Google comparison adds competitive differentiation that the marketing team is excited about.
