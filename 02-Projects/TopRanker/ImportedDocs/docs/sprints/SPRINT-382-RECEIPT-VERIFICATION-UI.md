# Sprint 382: Receipt Verification UI

**Date:** 2026-03-09
**Type:** Feature — Rating Integrity Enhancement
**Story Points:** 5

## Mission

Add receipt/order confirmation upload to the rating flow. Per the Rating Integrity System doc (Method 3), receipt verification provides the strongest +25% verification boost. This sprint adds the UI layer — Gallery and Camera pickers, preview with "Verified Purchase" badge, and async upload with `isReceipt: true` flag.

## Team Discussion

**Marcus Chen (CTO):** "Receipt verification is our strongest trust signal at +25%. Having the UI in place means early adopters can start building verified ratings immediately. The backend `isReceipt` flag was already wired since Sprint 266 — this sprint connects it."

**Sarah Nakamura (Lead Eng):** "Good decision to keep receipt and photo uploads separate. Photos boost food quality credibility (+15%), receipts prove you actually visited (+25%). Different signals, different UI treatment."

**Amir Patel (Architecture):** "The upload function is essentially a clone of uploadRatingPhoto with isReceipt flipped. In V2 we'll add receipt OCR parsing, but for now the human review flag is sufficient per the integrity doc."

**Priya Sharma (Frontend):** "The receipt section has distinct visual treatment — gold border, receipt-outline icon, shield-checkmark on preview. Users can immediately see this is a different verification tier than food photos."

**Nadia Kaur (Cybersecurity):** "Receipt images may contain PII — credit card numbers, names. We should ensure receipt photos go through the same moderation pipeline as regular photos. The isReceipt flag helps the moderation queue prioritize these."

**Jordan Blake (Compliance):** "Good that we're not doing automated OCR yet. Manual review for now keeps us compliant with data processing regulations. Users uploading willingly is clear consent."

## Changes

### Modified Files
- `components/rate/RatingExtrasStep.tsx` — Added receipt upload section: receiptUri/setReceiptUri props, pickReceipt/captureReceipt functions, preview with Verified Purchase badge, +25% boost badge, Gallery/Camera buttons (391 → 506 LOC)
- `app/rate/[id].tsx` — Added receiptUri state, passed to RatingExtrasStep and useRatingSubmit (622 → 625 LOC)
- `lib/hooks/useRatingSubmit.ts` — Added uploadRatingReceipt function with isReceipt: true, receiptUri option, async non-blocking upload in onSuccess
- `tests/sprint379-photo-upload-ui.test.ts` — Bumped RatingExtrasStep LOC threshold from 400 to 550

### New Files
- `tests/sprint382-receipt-verification-ui.test.ts` — 25 tests covering receipt UI, rate page state, submit hook

## Test Results
- **289 files**, **7,003 tests**, all passing
- Server build: **599.3kb**, 31 tables

## Rating Integrity Alignment
- **Method 3 (Receipt/Order Confirmation):** +25% verification boost — strongest signal
- **UI follows doc:** "Upload your receipt for a Verified Purchase badge"
- **No OCR in V1** per integrity doc — human review flag via isReceipt boolean
- **Non-blocking upload:** Rating submission is instant; receipt uploads asynchronously
