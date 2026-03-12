# External Critique Request — Sprints 406-409 External Critique

## Verified wins
- Sprint 406 has a concrete structural change: `ScoreBreakdownCard` extracted at 87 LOC, `profile.tsx` reduced from 739→680 LOC, and local UI state moved with the extracted component.
- Sprint 407 shipped multiple user-visible hours improvements: week overview dots, next-opening messaging, duration display, and near-future relative time.
- Sprint 408 added concrete empty-state behaviors: typo suggestions, filter-specific reset actions, quick search pills, `onClearFilter`, and removed 8 `as any` casts.
- Sprint 409 added accessibility metadata across multiple rating-flow files, including roles, labels, hints, progress value, and live-region usage.

## Contradictions / drift
- 406 is framed as maintainability work around a file-size threshold, not user-value or core-loop acceleration. The threshold discussion suggests the extraction was driven by LOC hygiene more than product leverage.
- In 406, moving `breakdownExpanded` into the child improves encapsulation but directly conflicts with the stated question about parent-controlled behaviors like auto-expand on first visit. That control path was removed before the requirement was settled.
- 407 adds more display sophistication to business hours, but the open questions show unresolved product semantics: binary dots may be misleading for partial hours, the 2-hour relative-time cutoff is arbitrary, and timezone correctness is acknowledged but unaddressed.
- 408 improves the empty state, but the matching approach is admitted to be naive while also adding hardcoded search pills. That is UI polish over search-quality fundamentals.
- 409 describes the work as “WCAG-aligned” while explicitly stating there was no manual screen-reader testing. That is a compliance claim without validation.
- 409’s hints use platform-specific interaction language while asking afterward whether that is appropriate. The implementation appears to have been shipped before the accessibility copy standard was decided.

## Unclosed action items
- Decide whether `ScoreBreakdownCard` expansion must be controllable by the parent; if yes, current ownership is wrong.
- Define a clear extraction standard for oversized files; the 92%/95%/85% discussion is still unresolved and currently subjective.
- Validate the business-hours display model for partial-day openings and confirm whether binary dots are acceptable.
- Set and justify the relative-time threshold for “Opens in X” instead of leaving 2 hours as an untested default.
- Decide whether cross-timezone hour display matters for the product; if it does, local-only parsing is an open correctness issue.
- Replace or justify the naive empty-state suggestion algorithm; current substring matching is a known limitation.
- Decide whether quick search pills should remain hardcoded or be driven by real usage/trends.
- Manually test the rating flow with VoiceOver/TalkBack before making any WCAG-strength claims.
- Standardize accessibility hint language across platforms.

## Core-loop focus score
**5/10**
- 407 and 409 touch real user experience in discovery and rating, which are closer to the loop.
- 408 likely helps recovery from failed search states, which can improve loop continuation.
- 406 is mostly internal maintainability work and weakly tied to the core loop.
- 407 and 408 both add presentation/polish while leaving underlying correctness and relevance questions open.
- 409 improves accessibility, but without manual validation it is incomplete and risks overstating impact.

## Top 3 priorities for next sprint
1. **Close validation gaps before adding more UI polish.** Manually test the rating flow with VoiceOver/TalkBack and fix findings; stop implying WCAG compliance from code inspection alone.
2. **Resolve known correctness ambiguities in business hours.** Decide the product rules for partial-day availability, relative-time thresholds, and timezone handling; current display logic is richer but not clearly trustworthy.
3. **Prioritize search/result quality over empty-state cosmetics.** Improve suggestion matching beyond first-3-character substring logic and use real query data before expanding hardcoded pill UX further.

**Verdict:** This batch shipped visible improvements, but too much of it is implementation-first and decision-later. The main pattern is unresolved semantics shipped as UI: local state ownership without product confirmation, richer hours display without correctness policy, search suggestions without robust matching, and accessibility claims without manual testing. The work is not off-track, but it is too comfortable polishing surfaces while leaving validation and product rules open.
