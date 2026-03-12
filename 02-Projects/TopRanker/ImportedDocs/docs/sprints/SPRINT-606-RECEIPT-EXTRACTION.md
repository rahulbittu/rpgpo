# Sprint 606: Receipt Section Extraction from RatingExtrasStep

**Date:** 2026-03-11
**Story Points:** 3
**Owner:** Sarah Nakamura
**Status:** Done

## Mission

Extract the receipt upload section from RatingExtrasStep into a standalone `ReceiptUploadCard` component. RatingExtrasStep was at 629/650 LOC — only 21 lines of headroom. This extraction buys capacity for future rating flow features (Sprint 608 share prompt, etc).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Classic extraction sprint. The receipt section was self-contained — its own functions, its own styles, its own props. Clean cut. RatingExtrasStep drops from 629 to 501 LOC, giving us 49 lines of headroom against the new 550 ceiling."

**Amir Patel (Architecture):** "The extraction pattern is mature at this point. ReceiptUploadCard follows the same approach as PhotoBoostMeter, NoteSentimentIndicator, and DishPill — a focused component with clear props. The test redirect pattern is also well-established: point assertions at the new file."

**Marcus Chen (CTO):** "This is the infrastructure investment that enables Sprint 608's share prompt without hitting capacity limits. Good discipline — extract before you need to, not after you're blocked."

**Priya Sharma (Engineering):** "12 test assertions redirected from RatingExtrasStep to ReceiptUploadCard. No test count change — same 11,325 tests, just pointing at the right file now. The extraction is invisible to users but critical for development velocity."

**James Park (Engineering):** "The ReceiptUploadCard interface is clean: `receiptUri`, `setReceiptUri`, `visitType`. Three props. It handles its own image picking, camera capture, and all receipt display states. Future receipt features (OCR, date extraction) would go here without touching the parent."

## Changes

### New File: `components/rate/ReceiptUploadCard.tsx` (154 LOC)
- Self-contained receipt upload component
- `pickReceipt` and `captureReceipt` functions (moved from RatingExtrasStep)
- Full receipt UI: shield-checkmark header, "Verify with Receipt" title, proof list, hint, preview, gallery/camera buttons
- All receipt-related styles (14 style properties)
- Props: `receiptUri`, `setReceiptUri`, `visitType`

### Modified: `components/rate/RatingExtrasStep.tsx` (629→501 LOC, -128 lines)
- Added `import { ReceiptUploadCard }` from new component
- Replaced 75-line inline receipt JSX with single `<ReceiptUploadCard>` usage
- Removed `pickReceipt` and `captureReceipt` functions (-24 lines)
- Removed 14 receipt-related style properties (-34 lines)

### Test Redirects
- `tests/sprint382-receipt-verification-ui.test.ts` — 10 assertions redirected from RatingExtrasStep to ReceiptUploadCard
- `__tests__/sprint462-receipt-prompts.test.ts` — `getReceiptHint(visitType)` assertion redirected to ReceiptUploadCard

### Thresholds
- Added `components/rate/RatingExtrasStep.tsx`: maxLOC 550, current 501
- Added `components/rate/ReceiptUploadCard.tsx`: maxLOC 180, current 154

## Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| RatingExtrasStep LOC | 629 | 501 | -128 |
| ReceiptUploadCard LOC | — | 154 | +154 |
| Net LOC change | — | — | +26 (extraction overhead) |
| Tests | 11,325 | 11,325 | 0 |
| Server Build | 730.0kb | 730.0kb | 0 |
| Tracked Files | 24 | 26 | +2 |
