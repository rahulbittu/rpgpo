# Sprints 355-359 External Critique

## Verified wins
- Timing pipeline reached the final “wire” step: client timing is now posted to the server endpoint (`lib/hooks/useRatingSubmit.ts`), which closes the stated collect → store → wire sequence.
- Some user preferences are now persisted via AsyncStorage: cuisine filter, sort preference, and discover tip dismissal. That is concrete UX continuity, not just intent.
- Business hours UX was extended across both the card and business detail surface (`components/business/OpeningHoursCard.tsx`, `app/business/[id].tsx`), indicating the feature was integrated beyond a single isolated component.
- Architecture audit reports no growth in server bundle size (596.3kb unchanged across 4 feature sprints) and no schema expansion (31 tables unchanged).

## Contradictions / drift
- The sprint mix is mostly polish/governance around the edges while the core product files remain large: `search.tsx` at 900 LOC and `profile.tsx` at 695 LOC. Stable size metrics do not offset rising UI concentration risk.
- “30 consecutive A-range audits” is not evidence of architectural health by itself; it suggests the audit may be too easy, too static, or measuring the wrong things. The packet itself raises that concern.
- Sprint 356 asks whether fire-and-forget POST plus a 1,000-entry in-memory cap is acceptable, but there is no evidence here of durability, retry behavior, drop visibility, or failure handling. That means the timing pipeline is “wired,” not proven reliable.
- Persistence decisions look inconsistent: cuisine filter and sort are persisted, while category persistence is still unresolved. This indicates no clear state persistence policy, just ad hoc additions.
- Hours parsing is acknowledged as regex-based for a narrow Google-style US format, yet shipped as an enhancement without evidence of fallback behavior for non-matching inputs. That is feature delivery with known format fragility.

## Unclosed action items
- Decide whether timing events need durability/retry semantics or whether best-effort fire-and-forget is explicitly acceptable.
- Define a persistence policy for session-vs-user preferences, including whether category filter should reset or persist.
- Reassess profile stats presentation density on mobile; the current two-row layout remains an open UX concern.
- Decide whether hours parsing should stay US-format-only or be hardened for 24h/localized strings.
- Tighten audit criteria or add new metrics so the architecture audit remains discriminating rather than ceremonial.
- Address concentration risk in `search.tsx` and `profile.tsx`; unchanged file ownership/size is not closure.

## Core-loop focus score
**6/10**
- One sprint directly advanced a real product loop step: sending timing data to the server.
- One feature sprint improved business detail usefulness (hours), which is adjacent to decision-making in the user journey.
- Two of five sprints were UX polish, not core-loop expansion.
- One of five was governance, which may be useful but does not move user value directly.
- Large core screens remain monolithic, which slows future loop iteration even if current work shipped.
- The packet emphasizes audit streaks and implementation questions more than measurable user-outcome movement.

## Top 3 priorities for next sprint
1. **Make the timing pipeline trustworthy or explicitly cheap.** Add a clear stance on loss tolerance, retries, queue limits, and observability; right now it is implemented but underspecified.
2. **Set and apply a persistence rulebook.** Stop deciding preference storage case-by-case; define what persists across sessions and apply it consistently, including category filter behavior.
3. **Reduce risk in oversized core screens.** Break down `search.tsx` and/or `profile.tsx` so future feature work is not piled onto already large files.

**Verdict:** This sprint set shipped a few real improvements, but too much of the packet is “wired,” “persisted,” or “A-rated” without proving reliability, consistency, or maintainability. The biggest problem is drift toward ceremonial architecture confidence and incremental UI polish while core surfaces stay oversized and key behavior decisions remain unresolved.
