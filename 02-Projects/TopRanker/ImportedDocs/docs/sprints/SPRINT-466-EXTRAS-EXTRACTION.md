# Sprint 466: RatingExtrasStep Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

P0 extraction per Audit #51: RatingExtrasStep.tsx was at 97% of its 600 LOC threshold (582/600). Extract visit-type prompt helpers (getPhotoPromptsByVisitType, getReceiptHint, VisitType, PhotoPrompt) to `components/rate/RatingPrompts.tsx`. Maintain backward compatibility via re-exports. Also clean up dead PhotoTips import.

## Team Discussion

**Marcus Chen (CTO):** "Third extraction in this cycle: Sprint 456 (DiscoverFilters), Sprint 461 (RatingExport), Sprint 466 (RatingExtrasStep). The pattern is proven and repeatable. Each one follows the same playbook: extract pure logic, import in original, re-export for compatibility."

**Amir Patel (Architect):** "RatingPrompts.tsx has zero React dependencies — pure TypeScript functions and types. This makes it reusable across components and potentially server-compatible. The ~60 LOC extracted brings RatingExtrasStep from 97% to 90% of threshold."

**Sarah Nakamura (Lead Eng):** "4 test files needed redirect updates. The pattern is the same every time: find tests that check for function definitions, point them to the new file. Tests that check for function usage (calls) don't change since the imports still reference the function names."

**Rachel Wei (CFO):** "These extraction sprints are invisible to users but critical for developer velocity. A file at 97% means we can't add features without breaking thresholds. Extraction restores headroom for the next 3-5 sprints of feature work."

## Changes

### New: `components/rate/RatingPrompts.tsx` (~60 LOC)
- `VisitType` type: "dine_in" | "delivery" | "takeaway"
- `PhotoPrompt` interface: icon, label, hint
- `getPhotoPromptsByVisitType()` — 3 prompts per visit type
- `getReceiptHint()` — contextual receipt upload hint per visit type
- Zero React dependencies — pure TypeScript

### Modified: `components/rate/RatingExtrasStep.tsx` (582→540 LOC, -7.2%)
- Removed prompt helper definitions
- Added imports from RatingPrompts
- Added re-exports for backward compatibility
- Removed dead PhotoTips import (L-2 from Audit #51)

### Modified test files (4 files):
- `__tests__/sprint459-photo-prompts.test.ts` — redirected to RatingPrompts.tsx
- `__tests__/sprint462-receipt-prompts.test.ts` — redirected to RatingPrompts.tsx
- `__tests__/sprint424-photo-improvements.test.ts` — updated import check
- `tests/sprint266-rating-photos.test.ts` — updated boost meter check
- `tests/sprint382-receipt-verification-ui.test.ts` — updated receipt hint check

## Test Coverage
- 20 tests across 4 describe blocks (Sprint 466 tests)
- All existing tests pass with redirects
- Full suite: 8,617+ tests passing
