# External Critique — Sprints 401-404 External Critique

## Verified wins
- Sprint 401 extracted `ProfileStatsCard` out of `profile.tsx`; parent file growth was contained to `739/800` despite adding a new dashboard surface.
- Sprint 402 improved `PhotoGallery.tsx` with clearer gallery affordances: count badge, featured-image index, overlay, community labeling, and a photo CTA.
- Sprint 402 also removed `as any` usage in the touched path and replaced it with `pct()`.
- Sprint 403 added expandable rating-history detail with more decision-useful information than the prior row view: visit type, dimension scores, would-return, note preview, and a business link.
- Sprint 404 extracted `TrendingSection` from `search.tsx` and reduced that file from `752` to `688` LOC.
- Sprint 404 reports zero test cascades after the extraction, which suggests the refactor did not force broad downstream changes.

## Contradictions / drift
- Sprint 401 adds more profile analytics, but all computation is client-side from `ratingHistory`. That is feature expansion without evidence of core-loop leverage; it is analysis UI layered on top of existing data, not rating or discovery improvement.
- Sprint 401 asks whether thresholds should work for power users, which implies the shipped heatmap scale may already be wrong for a meaningful segment. Shipping before threshold validation is drift from useful stats toward decorative stats.
- Sprint 402 adds a community photo count prop that is not populated from the API. That is premature UI surface area disconnected from actual data.
- Sprint 402 adds a "See all" overlay while explicitly stating no fullscreen gallery exists. That is a misleading affordance by definition.
- Sprint 402 routes "Add your photo" into the full rating flow instead of photo upload. If the goal was more photo contribution, this is indirect and likely adds friction.
- Sprint 403 changed row tap from navigation to expansion. That is not just an enhancement; it replaces an existing primary action and risks regression in a core browsing flow.
- Sprint 403 says dimension scores are shown as raw `q1/q2/q3` while also noting users may not know what they mean. That is exposing implementation-shaped data rather than user-shaped information.
- Sprint 404 improves trending presentation, but only 3 items are shown because of API limit and there is no mention of changing that limit or offering a path forward. This is cosmetic refresh over constrained utility.
- Sprint 404 returns `null` for empty trending, meaning the section silently disappears. That weakens discoverability and makes absence ambiguous.

## Unclosed action items
- Validate whether Sprint 401 heatmap thresholds are meaningful for high-frequency raters; current thresholds may collapse power-user activity.
- Decide whether Sprint 401 histogram buckets should stay integer-rounded or move to `0.5` granularity.
- Decide whether Sprint 401 "Most Rated" is sufficient or whether another profile stat better serves users.
- Either populate Sprint 402 community photo count from API or remove/defer the prop.
- Either implement the Sprint 402 fullscreen/all-photos destination or remove the "See all" overlay.
- Reassess Sprint 402 photo CTA flow: direct upload vs full rating flow.
- Reassess Sprint 403 tap behavior regression: expand vs navigate, and whether both actions need to coexist.
- Replace or label Sprint 403 raw `q1/q2/q3` outputs with understandable dimension names.
- Decide whether Sprint 404 needs a "See all trending" path beyond the API-limited top 3.
- Add or intentionally reject a Sprint 404 empty state instead of silently returning `null`.

## Core-loop focus score
**4/10**
- Most work here is presentation-layer enhancement, not clear improvement to rating submission, business selection, or repeat usage triggers.
- Sprint 402 is closest to core loop because photos can support contribution, but the CTA goes through the full rating flow, which weakens the benefit.
- Sprint 403 touches a core history surface, but it does so by changing a known navigation behavior, creating regression risk instead of cleanly improving the loop.
- Sprint 404 is mostly polish on trending visibility while still capped at 3 items and with no empty-state handling.
- Sprint 401 is the weakest for core-loop focus: client-side profile analytics are peripheral unless they measurably drive more rating activity.

## Top 3 priorities for next sprint
1. Fix misleading and incomplete affordances before adding more polish: remove or complete Sprint 402 "See all", populate/remove the community photo count prop, and add a real empty state for Sprint 404.
2. Resolve the Sprint 403 interaction regression by restoring a clear navigation path on history rows while keeping detail access explicit and understandable.
3. Stop shipping stats/UI that are not validated: confirm Sprint 401 bucket/threshold choices and replace raw `q1/q2/q3` style outputs with user-facing labels wherever exposed.

**Verdict:** These sprints show steady UI output, but too much of it is cosmetic or half-committed. The packet repeatedly describes shipped surfaces whose own questions admit they may be misleading, data-disconnected, or regress previous behavior. The main pattern is polish before interaction clarity: decorative stats, constrained trending, incomplete gallery affordances, and a history-row behavior change that may have broken a core action.
