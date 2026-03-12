# Sprints 466–469 External Critique

## Verified wins
- Audit #51 file health alerts were reported as resolved in scope via extraction work on `RatingExtrasStep`, `RatingExport`, and `DiscoverFilters`.
- Scoring guidance was added to dimension tooltips across 9 dimensions using a normalized `10 / 5 / 1` pattern.
- Filter presets got a data-layer implementation instead of leaving preset logic implicit in UI state.
- The packet explicitly acknowledges known debt instead of hiding it: `as any` in preset constants, re-export accumulation, and missing admin auth middleware.

## Contradictions / drift
- The sprint claims file-health resolution, but the packet also admits four extractions in one cycle (`456, 461, 466, 467`). That is not proactive file-size control; it is repeated reactive cleanup.
- “Resolved all file health alerts” is narrower than “managed file growth well.” The request tries to frame threshold compliance as architectural health. Those are not the same.
- Scoring tips were added for calibration, but the packet itself questions whether the language is actually calibrated. If some dimensions are subjective (“felt like a VIP”) and others operational (“ready when promised”), then format consistency is being confused with scoring consistency.
- Filter presets are presented as a type-safe data layer win, but the packet admits `as any` was required for dietary/hours values. That weakens the claimed robustness of the implementation.
- Re-exports are being used for backward compatibility after extraction while also being flagged as onboarding/structure debt. That means the extraction strategy is partially shifting complexity, not removing it.
- Admin auth is the clearest drift: this is the fourth critique noting missing middleware, yet it is still deferred to Sprint 472. Repeated acknowledgment without immediate closure is process failure, not planning.

## Unclosed action items
- Admin enrichment endpoint auth middleware is still unshipped. This remains the highest-severity open item in the packet.
- Re-export cleanup/migration is not scheduled, only questioned. Backward-compatibility shims remain in place with no end-state defined.
- Type architecture around the re-export chain/Vitest resolution remains unresolved; `as any` is a workaround, not closure.
- No explicit policy was adopted for proactive file-growth management despite multiple extractions in a short span.
- Scoring-tip calibration quality is still open. The packet asks whether the language undermines calibration, which means this has not been validated.

## Core-loop focus score
**5/10**
- Adding scoring guidance is core-loop adjacent: it can improve rating quality, but it does not by itself change the primary user action.
- Filter presets are more directly core-loop relevant because they can improve discovery efficiency, but this packet only claims the data layer, not shipped user impact.
- A large share of effort appears to have gone to file-health extractions and compatibility re-exports, which are maintenance tasks, not loop advancement.
- Security-critical admin auth remained open for a fourth review cycle, indicating prioritization drift.
- The sprint did address tooling/usability around rating and discovery, but too much of the work reads as cleanup plus partial infrastructure.

## Top 3 priorities for next sprint
1. **Ship admin auth middleware immediately** for all enrichment/admin endpoints; do not defer again behind normal sprint sequencing.
2. **Remove the `as any` preset workaround** by fixing the type/export boundary instead of normalizing unsafe constants into the codebase.
3. **Set and enforce a proactive module-growth rule** with an explicit exit plan for re-exports, so extractions stop creating hidden structure debt.

**Verdict:** The packet shows useful cleanup and some product-adjacent improvements, but the main pattern is reactive maintenance dressed up as health progress. The biggest issue is unchanged: a known auth gap has now survived four critique cycles, which outweighs the claimed wins. Format standardization, extracted files, and preset data structures do not compensate for repeated deferral of a security-relevant fix and ongoing architectural drift.
