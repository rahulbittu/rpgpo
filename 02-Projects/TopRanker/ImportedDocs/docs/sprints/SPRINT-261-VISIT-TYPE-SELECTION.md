# Sprint 261 — Visit Type Selection in Rating Flow (Rating Integrity Phase 1a)

**Date**: 2026-03-09
**Theme**: Rating Integrity Phase 1a
**Story Points**: 13
**Tests Added**: 5151 total passing

---

## Mission Alignment

Added visit type selection as the FIRST question in the rating flow. This is the competitive advantage — Yelp doesn't do this, Google doesn't do this. A delivery customer rating "vibe" makes no sense, and now the product enforces that truth.

---

## Changes

- **New Step 0**: "How did you experience [restaurant]?" → Dined In / Delivery / Takeaway
- **Dimension gating**: different scores shown for each visit type
  - Dine-in: Food Quality + Service + Vibe & Atmosphere
  - Delivery: Food Quality + Packaging Quality + Value for Money
  - Takeaway: Food Quality + Wait Time Accuracy + Value for Money
- **Visit type passed to submit payload** via `useRatingSubmit` hook
- **3-step flow** (was 2-step)

---

## Team Discussion

**Rahul (CEO)**: "This is what the Rating Integrity doc demands. Visit type separation IS our competitive advantage. A delivery customer rating 'vibe' makes no sense."

**Sarah Nakamura (Lead Eng)**: "Clean implementation. Step 0 gates everything — you can't rate dimensions that don't apply to your experience."

**Amir Patel (Architecture)**: "The dimension gating is exactly what Part 3 specifies. Food always has highest weight across all visit types."

**Leo Hernandez (Design)**: "Three large cards with emojis for visit type selection — clear, no ambiguity. Rating Integrity Part 9 says 'large tap targets, no subtext needed.'"

**Jasmine Taylor (Marketing)**: "This is shareable. 'I rated the delivery experience at [restaurant]' is a different story than 'I rated the restaurant.'"

**Nadia Kaur (Cybersecurity)**: "Visit type data enables velocity detection patterns we couldn't see before — delivery-only rating spikes are suspicious."

---

## Tests

- 5151 passing
- Core loop: YES — structured scoring with visit type context makes every rating more truthful
