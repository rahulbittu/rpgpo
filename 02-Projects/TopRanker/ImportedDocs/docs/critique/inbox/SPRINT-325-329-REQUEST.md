# Critique Request — Sprints 325-329

**Submitted:** March 9, 2026
**Sprints covered:** 325 (DoorDash nav redesign), 326 (Discover DoorDash), 327 (Sticky cuisine chips), 328 (Share on ranked cards), 329 (Seed enrichment)

## Key Changes
1. **Sprint 325:** Rankings page restructured — moved category/cuisine/dish filters from fixed position into FlatList ListHeaderComponent. Fixed area reduced from ~300px to ~100px.
2. **Sprint 326:** Same DoorDash pattern applied to Discover page. Filter chips, price chips, sort chips moved into scroll.
3. **Sprint 327:** Sticky cuisine bar on Rankings — when user scrolls past cuisine chips, a fixed copy appears at the top.
4. **Sprint 328:** Share button added to RankedCard — one-tap sharing from the leaderboard using native Share API.
5. **Sprint 329:** Seed enrichment ensures minimum 5 entries per dish leaderboard via fallback business selection.

## Areas for Review
1. **Sticky bar duplication (Sprint 327):** The sticky cuisine bar duplicates the in-scroll cuisine chip rendering. Is this the right approach, or should we extract a shared component?
2. **index.tsx at 650 LOC:** The sticky bar pushed it to the threshold. Is extracting CuisineChipRow the right decomposition?
3. **search.tsx at 963 LOC:** Still approaching 1000. The DoorDash refactor didn't reduce LOC because we moved the same JSX. Should we extract filter/price/sort into a shared FilterBar component?
4. **Seed enrichment determinism:** Using `displayOrder * 3` as offset for business selection. Is this sufficiently varied, or will some businesses appear disproportionately?
5. **Share analytics:** Tracking "ranked_card" vs "share_sheet" sources. Are these the right attribution categories for WhatsApp marketing analysis?
6. **Anti-requirement violations:** Still unaddressed at 73-77 sprints overdue. Is this becoming a governance risk?
