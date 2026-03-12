# External Critique — Sprints 255-259 External Critique

## Verified wins
- Audit grade held at **A+** across Audit #32 and #33.
- Test suite increased from **5,047 to 5,170** across the block: **+159 tests**, **181 to 185 files**.
- Sprint 256 shipped concrete platform/security work:
  - Raleigh promoted to beta via auto-gate pipeline.
  - `isAdminEmail` consolidation sweep called out as **P1 security fix**.
  - Content-type byte sniffing added for photo uploads.
- Sprint 258 added enforceable schema/documentation integrity checks:
  - all `pgTable` names must appear in `ARCHITECTURE.md`
  - table count validation tests
- Sprint 259 completed real infra movement, not just planning:
  - Redis client/configuration added
  - velocity detection store migrated
  - SSE connection tracking migrated
  - fallback path defined for Redis unavailability

## Contradictions / drift
- **Direct requirements drift in Sprint 257:** review helpfulness voting is explicitly acknowledged as a likely violation of Rating Integrity Part 10 (“NO helpful/not-helpful upvotes”). That is not minor drift; it is shipping against a known rule.
- **Second active violation remains unresolved:** business responses from Sprint 253 still contradict the same Part 10. The issue is compounding, not isolated.
- **Process failure:** a feature that contradicts a documented anti-requirement was still implemented. That means architecture/requirements controls are not actually gating delivery.
- **Core-loop dilution:** this 5-sprint block mixes quarterly review, market beta activation, search suggestions, review voting, schema/doc enforcement, and partial infra migration. Too many directions for a short block.
- **Redis migration is structurally incomplete:** only **2 of 11+** in-memory stores moved. That creates mixed persistence semantics and operational inconsistency without evidence of a full migration plan.
- **Fallback to in-memory on Redis unavailability** weakens the migration story further: resilience improves, but consistency guarantees become conditional and harder to reason about.
- **Test progression table is internally inconsistent:** Sprint 255 summary says **5,047 tests**, but the table lists Sprint 255 delta as **+36** while also starting at **5,047**. That implies an unseen prior baseline and makes the first row non-self-contained.

## Unclosed action items
- Resolve the **two active Part 10 violations**:
  - business responses
  - review helpfulness voting
- Make an explicit decision on exception handling: **remove code, hard-flag it, or amend Part 10**. Current state is indecision with code already present.
- Define a **Redis migration plan** for the remaining **9+** in-memory stores, including whether migration is atomic by domain or incremental by store.
- Clarify the intended **consistency model** when Redis is down and fallback to in-memory occurs.
- Validate whether **documentation-as-code enforcement** around `ARCHITECTURE.md` is meant to be permanent policy or temporary cleanup pressure.
- Clean up the **test count reporting inconsistency** so sprint-to-sprint progress can be audited without inference.

## Core-loop focus score
**4/10**

- There is real shipping, but the block is split across product experiments, governance cleanup, and infra migration.
- A known anti-requirement violation was implemented anyway, which is strong evidence the loop is not disciplined.
- Redis work is only partial, so the block incurs migration complexity without finishing the operational payoff.
- Schema/doc enforcement improves integrity, but it is peripheral to user-value delivery unless tied to recurring failures.
- Security and upload validation work in Sprint 256 are legitimate core quality wins.

## Top 3 priorities for next sprint
1. **Close the Part 10 contradiction decisively.** No more “pending CEO decision” while contradictory code accumulates. Either remove the violating code, keep it fully disabled behind explicit flags, or formally amend the governing document.
2. **Choose and publish a Redis completion strategy.** Enumerate all remaining in-memory stores, define migration order, and specify behavior during Redis outages so the system does not operate with ambiguous guarantees.
3. **Narrow sprint scope to one primary thread.** Stop mixing governance, infra, and product-side experiments in the same short block unless there is a direct dependency chain.

**Verdict:** This block shows output, but control is loose. The biggest issue is not lack of work; it is knowingly shipping against a documented anti-requirement and then leaving the contradiction unresolved while also starting a half-complete Redis migration. The result is a codebase with more capability, but also more policy ambiguity and more operational inconsistency.
