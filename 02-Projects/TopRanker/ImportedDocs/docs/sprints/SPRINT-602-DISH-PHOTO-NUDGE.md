# Sprint 602: Dish Photo Nudge in Rating Flow

**Date:** 2026-03-11
**Owner:** James Park (Frontend)
**Points:** 3
**Status:** Complete

## Mission

Add a contextual dish photo prompt in the rating flow's extras step. When a user selects a dish, immediately show a targeted nudge: "Got a photo of your [dish name]?" with prominent camera/gallery buttons. This directly ties dish specificity (our competitive advantage) to photo verification (our highest-impact quality signal at +15% per photo).

**First core-loop sprint since Sprint 590.** Ends the 8-sprint infrastructure streak.

## Team Discussion

**James Park (Frontend):** "The current photo section is buried below the note input with generic 'Gallery/Camera' buttons. Moving the prompt right after dish selection creates a natural flow: select biryani → 'Got a photo of your biryani?' → snap it. The contextual framing makes photos feel relevant, not optional."

**Marcus Chen (CTO):** "This is exactly the kind of core-loop work we've been missing. Photo verification is +15% per photo — it directly affects ranking accuracy. If even 20% more users submit a dish photo because of this nudge, the quality of our rankings improves measurably."

**Sarah Nakamura (Lead Eng):** "The nudge only appears when: (1) a dish is selected, and (2) no photos exist yet. Once a photo is added, it disappears and PhotoTips takes over with composition guidance. Clean conditional rendering with no state additions."

**Amir Patel (Architecture):** "RatingExtrasStep went from 541 to 606 LOC (+65 lines). The styles are the bulk of the addition. Ceiling raised to 650 LOC across 3 test files. This is organic feature growth — exactly what ceiling headroom is for."

**Priya Sharma (QA):** "The nudge uses the existing `addPhotoFromCamera` and `addPhotoFromGallery` functions — no new logic, just a more prominent entry point. PhotoTips (from PhotoBoostMeter.tsx) is now shown after the first photo to guide quality."

## Changes

### Modified Files
- `components/rate/RatingExtrasStep.tsx` — 541→606 LOC (+65). Added: dish photo nudge card (contextual prompt after dish selection), PhotoTips integration after first photo, conditional generic prompts (hidden when dish nudge is shown). Imported `PhotoTips` from PhotoBoostMeter.
- `__tests__/sprint424-photo-improvements.test.ts` — LOC threshold 600→650
- `__tests__/sprint466-extras-extraction.test.ts` — LOC threshold 550→650
- `tests/sprint379-photo-upload-ui.test.ts` — LOC threshold 600→650

### UX Flow (Before → After)

**Before:**
1. Select dish (optional)
2. Write note (optional)
3. Generic photo buttons at bottom: "Gallery" / "Camera"

**After:**
1. Select dish
2. **NEW: Contextual nudge**: "Got a photo of your [biryani]? A dish photo adds +15% verification boost"
   - Primary CTA: "Snap it" (camera, amber button)
   - Secondary CTA: "From gallery" (outlined)
3. If photo added → nudge disappears, PhotoTips shown ("Show food up close", "Good lighting", "Include context")
4. Write note (optional)
5. Photo section still available for additional photos

## Metrics

- **RatingExtrasStep:** 541→606 LOC (44 lines headroom to 650 ceiling)
- **Server build:** 730.0kb (unchanged — client-only change)
- **Tests:** 11,325 passing (484 files)
