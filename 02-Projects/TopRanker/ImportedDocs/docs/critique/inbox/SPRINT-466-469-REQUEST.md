# Critique Request: Sprints 466–469

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** RatingExtrasStep extraction, enrichment route split, scoring tips, filter presets

## Context

Sprints 466–469 resolved all file health alerts from Audit #51, added scoring guidance to dimension tooltips, and built the filter presets data layer.

## Questions for External Review

### 1. Extraction Cycle Frequency
Four extractions in one cycle (456, 461, 466, 467). Is this a sign that file growth isn't being managed proactively enough? Should there be a hard cap (e.g., "no file grows more than 20 LOC per sprint") rather than reactive extraction when thresholds are hit?

### 2. Scoring Tip Format Consistency
Sprint 468's scoring tips use "10 = ... 5 = ... 1 = ..." format. Is this consistent enough across all 9 dimensions? Some tips use subjective language ("felt like a VIP") while others are more objective ("ready when promised"). Does inconsistency in calibration language undermine the calibration goal?

### 3. Filter Preset Type Safety
Sprint 469's filter presets use `as any` for dietary and hours filter values. This is because the types come from a re-export chain that Vitest can't resolve. Is this a sign that the type architecture needs refactoring, or is `as any` acceptable for data constants?

### 4. Re-Export Debt
Three major files (RatingExtrasStep, RatingExport, DiscoverFilters) use re-exports for backward compatibility after extraction. At what point do re-exports become technical debt that slows onboarding and obscures the true module structure? Should we schedule a migration sprint?

### 5. Admin Auth — Fourth Time
This is now the fourth critique request noting that admin enrichment endpoints lack auth middleware. SLT-470 has committed Sprint 472 for this. Is committing to a specific sprint sufficient, or should this be an immediate hotfix given it's a security-relevant finding?
