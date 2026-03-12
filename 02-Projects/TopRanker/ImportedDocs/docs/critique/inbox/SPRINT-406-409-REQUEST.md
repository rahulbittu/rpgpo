# External Critique Request — Sprints 406-409

**Date:** 2026-03-09
**Requesting:** Independent review of Sprints 406-409
**Reviewer:** External watcher (ChatGPT)

---

## Sprint 406: Profile Breakdown Extraction

**Summary:** Extracted `ScoreBreakdownCard` component (87 LOC) from profile.tsx, handling the collapsible score breakdown with 6 BreakdownRow components, penalty display, and total. profile.tsx dropped from 739→680 LOC (92%→85% of threshold). breakdownExpanded state moved inside the extracted component.

**Questions:**
1. The ScoreBreakdownCard manages its own expanded/collapsed state. Should the parent ever need to control this (e.g., auto-expand on first visit)?
2. The BreakdownRow component is imported from a sibling file. Is the import chain (ScoreBreakdownCard → BreakdownRow) too deep for a presentational component?
3. Was 92% a reasonable threshold for triggering extraction? Could we wait longer (95%+) or should we extract earlier (85%)?

---

## Sprint 407: Business Hours Display Improvements

**Summary:** Enhanced `OpeningHoursCard` with week overview dots (S-M-T-W-T-F-S showing open/closed per day), next-opening-time for closed businesses ("Opens tomorrow at 9:00 AM"), hours duration display ("11h today"), and relative time for near-future openings ("Opens in 45min").

**Questions:**
1. Week dots show binary open/closed. Should they indicate partial hours (e.g., half-dot for businesses open only during lunch)?
2. The "Opens in X" relative time threshold is 2 hours. Is that the right cutoff or should it extend further?
3. All time parsing is local timezone. For travelers checking hours in another city, times could be misleading. Is this a real concern for our user base?

---

## Sprint 408: Discover Empty State Enhancements

**Summary:** Enhanced `DiscoverEmptyState` with search term suggestions ("Did you mean?"), filter-specific reset actions (e.g., "Remove Open Now filter — some places may be closed"), quick search pills (Biryani, Tacos, Pizza, etc.), and `onClearFilter` prop. Also cleaned up 8 `as any` casts.

**Questions:**
1. Search suggestions use first-3-character substring matching against CUISINE_DISPLAY and common terms. Is this too naive? Would Levenshtein distance or phonetic matching catch more typos?
2. Quick search pills are hardcoded. Should they be dynamic based on trending searches per city?
3. The filter reset button text is different per filter. Is one-size-fits-all text ("Clear filters") simpler and less maintenance?

---

## Sprint 409: Rating Flow Accessibility Audit

**Summary:** Added WCAG-aligned accessibility attributes across the entire rating flow (rate/[id].tsx, SubComponents.tsx, RatingExtrasStep.tsx). Added accessibilityValue to ProgressBar, accessibilityRole/Label/State/Hint to DishPill, accessibilityLiveRegion to live score preview, accessibilityRole="header" to business name, and input labels/hints.

**Questions:**
1. All accessibility was added via code analysis, not manual screen reader testing. How critical is manual VoiceOver/TalkBack testing before claiming WCAG compliance?
2. The live score preview uses accessibilityLiveRegion="polite". Should it be "assertive" when the user completes all dimensions?
3. accessibilityHint messages like "Double tap to select this score" are iOS-specific language. Should we use platform-neutral hints?
