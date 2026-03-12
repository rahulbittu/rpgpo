# SPRINT-335-339 External Critique

## Verified wins
- Anti-requirement violations are reported as fully removed, and the packet ties that to concrete churn: 7 files removed, 20+ modified, ~2,200 lines deleted.
- Architecture Audit #50 stayed at **A**, continuing the stated A-range streak.
- Server build size dropped from **607.4kb to 590.5kb**.
- Schema complexity decreased from **32 tables to 31** with `ratingResponses` removed.
- Copy-link sharing shipped across a shared utility (`lib/sharing.ts`) plus consumers, which suggests the feature was implemented as reusable plumbing rather than one-off UI.
- Production seed refresh added enrichment instead of leaving seed data static/null-heavy.

## Contradictions / drift
- The sprint mix is not tight on the product core loop. Two governance sprints, one infra sprint, and one UX polish sprint versus one small feature sprint is maintenance-heavy drift.
- The packet celebrates anti-requirement removal as “fully removed” but simultaneously asks whether the deletion was “too aggressive” and whether stub code should have been left. That indicates uncertainty after the fact on a supposedly settled P0 cleanup.
- “Fully removed” anti-requirement violations conflicts with continued architecture warning language around `SubComponents.tsx at 566 LOC (34 margin — monitor)`. Governance debt was reduced, not resolved.
- Share UX is explicitly inconsistent by surface: ranked cards use tap/native share and long-press/copy-link, while business detail shows both buttons. If this was intentional, the packet does not provide the product rule behind it.
- Seed data enrichment via hardcoded opening-hours templates improves completeness but risks fabricating business facts. This is an infra task creating product-facing truthiness risk.
- Scroll-to-focus shipped with a fixed **40px** offset, but the packet cannot justify the number. That reads as implementation-first polish without evidence of device/system UI validation.

## Unclosed action items
- Decide whether anti-requirement removal is final or whether any capability needs preservation as documented stubs/decision records. Right now the packet frames this as unresolved.
- Revalidate reputation weighting after removing `helpful_votes`; the redistribution to `rating_count` and `rating_consistency` is presented as a question, not an evidenced outcome.
- Normalize share behavior across ranked cards and business detail, or explicitly document why the inconsistency should remain.
- Audit seeded opening hours for user-facing labeling/guards so templated hours are not mistaken for verified data.
- Replace or justify the hardcoded 40px scroll offset with device-aware or layout-aware logic.
- Continue monitoring `SubComponents.tsx`; the packet itself flags it as near-limit and not actually closed.

## Core-loop focus score
**4/10**
- Only one sprint is a direct user-facing feature addition (`copy-link`), and even that is a secondary action, not the main ranking/rating loop.
- One UX item (`scroll-to-focus`) supports rating completion, which helps the loop, but it is polish-level impact.
- Two of five sprints were governance cleanup and one was infrastructure seed work; that is a majority of capacity off the core loop.
- The strongest measurable outcomes are architecture/build/schema improvements, not user behavior or loop conversion improvements.
- There is some loop support in seed enrichment and rating-flow scrolling, but the packet provides no evidence of improved ranking, rating completion, sharing usage, or retention.

## Top 3 priorities for next sprint
1. Ship one primary core-loop improvement with measurable impact on ranking, rating completion, or recommendation consumption; stop stacking maintenance sprints without a user outcome.
2. Resolve product inconsistency in sharing and seeded-data truthfulness: unify share interaction rules and clearly distinguish templated hours from verified hours.
3. Close the loose ends from this batch with evidence, not questions: validate reputation weight redistribution, justify/remove the 40px constant, and document the anti-requirement removals as irreversible decisions if that is the intent.

**Verdict:** This sprint set is operationally clean but strategically soft. You removed debt, shrank build/schema surface, and kept the audit grade, but most of the work sat adjacent to the core product loop rather than moving it. The packet also exposes too many “we shipped it, but was this the right choice?” questions after the fact—especially on deletion scope, weight redistribution, seeded hours, and scroll behavior. This looks more like cleanup plus small UX patches than a focused product sprint sequence.
