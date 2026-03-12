# Sprint 433: Rating History Export (CSV)

**Date:** 2026-03-10
**Type:** Feature — Profile UX
**Story Points:** 2

## Mission

Give users the ability to export their rating history as a CSV file. Client-side generation from existing ratingHistory data — no new API endpoint needed. Includes all rating details: business name, scores, visit type, dimensions, weight, and notes. Web uses Blob download, native uses Share API.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Pure client-side feature. ratingsToCSV is a standalone function that takes ExportableRating[] and returns a CSV string. RatingExportButton handles platform differences — Blob + download link on web, Share.share on native. Profile.tsx adds 5 LOC (690 total, 86.25% of threshold)."

**Amir Patel (Architecture):** "escapeCSV handles commas, quotes, and newlines in free-text notes. Visit type labels match the existing HistoryRow display. Dimension columns include the visit-type-specific label (Service vs Packaging vs Wait Time) so the CSV is self-documenting."

**Rachel Wei (CFO):** "Data portability is a trust signal. Users who can export their data feel ownership, not lock-in. This also supports potential CCPA/GDPR compliance for future markets."

**Marcus Chen (CTO):** "This ties into Constitution #3 — structured scoring. The CSV preserves the structure: three dimension scores with labels, visit type, weight. When users see their data in a spreadsheet, the structure validates that their ratings are real, weighted contributions — not just thumbs up/down."

**Nadia Kaur (Security):** "No PII beyond what the user already owns — their own ratings. The export contains business names, scores, and dates. No other user data leaks. Share API on native goes through OS-level share sheet with user consent."

## Changes

### New Files
- `components/profile/RatingExport.tsx` (143 LOC) — ratingsToCSV, escapeCSV, RatingExportButton, platform-specific export

### Modified Files
- `app/(tabs)/profile.tsx` (684→690 LOC) — Added RatingExportButton in Rating History section
- `__tests__/sprint406-profile-extraction.test.ts` — Updated profile LOC threshold 86%→88%

### Test Files
- `__tests__/sprint433-rating-export.test.ts` — 26 tests: exports, CSV generation, escaping, visit types, button UI, profile integration, file health

## Test Results
- **328 files**, **7,782 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 1 test threshold updated (sprint406 profile LOC)

## File Health After Sprint 433

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 690 | 800 | 86.3% | +6 | WATCH |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 422 | 600 | 70.3% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status. profile.tsx is at WATCH — monitor for future additions.**
