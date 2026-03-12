# TopRanker — Category Expansion: Strategy & Readiness Framework

**Status:** DISCUSSION ONLY — No implementation unless restaurant gates are met
**Owner:** Rahul Pitta (CEO)
**Last Updated:** March 2026

---

## Purpose

This document is a **discussion tool, risk framework, and decision filter**.
It is not a roadmap promise, platform fantasy, or sprint backlog.

It exists to help the team build shared understanding of what category
expansion means — architecturally, legally, behaviorally, and culturally —
before any work begins.

**Restaurants are the only active category. Everything else is hypothetical
until real user behavior validates the core loop.**

---

## Warning: What Category Expansion Actually Requires

Category expansion is not mainly a database problem. It is a behavior,
trust, attribution, moderation, legal, and cold-start problem.

Architectural reusability (shared schema, shared UI patterns) does NOT
mean low expansion cost. The hard parts are:
- Getting enough real users to contribute data in a new vertical
- Solving attribution (who/what is being rated, at what granularity)
- Handling trust and gaming in domains with different incentive structures
- Legal review for categories with professional, medical, or child safety implications
- Cold-starting a leaderboard that looks credible rather than embarrassing
- Moderation at the category-specific level

The team must not confuse "we can reuse the schema" with "this is easy."

---

## Hard Expansion Gate: "Restaurants Are Healthy"

No category moves beyond DISCUSSION until ALL of these gates are met:

| Gate | Metric | Status |
|------|--------|--------|
| Weekly active raters in Dallas | ≥200 distinct users rating per week | NOT MET |
| Ratings per active user | ≥2 ratings per active user per month | NOT MET |
| Return rate | ≥40% of users return within 14 days | NOT MET |
| Business coverage | ≥50 businesses with ≥10 ratings each | NOT MET |
| Sub-item density | ≥3 dish leaderboards with ≥10 entries each | NOT MET |
| Low-data handling | Building/provisional states working correctly | MET |
| Core loop stability | rate → consequence → ranking verified end-to-end | MET |
| Trust UX | No major trust-damaging UX issues open | MET |
| Credibility weighting | Tier system proven to differentiate signal from noise | PARTIALLY MET |

**These gates are measured, not declared.** The team reviews them at each
SLT meeting. No gate is considered "met" without data.

---

## The Core Abstraction

Every category on this platform follows the same pattern:

  **Best [Specific Thing] in [City]**

Where "Specific Thing" is the sub-item inside the category — the thing
that creates specificity, debate, and contribution density.

For a sub-item to qualify, it must be:
1. **Naturally asked by real users** — people actually search for this
2. **Emotionally debatable** — it starts arguments, not shrugs
3. **Specific enough** — creates contribution density in a small area
4. **Simple enough** — explainable in one sentence

If a category cannot identify a clear sub-item that passes all four tests,
it is not ready.

---

## Category Rejection Criteria

A category should be rejected or held if:
- The sub-item is weak or unnatural (nobody actually asks "best X in Dallas")
- Attribution is ambiguous (person vs business vs location — who gets rated?)
- Legal/compliance risk is HIGH and unresolved
- Contribution frequency is too low for cold start (<monthly usage)
- The trust model doesn't map cleanly from restaurants
- The first Dallas wedge is unclear (no specific community or geography)
- Moderation requirements exceed current team capacity

---

## Category Tiers

### Tier 1: Adjacent / Lowest Risk
Categories with high behavioral overlap, low legal risk, strong sub-items.

| Category | Sub-item | Frequency | Cold Start | Legal Risk |
|----------|----------|-----------|------------|------------|
| **Cafés & Coffee** | Best [Drink] | Daily | LOW | NONE |
| **Bakeries & Desserts** | Best [Item] | Weekly | LOW | NONE |
| **Barbershops** | Best [Cut Style] | Biweekly | LOW | NONE |

**Why these three are strongest:**
- Same user base as restaurants (food/personal care in DFW)
- High repeat frequency = faster data accumulation
- Strong sub-items that provoke debate ("best cold brew," "best fade")
- Nearly identical architecture (reuse dish_leaderboards pattern)
- Zero compliance complexity

### Tier 2: Promising but Harder
Strong trust case, moderate complexity, requires more validation.

| Category | Sub-item | Key Challenge |
|----------|----------|---------------|
| Hair Salons | Best [Service] | Stylist vs salon attribution |
| Nail Salons | Best [Service] | Longevity dimension, hygiene framing |
| Street Food & Trucks | Best [Item] | Location instability |
| Photographers | Best [Type] | Style subjectivity, low frequency |
| Event Venues | Best [Type] for [Event] | Very low frequency |
| Spas & Massage | Best [Treatment] | Medical spa boundary |
| Gyms & Fitness | Best [Class/Focus] | Injury/safety liability |

### Tier 3: High Risk / Legal Sensitive
Require full legal review before any further discussion.

| Category | Risk |
|----------|------|
| Doctors & Clinics | HIPAA, medical outcome claims |
| Schools & Daycares | FERPA, child safety, mandatory reporting |
| Real Estate Agents | Financial advice proximity, NAR |

**DO NOT discuss implementation for Tier 3 without Victoria Ashworth sign-off.**

### Tier 4: Not for Active Consideration
Defer until Tier 1 categories are proven.

| Category | Reason to Defer |
|----------|----------------|
| Auto Care | Low frequency (quarterly), honesty dimension liability |
| Home Services | Very low frequency (yearly), cold start risk |
| Pet Care | Vet medical outcomes, moderate frequency |
| Grocery & Markets | Product vs store attribution unclear |
| Bars & Nightlife | Different user base, age-gating, safety dimension |
| Tutors & Education | Outcome claims, FERPA adjacency |

---

## Category Readiness Checklist

Before any category moves to SPRINT READY, these must be documented:

**A. Product Clarity** — What is the sub-item? What are the 3 rating dimensions?
**B. Data Viability** — How does attribution work? What's the data threshold?
**C. Trust & Anti-Gaming** — What does gaming look like? Does credibility weighting transfer?
**D. Legal & Compliance** — Any regulatory risk? What disclaimer language?
**E. Market Reality** — Who is the exact first user in Dallas? Where do they currently go?
**F. Architecture Impact** — Sprint cost? Risk to restaurant production?

Full checklist questions are maintained in team discussion notes.

---

## What Not to Do

- **Do not create sprint tickets from this document by default.** This is a thinking tool, not a backlog.
- **Do not discuss categories in a way that derails restaurant work.** If restaurants are not healthy, category discussion is premature.
- **Do not assume category expansion is cheap because UI or schema can be reused.** The hard problems are behavioral, legal, and data-density related.
- **Do not let future categories influence current product complexity.** Do not add "category-generic" abstractions to the restaurant codebase preemptively.
- **Do not treat this as a 20-category to-do list.** Most categories may never launch. That is fine.

---

## Status Lifecycle

```
DISCUSSION → QUESTIONS OPEN → QUESTIONS ANSWERED → SPRINT READY → BUILDING → LIVE
```

No category moves past DISCUSSION without the expansion gates being met.
No category moves to SPRINT READY without all readiness checklist answers.
No category moves to BUILDING unless restaurants are healthy.

Current status of all non-restaurant categories: **DISCUSSION**

---

## Summary

Restaurants prove execution. Category expansion remains hypothetical until
real user behavior validates the core loop. The sub-item abstraction
("Best [Specific Thing] in [City]") is the platform's differentiator, but
it only works with sufficient data density, trust, and community engagement.

One category at a time. No shortcuts. No premature building.
