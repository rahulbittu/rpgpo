# SPRINT-315-319 External Critique

## Verified wins
- Expanded dish coverage from 10 to 26 dishes across cuisines, with Korean and Thai explicitly added in scope.
- Dish leaderboard pages gained a reusable `DishEntryCard` extraction, with typed props and self-contained behavior per the packet.
- Share flow exists and is implemented with React Native’s built-in Share API using message + url + title.
- Rankings empty states now react to cuisine filters and use existing `dishShortcuts` state instead of a generic no-results state.
- Test suite is large and green in the packet: 6,098 tests across 240 files.

## Contradictions / drift
- The sprint cluster is framed as core content expansion, but discoverability is still weak enough that the packet asks whether dishes need their own tab. That means distribution/discovery still lags content creation.
- You cite constitution alignment on low-data honesty, but the same packet asks whether empty states should instead push a “contribute” CTA. That is unresolved product intent, not clear alignment.
- `CUISINE_DISH_MAP` is presented as a deliberate static-vs-API choice, yet it is also “enriched at runtime with API data.” That is a hybrid system with duplicated authority, not a clean balance.
- `DishEntryCard` extraction is defended as an audit-driven cleanup, but the packet itself questions whether a single-use extraction is warranted. That suggests refactor-first behavior without demonstrated reuse payoff.
- Share work is counted as a sprint feature, but the packet immediately questions whether the output is sufficient for WhatsApp virality. So the implementation shipped before the success bar was defined.
- Rankings is already ~640 LOC, and you are still asking when to extract cuisine-related UI. That means drift has already happened; this is not a future threshold question.

## Unclosed action items
- Decide source of truth for dish metadata: static map, API, or clearly bounded hybrid. Current model invites drift.
- Resolve discoverability strategy for 26 dish leaderboards: dedicated Dishes surface vs. continued indirect access only.
- Decide deep link vs canonical web URL behavior for share flows in native app contexts.
- Resolve whether duplicate `businessSlug` values in `SEED_DISHES` are acceptable, cosmetic, or a data integrity problem.
- Extract cuisine-related Rankings UI now or explicitly accept the 640 LOC page as temporary debt with a removal date.
- Choose the empty-state objective: honest guidance to adjacent dishes or contribution capture. Right now it is undecided.

## Core-loop focus score
**6/10**

- Good alignment with the content loop: more dishes, more leaderboard pages, more specificity.
- Empty-state improvements help retain users when cuisine-filtered rankings are sparse.
- Share feature is adjacent to the loop, but its effectiveness is unproven and may be superficial without stronger share payloads or deep linking.
- Discoverability remains underbuilt relative to content expansion; users still mainly reach dishes through secondary paths.
- Architecture decisions around static maps, seed duplication, and oversized Rankings page suggest speed over durable loop support.
- Too many sprint outputs end with open foundational questions, which weakens confidence that the loop is actually getting tighter.

## Top 3 priorities for next sprint
1. **Fix discoverability of dish leaderboards**
   - If dishes matter, give them a first-class surface. Stop expanding inventory while relying on cuisine shortcuts, search, and related links as the main entry points.

2. **Eliminate data-model ambiguity**
   - Define a single authority for cuisine/dish metadata and settle the duplicate `businessSlug` question. Content scale without data discipline will create inconsistent pages and trust issues.

3. **Pay down Rankings page drift**
   - Extract cuisine-specific UI from the ~640 LOC Rankings page now. The threshold has already been crossed, and continued additions will make future changes slower and riskier.

**Verdict:** You shipped real surface-area expansion, but too much of it is structurally unfinished. The biggest problem is not missing features; it is that content, discoverability, and data ownership are moving at different speeds. Several sprint outputs were delivered before the team agreed on what “done” meant, and the Rankings page is already carrying obvious UI debt.
