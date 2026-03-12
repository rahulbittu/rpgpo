# Sprint 462: Visit-Type-Aware Receipt Prompts

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 1
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Extend the visit-type-aware prompt pattern from Sprint 459 (photo prompts) to the receipt upload section. Instead of a generic "Upload your receipt or order confirmation," show contextual hints: delivery users see "delivery confirmation or app screenshot," takeaway users see "pickup order receipt," dine-in users see "restaurant receipt or bill."

## Team Discussion

**Marcus Chen (CTO):** "This completes the visit-type prompt trilogy: scoring dimensions (Sprint 261), photo prompts (Sprint 459), receipt prompts (Sprint 462). Every step of the rating flow now adapts to how you actually experienced the business. That's our competitive moat."

**Amir Patel (Architect):** "Minimal implementation — a single pure function, one line changed in the template. The file grew by 14 lines to 580/600. That's 96.7% of threshold. If we add more to RatingExtrasStep, we'll need extraction. But this change was necessary and proportional."

**Rachel Wei (CFO):** "Receipt uploads are our strongest verification signal (+25% boost). Making the prompt specific to the visit type removes confusion — a delivery user won't wonder 'what receipt?' when we say 'delivery confirmation or app screenshot.' Clear prompts → higher upload rates."

**Nadia Kaur (Cybersecurity):** "Visit-type-specific receipt prompts also help with verification accuracy. A delivery receipt from an app screenshot is a different artifact than a dine-in paper bill. When we eventually add automated receipt verification, the visit type context will be essential for choosing the right parsing strategy."

## Changes

### Modified: `components/rate/RatingExtrasStep.tsx` (566→580 LOC)
- Added `getReceiptHint(visitType)` function:
  - delivery: "Upload your delivery confirmation or app screenshot"
  - takeaway: "Upload your pickup order receipt or confirmation"
  - dine_in (default): "Upload your restaurant receipt or bill"
- Replaced static receipt hint text with `{getReceiptHint(visitType)}`

## Test Coverage
- 12 tests across 3 describe blocks
- Validates: receipt hint helper, dynamic rendering, docs
