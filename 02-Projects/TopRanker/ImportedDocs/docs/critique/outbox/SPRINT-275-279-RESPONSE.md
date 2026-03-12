# Critique Request — Sprints 275-279 External Critique

## Verified wins
- Sprint 278 tightened rating input validation in concrete ways:
  - q1/q2/q3 now enforce integers via `.int()`
  - `visitType` is required in schema
  - fallback cast `(data as any).visitType || "dine_in"` was removed
  - duplicate `note` field was removed
- Sprint 279 fixed a clear UX/data bug:
  - `getRankDisplay(0)` now returns `"Unranked"` instead of `"#0"`
  - search cards now use actual rank instead of list index
  - accessibility labels were updated for unranked state
- Sprint 276 and 277 added business-detail enrichment tied to backend endpoints rather than hardcoded UI:
  - sparkline fetches from `/api/businesses/:id/score-trend`
  - top dishes fetches from `/api/businesses/:id/top-dishes`

## Contradictions / drift
- The team is still spending sprint capacity on dashboard/enrichment work instead of the core ranking loop. Sparkline, top-dishes, and admin eligibility are all peripheral unless they directly change submit → rank → discover behavior.
- Sprint 278 is called “validation hardening,” but the note handling described is not hardening in any serious sense. Regex HTML stripping is weak sanitization, and increasing the cap from 160 to 2000 expands payload/risk surface at the same time.
- “Self-fetching” components for both sparkline and top dishes duplicate a pattern that likely adds more business-page request fan-out. That may be acceptable now, but it is drift from efficiency if detail pages keep accreting one-endpoint-per-widget.
- The packet asks whether route files from Sprint 253 and 257 should be removed, but those routes are already 27 sprints past being flagged. That is process drift: known anti-requirement violations are being tolerated indefinitely.
- “Unranked” fixes honesty, but adding a muted gray badge still makes the state more visually explicit. If the concern is owner discouragement, the implementation is moving toward stronger negative signaling, not neutral framing.

## Unclosed action items
- Remove or formally decide on the lingering anti-requirement routes from Sprint 253 (`business-responses`) and Sprint 257 (`review-helpfulness`). Waiting 27 sprints is not a plan.
- Decide whether business detail data fetching should stay as separate self-fetching widgets or be consolidated/cached. The sparkline scalability concern is unresolved in the request itself.
- Replace or constrain the regex-based note sanitization approach. At minimum, stop describing it as sufficient hardening.
- Decide whether near-eligible thresholds in admin eligibility are product constants or experiment/config values. Hardcoded thresholds are unresolved policy.
- Reassess the UX framing of “Unranked” if owner perception is a real concern, because the current implementation optimizes correctness, not softer presentation.

## Core-loop focus score
**4/10**

- One sprint clearly improved input quality on rating submission, which touches the core loop directly.
- The unranked/search-card fix improves ranking truthfulness, also core-loop adjacent.
- But two visible sprints were business-detail enrichment features: sparkline and top dishes. Those are consumption polish, not loop acceleration.
- Admin eligibility is internal tooling, not user-facing loop improvement.
- The packet still carries unresolved anti-requirement debt from 27 sprints ago, which suggests weak discipline on focus.
- Too much of this batch is interpretive UI and admin support, not more ratings, better ranking confidence, or faster discovery decisions.

## Top 3 priorities for next sprint
1. **Close the anti-requirement debt decisively.** Remove the Sprint 253/257 route files or get an explicit product decision; do not carry zombie features into another sprint.
2. **Consolidate and cache business-detail data fetching.** Stop adding self-fetching widgets without a page-level data strategy; reduce request fan-out before more detail-page modules land.
3. **Finish rating-input safety properly.** Keep strict schema validation, but replace the weak regex note sanitization approach with a defensible rendering/storage policy and explicit limits.

**Verdict:** There are a few real fixes here, especially around rank display truthfulness and rating schema enforcement, but the sprint set is unfocused. Too much effort went into detail-page garnish and admin visibility while known anti-requirement junk remains in the codebase 27 sprints later. The team is improving surfaces around the product more than tightening the product’s actual loop.
