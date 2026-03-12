# Sprints 622-631 External Critique

## Verified wins
- Clear delivery chain on the Decision-to-Action layer: schema/API (626) → detail CTAs (627) → card quick-links (628) → seeded URLs (629) → analytics attribution (630). The sequencing is coherent and matches the stated architecture question.
- CEO feedback appears broadly acted on across the packet scope: horizontal alignment, whitespace, link fixes, photo strip expansion, map current location, profile name formatting, and governance are all explicitly mapped to sprints.
- Governance was at least scheduled and shipped as a sprint theme in 631, not left as an implied follow-up.
- Build remains under budget at 629.9kb / 750kb, so the added CTA/UI work did not obviously blow the bundle cap.
- Tracked files show 0 violations in the packet, which suggests process discipline at least on the tracked surface.

## Contradictions / drift
- “11/11 addressed” is not the same as “11/11 verified solved.” The packet asserts closure but provides no outcome evidence, only activity mapping.
- The sprint block is framed as “CEO feedback response + Decision-to-Action layer,” but nearly half the sprint range is split between unrelated UI polish/fallback work and D2A. That is mixed focus, not a clean thematic sprint run.
- The architecture question asks whether all UI should have shipped in one sprint, but your own sequence delayed end-to-end usefulness until phase 4 seeded real URLs. Before that, much of the UI risked being scaffolding without reliable actions.
- Analytics funnel design is incomplete by your own description. Firing impression on mount is not “impression”; it is component render. That inflates the funnel top and weakens attribution quality.
- Google Places fallback may improve coverage, but the packet gives no guardrails on labeling, ranking separation, or trust framing. Without those, “discovery” and “TopRanker judgment” are blurred.
- as-any increased from 114→122 during a governance sprint range that includes audit/critique. That is the opposite direction on code hygiene, even if localized to seeds.

## Unclosed action items
- Replace mount-based CTA impression tracking with visibility-based tracking or explicitly accept that current numbers are render-based, not view-based.
- Type the `SEED_BUSINESSES` data path to stop further `as any` growth. The packet explicitly identifies the cause and leaves it unresolved.
- Validate whether card CTA discoverability is adequate. The packet asks if 28px icon buttons are too subtle, which means this is not settled.
- Define product rules for Google Places fallback: when it appears, how it is labeled, and how it is separated from native TopRanker entities.
- Prove the D2A funnel with outcome data, not implementation completion. The packet gives implementation phases but no tap/conversion results.

## Core-loop focus score
**6/10**

- Strongest point: sprints 626-630 are a direct chain toward a tighter user loop from viewing businesses to taking action.
- Weak point: sprints 622-625 are mostly UI/presentation cleanup and profile formatting, which dilutes the stated “Decision-to-Action” emphasis across the full range.
- The loop is still only partially instrumented because “impression on mount” is a weak proxy for exposure.
- Real utility likely only became meaningful once action URLs were seeded in 629; earlier phases were preparatory, not full loop impact.
- Google Places fallback expands supply, but also risks shifting focus from ranking quality to generic listing coverage.
- Governance in 631 is useful, but it does not itself strengthen the user core loop unless it closes concrete product/measurement gaps.

## Top 3 priorities for next sprint
1. **Fix analytics semantics first.** Move CTA impressions to true visibility tracking and keep render-based metrics separate if needed. Current funnel quality is suspect.
2. **Resolve the fallback product boundary.** Clearly distinguish TopRanker-ranked results from Google Places fallback results in UI and logic, or you will erode ranking credibility.
3. **Close the type debt introduced by action seeding.** Type `SEED_BUSINESSES` and remove the new `as any` usage before the pattern spreads beyond seeds.

**Verdict:** The D2A work was sequenced sensibly, but the packet overstates closure. You shipped a lot of implementation steps, not a fully validated action loop. The biggest problems are measurement integrity, unresolved fallback-brand ambiguity, and allowing type debt to grow while claiming governance progress.
