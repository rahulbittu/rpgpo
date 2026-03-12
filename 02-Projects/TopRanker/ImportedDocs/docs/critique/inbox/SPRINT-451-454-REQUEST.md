# Critique Request: Sprints 451–454

**Date:** 2026-03-10
**Submitted by:** Sarah Nakamura (Lead Eng)
**Sprint range:** 451–454

## Context

Sprints 451–454 delivered: URL param sync for shareable search (451), admin enrichment dashboard (452), dynamic hours on business detail (453), and rating export improvements with JSON format (454).

## Questions for External Review

### 1. URL Param Security (Sprint 451)
The `decodeSearchParams` validates all params against whitelists (dietary tags, distance options, hours filters, sort modes, price ranges). However, the `query` and `cuisine` params are passed through with only a presence check, no sanitization. Is this sufficient, or should we add character whitelists or length limits to prevent URL-based injection vectors?

### 2. Admin Enrichment Endpoints — Authentication Gap (Sprint 452)
The enrichment dashboard endpoints (`/api/admin/enrichment/*`) don't have `requireAuth` or `requireAdmin` middleware — they're open. This was noted in the retro. How critical is this for a pre-production admin tool? Should we block the push until auth is added, or is it acceptable as a known gap?

### 3. Hours Computation Duplication (Sprint 453)
The search endpoint and single-business endpoint both call `computeOpenStatus()`. This is the right pattern for consistency, but it means we compute open status on every single API call. For the search endpoint returning 50+ results, that's 50 function calls per request. At what scale does this become a performance concern, and should we consider caching?

### 4. Export File Size (Sprint 454)
The JSON export includes summary statistics + full ratings array with pretty-printing (`null, 2`). For a power user with 1,000+ ratings, the JSON could be several MB. Should we add pagination or compression for large exports? Or is client-side generation inherently bounded by the loaded data?

### 5. DiscoverFilters Extraction Strategy (Audit #49)
DiscoverFilters.tsx is at 381/400 LOC (95.3%). The planned extraction is to pull HoursFilterChips and DietaryTagChips into standalone files. But these chips share common styling patterns with existing FilterChips, PriceChips, SortChips. Should we extract ALL chip types into a unified `filter-chips/` directory, or just the ones at risk?
