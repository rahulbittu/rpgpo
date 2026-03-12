# Sprint 459: Visit-Type-Aware Photo Prompts

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Replace generic photo tips in the rating flow with visit-type-specific photo prompts. When a user selects dine-in, delivery, or takeaway as their visit type, the photo section now shows contextual suggestions for what to photograph — improving photo relevance and verification quality.

## Team Discussion

**Marcus Chen (CTO):** "This directly supports rating integrity. A delivery photo of packaging is worth more than a random food photo — it proves the visit type claim. Context-aware prompts guide users to provide the right evidence."

**Rachel Wei (CFO):** "Better photos = stronger verification signals = higher credibility weights. This is a low-effort change that compounds over thousands of ratings. The marginal cost is zero but the data quality improvement is significant."

**Amir Patel (Architect):** "Clean implementation: a pure function that maps visit type to prompt arrays. No new dependencies, no API changes, no state complexity. The PhotoPrompt interface keeps it typed and extensible."

**Sarah Nakamura (Lead Eng):** "The getPhotoPromptsByVisitType helper uses a switch/case with sensible defaults — if visitType is null (shouldn't happen in practice since step 1 requires it), dine-in prompts show. Each visit type gets 3 targeted suggestions with icon, label, and hint."

**Jasmine Taylor (Marketing):** "This helps with our WhatsApp sharing too. When users take better, more relevant photos, those photos become better marketing assets. A photo of delivery packaging tells a story that generic food shots don't."

**Nadia Kaur (Cybersecurity):** "From a verification standpoint, visit-type-specific photos are harder to fake. Asking for 'packaging presentation' for delivery means the user needs to actually have the delivery in front of them. It's a soft verification layer."

## Changes

### Modified: `components/rate/RatingExtrasStep.tsx` (515→555 LOC)
- Added `VisitType` type alias for "dine_in" | "delivery" | "takeaway"
- Added `PhotoPrompt` interface: `{ icon, label, hint }`
- Added `getPhotoPromptsByVisitType(visitType)` helper:
  - dine_in: Dish photo, Vibe/atmosphere, Experience moment
  - delivery: Packaging presentation, Food received, Order screenshot
  - takeaway: Takeaway bag/container, Food at home, Wait time estimate
- Added `visitType?: VisitType | null` to `RatingExtrasStepProps`
- Replaced generic `<PhotoTips />` with visit-type-aware prompt list
- Added styles: photoPromptSection, photoPromptRow, photoPromptTextWrap, photoPromptLabel, photoPromptHint

### Modified: `app/rate/[id].tsx` (1 line)
- Passes `visitType={visitType}` to `<RatingExtrasStep />`

## Test Coverage
- 18 tests across 4 describe blocks
- Validates: prompt helper, prop wiring, UI rendering, docs
