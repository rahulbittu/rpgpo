# SPRINT-205-209 External Critique

## Verified wins
- Arch Audit improved from **A- (#23)** to **A (#24)** with reported **0 critical / 0 high** issues.
- Performance budget logic was consolidated into **`lib/performance-budget.ts`** and a **CI perf validation step** was added.
- Admin analytics functionality expanded with:
  - **60-second dashboard auto-refresh** with toggle
  - **Export endpoint** supporting **JSON + CSV**
  - **Extended CSV** with per-event-type breakdown
- Launch support docs were created:
  - **`docs/APP-STORE-METADATA.md`**
  - **`docs/LAUNCH-CHECKLIST.md`**
  - **`docs/PR-STRATEGY.md`**
- Test suite is still large and green: **3,672 tests across 139 files**, all passing.
- Clean sprint streak and stable `as any` count indicate no obvious regression in code hygiene, though not improvement.

## Contradictions / drift
- **Sprint 208 claims `getBudgetReport` real measurement support, but Known Issues says it is not wired to actual perf measurements.** That is the clearest contradiction in the packet.
- **Sprint 209 added OG image meta tags while the OG image asset does not exist.** This is placeholder launch theater, not completed readiness work.
- **Conditional GO for Sprint 215** conflicts with the stated remaining gaps: **no marketing website**, incomplete OG assets, and perf reporting not actually wired. That is a weak gate unless those are explicit blockers.
- Core product work drifted into **PR strategy, app store metadata, and launch docs** while known implementation debt remains: **redundant in-memory activity tracking** and **`routes-admin.ts` at 627 LOC**.
- **Extended export/reporting/admin features** continue to expand while launch-critical public-facing assets are still missing. That suggests internal tooling is outpacing launch readiness.
- Stable **46 non-test `as any` casts for 10 sprints** is not a win; it indicates a frozen debt floor during a launch push.

## Unclosed action items
- **Wire `getBudgetReport` to actual perf measurements.** Packet explicitly says this is still not done.
- **Create the OG image asset** referenced by `og:image` and `twitter:image`.
- **Build the marketing website.** This is a launch-critical missing deliverable, not a nice-to-have.
- **Remove or consolidate redundant in-memory active user tracking** now that DB-backed activity exists.
- **Split or refactor `server/routes-admin.ts`** before it crosses the threshold from “approaching split” to entrenched blob.
- **Define explicit launch conditions for the Sprint 215 GO/NO-GO.** “Conditional GO” is too vague as stated.
- **Close the loop on the prior critique request for Sprints 201-204** if findings remain open; the packet notes it was filed, not resolved.

## Core-loop focus score
**4/10**

- Some work supports observability and admin insight, but much of the sprint set is **launch-adjacent packaging**, not core product loop improvement.
- **Admin dashboard refresh/export** improves operator tooling, not necessarily user acquisition, activation, retention, or primary user value.
- **Perf budget CI** is good discipline and likely relevant to launch quality.
- Too much effort went to **docs/PR/app-store prep** while core launch blockers remain unfinished.
- The packet shows **execution spread across analytics, perf, metadata, PR, exports, and marketing prep**, which looks fragmented.
- Known issues show unresolved productization gaps despite five sprints of launch-oriented work.

## Top 3 priorities for next sprint
1. **Turn “conditional GO” into a hard launch gate checklist with blockers.** At minimum: functioning perf measurement wiring, real OG asset, marketing site live, app store assets validated, and explicit owner/status per item.
2. **Finish missing launch-critical implementation before adding more admin/marketing surface area.** Specifically: wire `getBudgetReport`, remove redundant activity tracking, and stop shipping placeholders.
3. **Narrow launch marketing scope to one primary channel and ship the website there first.** The current PR strategy likely spreads effort too thin while the basic web presence is still absent.

**Verdict:** The sprint set shows competent execution on tooling and documentation, but too much of it is peripheral. The packet overstates readiness: launch signals are being produced faster than launch blockers are being closed. “Conditional GO” is only defensible if the conditions are explicit and hard; as written, it reads like optimism covering unfinished work.
