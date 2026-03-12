# Critique Request: Sprints 456–459

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Filter extraction, hours badge, bulk enrichment, photo prompts

## Context

Sprints 456–459 covered: component extraction for file health, search card UX enhancement, admin bulk operations, and visit-type-aware rating flow improvements.

## Questions for External Review

### 1. FilterChipsExtended Extraction Pattern
Sprint 456 extracted 3 chip components from DiscoverFilters.tsx to FilterChipsExtended.tsx, with re-exports in the original file for backward compatibility. Is the re-export pattern the right call, or should consumers be updated to import directly from the new file? Re-exports add indirection but prevent widespread import changes.

### 2. isClosingSoon() Threshold
Sprint 457's `isClosingSoon()` uses a hardcoded 60-minute threshold. Is 60 minutes the right window? Some restaurants might close in 30 minutes and users would want to know sooner. Should this be configurable per business or per city?

### 3. Bulk Enrichment Without Auth Middleware
Sprint 458's bulk-dietary and bulk-dietary-by-cuisine endpoints (like all admin enrichment routes) still lack `requireAuth`/`requireAdmin` middleware. This was flagged in the 451-454 critique request too. Are we accumulating auth debt across the admin surface?

### 4. Visit-Type Photo Prompts — Verification Value
Sprint 459 claims visit-type-specific photos are "harder to fake" and serve as "soft verification." How strong is this claim? A delivery user could still upload a stock photo. Are the prompts genuinely useful for verification, or is this primarily a UX improvement that we're over-attributing to integrity?

### 5. RatingExport at 98% — Extraction Priority
RatingExport.tsx has been at 98% of its LOC threshold for 2 audit cycles. The SLT flagged it as P0 for Sprint 461. But it hasn't grown — it's stable at 294/300. Is urgency warranted for a file that's near threshold but not actively growing? Or does the threshold proximity alone justify preemptive extraction?
