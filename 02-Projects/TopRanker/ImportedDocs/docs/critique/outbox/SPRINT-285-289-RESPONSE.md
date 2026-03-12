# Critique Request — Sprints 285-289 External Critique

## Verified wins
- Cuisine shipped end-to-end across schema, API, types, mocks, and UI:
  - nullable `cuisine` column with index
  - `GET /api/leaderboard/cuisines`
  - `?cuisine=` leaderboard filter
  - type propagation through `ApiBusiness`, `MappedBusiness`, `mapApiBusiness`
  - cuisine display on HeroCard, RankedCard, and BusinessCard
- Seed coverage increased from 35 to 47 businesses and now spans 10 cuisines.
- Search UI got one real extraction:
  - Best In section moved to `components/search/BestInSection.tsx`
  - `search.tsx` reduced from 917 LOC to 802 LOC
  - explicitly no API churn
- Test additions are nontrivial across the set: 29 + 18 + 5 + 8 = 60 new tests.

## Contradictions / drift
- Sprint 285 is governance/audit overhead, while 286-289 are cuisine/UI work. That is two different tracks in a five-sprint packet; the packet lacks a clear single sprint theme.
- The stated phase target is 50 restaurants, but after five sprints the packet reports 47 seeded businesses total and only 5 Indian restaurants for the named focus area. That is not aligned with “Indian Dallas focus” if that was meant to materially validate the market.
- Cuisine is treated as a product filter/discovery dimension, but storage is described as nullable freeform text. That is operationally convenient but drifts from the need for consistent filtering, faceting, and deduped cuisine lists.
- The UI format example says `Restaurants -> Indian -> Irving -> $$$` but no evidence is provided that this improves ranking decisions or search conversion. Most of the packet is metadata display work, not core ranking/selection improvement.
- The anti-requirement issue is 33 sprints old and still unresolved. Continuing to ask when to remove Sprint 253/257 features is governance drift, not an active execution plan.

## Unclosed action items
- Anti-requirement cleanup remains open:
  - Sprint 253 business-responses still exists
  - Sprint 257 review-helpfulness still exists
  - no removal owner, trigger, or governance rule is stated
- Cuisine taxonomy decision is still open: freeform text vs enum vs lookup table.
- Seed lifecycle policy is still open: no mechanism stated for marking staff-seeded businesses or deprecating them later.
- Large-file decomposition remains open beyond the one extraction:
  - `badges.ts` at 886 LOC
  - `routes.ts` at 510 LOC
- The packet asks whether 5 Indian Dallas seeds are enough, which means the target for market-representative coverage is still undefined.

## Core-loop focus score
4/10

- There is some user-visible value: cuisine filtering and cuisine display can help browsing.
- But most effort appears to be metadata plumbing and UI presentation, not stronger ranking quality, submission flow, or trust signals.
- One full sprint in the packet is governance-only.
- A five-sprint packet ending at 47 total seeded businesses against a 50-restaurant phase target is weak throughput.
- The unresolved anti-requirement items show poor loop hygiene: unwanted product surface remains live for 33 sprints.
- Refactoring happened, but only one extraction on a still-large file; maintenance debt is acknowledged more than reduced.

## Top 3 priorities for next sprint
1. **Close the anti-requirement debt with an explicit removal decision**
   - Remove Sprint 253 and 257 features or document a named exception with owner and expiry.
   - Stop carrying “temporary” violations indefinitely.

2. **Lock cuisine into a controlled taxonomy before more data lands**
   - Do not scale freeform text if cuisine is a first-class filter.
   - Use a canonical cuisine table or equivalent normalized vocabulary with display labels and aliases.

3. **Define and execute seed-data policy tied to the core loop**
   - Mark staff-seeded entries explicitly.
   - Set rules for visibility, replacement, and deprecation once user submissions arrive.
   - If Indian Dallas is a real wedge, push coverage to a level that actually tests the wedge instead of stopping at 5.

**Verdict:** This packet shows competent incremental shipping, but too much of it is plumbing, display polish, and governance while basic product discipline remains loose. The biggest problem is not the cuisine work; it is that you are still carrying known anti-requirement violations 33 sprints later and still have not decided the data model for a feature you are actively expanding.
