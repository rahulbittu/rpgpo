# Sprints 561-564 External Critique

## Verified wins
- Three extractions are concretely described and quantified:
  - `dashboard.tsx` 592→492 LOC
  - `api.ts` 691→550 LOC
  - `CollapsibleReviews` 407→349 LOC
- Hours pipeline got an end-to-end test in sprint 564, and the stated purpose is clear: “full pipeline validation.”
- Current audit state improved to “0 Low findings,” and the packet explicitly says this is the first clean audit since #68.
- 299 LOC were extracted from “high-pressure files.”
- The team is at 71 consecutive A-range arch grades, which at minimum shows sustained metric compliance.

## Contradictions / drift
- The sprint is framed as an “Extraction Cycle + Integration Testing,” but the strongest reported success metric is file-level LOC reduction, while the packet itself admits total LOC increased by 80. That is metric gaming risk, not clear complexity reduction.
- “Low-risk, predictable” extraction is the stated pattern, but it required 37 test redirections across the cycle. That is not free; it is a maintenance tax created by the extraction approach.
- The packet highlights cleaner modularity, but `api-owner.ts` duplicates `apiFetch` instead of reusing it. That is immediate drift from DRY and from the implied goal of cleaner architecture.
- The sprint includes “integration testing,” yet the cited hours integration test imports server code directly into a client test file. That weakens boundary discipline while claiming stronger end-to-end validation.
- Centralized thresholds track 16 files, but the packet’s own concern is that total related-module complexity can still rise while tracked files look healthier. That suggests the threshold system is lagging the real optimization target.
- The timezone is hardcoded to `"America/Chicago"` while the packet explicitly raises future city expansion risk. Even if YAGNI is acceptable today, this is known coupling to geography in a pipeline you just chose to validate end-to-end.

## Unclosed action items
- Decide whether 37 test redirections are now enough evidence to restructure tests away from per-file source assertions. This is an open cost issue, not just a style question.
- Resolve `apiFetch` duplication across `api.ts`, `api-admin.ts`, and `api-owner.ts`: shared utility vs accepted duplication policy. Right now it is neither standardized nor justified.
- Fix or explicitly ratify the cross-boundary test structure where `__tests__/sprint564-hours-integration.test.ts` imports `../server/hours-utils`.
- Decide whether timezone handling stays hardcoded by policy or gets parameterized before more city expansion. Leaving it ambiguous is the problem.
- Add a metric that captures module-family or total related LOC/complexity, not just pressure reduction in individual files.
- Clarify whether extraction success means better file health, lower total complexity, or both. The packet currently mixes these.

## Core-loop focus score
**6/10**

- The work stays near the product/service core: HoursEditor, Owner API, photo reviews UI, and hours pipeline.
- Sprint 564 is the best core-loop item because it validates the hours pipeline end-to-end rather than only moving code around.
- Three of four sprints are mostly structural extraction work, which is maintenance-heavy and only indirectly improves the core loop.
- The cycle shows some architecture drift during cleanup work: duplicated fetch helper, test-boundary leakage, and redirection churn.
- Success is being measured more by local file pressure and grade continuity than by reduced system complexity or stronger runtime behavior.
- The sprint is focused, but too much of that focus is on preserving internal health metrics rather than simplifying the actual loop.

## Top 3 priorities for next sprint
1. **Set and enforce boundary rules for tests and server/client imports.** Move server-only tests to a server test area or otherwise eliminate the current cross-boundary pattern.
2. **Standardize API helper policy.** Either extract `apiFetch` to a shared internal utility or explicitly document duplication as intentional; do not keep drifting module-by-module.
3. **Replace file-level extraction victory metrics with module-level complexity tracking.** Track net complexity/LOC across extracted families so “health improvements” cannot hide total growth and test-redirection overhead.

**Verdict:** This cycle produced real cleanup and one meaningful integration test, but it also exposed a pattern of cosmetic file-health wins masking increased total code, duplicated internals, and weaker boundary discipline. The main drift is obvious: you are getting better at moving code out of hot files without proving that the surrounding system is becoming simpler or cheaper to maintain.
