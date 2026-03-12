# Sprint 469: Search Filter Presets

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add predefined and custom search filter presets. Users can quickly apply common filter combinations like "Quick Lunch" (open now, ranked), "Date Night" (open late, ranked), or "Vegetarian." Custom presets are persisted to AsyncStorage. Built on the SearchFilterState type from Sprint 451's URL param sync.

## Team Discussion

**Marcus Chen (CTO):** "Filter presets are the search equivalent of bookmarks. Instead of remembering filter combinations, users tap one button. The built-in presets match our most common WhatsApp campaign themes: 'Best vegetarian,' 'Best late night,' 'Top rated.'"

**Amir Patel (Architect):** "Pure utility module pattern again: `lib/search-filter-presets.ts` has zero React dependencies. The FilterPreset interface is typed, serialization handles edge cases, and getAllPresets() merges built-in with custom. The storage key uses our `topranker:` namespace convention."

**Rachel Wei (CFO):** "These presets align with marketing campaign URLs. A 'Quick Lunch' preset produces the same filters as our 'open now' campaign link. Users who arrive via WhatsApp and then save the filter as a preset become repeat users of that filter pattern."

**Jasmine Taylor (Marketing):** "The 5 built-in presets match our top 5 campaign themes. When we send a WhatsApp message about 'Best halal in Irving,' users can later find that same filter as a built-in preset. Continuity between marketing and product."

**Sarah Nakamura (Lead Eng):** "Serialization only saves custom presets — built-in presets are always fresh from code. This means we can update built-in presets without migrating stored data. The deserialize function is defensive: handles invalid JSON, missing fields, and malformed data."

## Changes

### New: `lib/search-filter-presets.ts` (~100 LOC)
- `FilterPreset` interface: id, name, icon, filters (SearchFilterState), isBuiltIn
- 5 built-in presets: Quick Lunch, Date Night, Vegetarian, Top Rated, Halal
- `getBuiltInPresets()` — returns built-in presets array
- `createCustomPreset(name, icon, filters)` — creates a custom preset with timestamp ID
- `serializePresets(presets)` — JSON serialization, filters out built-ins
- `deserializePresets(json)` — defensive parsing with fallback to empty array
- `getAllPresets(customJson?)` — merges built-in + custom presets
- `PRESETS_STORAGE_KEY` — AsyncStorage key for persistence

## Test Coverage
- 18 tests across 4 describe blocks
- Validates: built-in presets, custom creation, serialization/persistence, docs
