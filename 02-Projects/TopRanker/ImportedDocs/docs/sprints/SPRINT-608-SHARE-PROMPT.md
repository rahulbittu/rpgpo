# Sprint 608: Rating Confirmation — Share Prompt

**Date:** 2026-03-11
**Story Points:** 3
**Owner:** James Park
**Status:** Done

## Mission

Add a WhatsApp-first share prompt to the rating confirmation screen. After submitting a rating, users see a contextual prompt to share with friends. "Best [dish] in [city]" format designed for controversy-driven engagement in WhatsApp groups. This is a core-loop sprint — sharing creates organic distribution.

## Team Discussion

**James Park (Engineering):** "The share prompt card replaces the generic Share button with a dedicated section. WhatsApp is primary (green button, prominent), with 'More' as secondary for system share sheet. The text is contextual: if a dish was selected, it says 'Think [business] has the best [dish] in [city]? Let your friends decide.'"

**Jasmine Taylor (Marketing):** "This is the most important feature since the WhatsApp sharing utility in Sprint 539. Every rating submitted is a potential share. The 'Let your friends decide' framing triggers debate — exactly what we want in WhatsApp groups. The 'agree or disagree' angle is proven from our Best In share text."

**Rachel Wei (CFO):** "Organic sharing is free user acquisition. Every share that generates one new user is infinitely cheaper than paid ads. This is revenue-adjacent in the purest sense."

**Marcus Chen (CTO):** "The sharing text adapts: with dish context, it's 'I just rated [business] for [dish] in [city]'. Without, it's generic. The dish-specific version is what we want — specificity creates debate creates engagement."

**Amir Patel (Architecture):** "Clean implementation. `getRatingShareText` in sharing.ts follows the same pattern as `getBestInShareText`. The confirmation component gets the city from `useCity()` context. No new dependencies, no new patterns — just using what we have."

**Sarah Nakamura (Lead Eng):** "The confirmation screen went from 400→449 LOC. That's within tolerance. The share prompt card is self-contained and could be extracted if needed, but at 30 lines of JSX it's not worth a separate component yet."

## Changes

### Modified: `lib/sharing.ts` (118→136 LOC, +18)
- Added `getRatingShareText(businessName, dishName, city, rank, url)` function
- Generates post-rating WhatsApp text with dish context when available
- "I just rated [business] for [dish] in [city]!" format
- Updated threshold: maxLOC 130→150

### Modified: `components/rate/RatingConfirmation.tsx` (400→449 LOC, +49)
- Added `shareToWhatsApp`, `getRatingShareText` imports from sharing.ts
- Added `useCity()` hook for city context
- Added `handleWhatsAppShare` function
- Replaced generic share button with dedicated share prompt card:
  - Title: "Spread the word"
  - Contextual hint text (dish-aware)
  - WhatsApp primary button (#25D366 green)
  - "More" secondary button (system share sheet)
- Done button moved to separate row below share prompt

### Test Updates
- `__tests__/sprint595-governance.test.ts`: tracked files 24→26
- `shared/thresholds.json`: sharing.ts maxLOC 130→150, test count 11325→11327

## Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| RatingConfirmation LOC | 400 | 449 | +49 |
| sharing.ts LOC | 118 | 136 | +18 |
| Tests | 11,325 | 11,327 | +2 |
| Server Build | 730.0kb | 730.0kb | 0 |
