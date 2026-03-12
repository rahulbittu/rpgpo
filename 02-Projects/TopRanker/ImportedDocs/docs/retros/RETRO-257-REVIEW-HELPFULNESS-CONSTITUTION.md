# Retrospective: Sprint 257 — Review Helpfulness Voting + Constitution

**Date:** March 9, 2026
**Duration:** 45 minutes
**Story Points:** 13
**Facilitator:** Sarah Nakamura

---

## What Went Well

- **Constitution formalized as `docs/CONSTITUTION.md`** — 82 principles now govern all product decisions, engineering choices, and team conduct. No more implicit rules; everything is written down and referenceable by number.

- **Core loop audit before feature addition** — Constitution #12 ("Audit before you build") was applied in this sprint. The audit surfaced 3 P0 issues before we added the helpfulness voting system, ensuring we know the foundation we're building on.

- **Wilson score pattern cleanly reused from experiment-tracker** — Sarah's implementation in `server/review-helpfulness.ts` reused the proven Wilson score lower bound math from `server/experiment-tracker.ts`. Same statistical rigor, different domain. No new dependencies, no new risk.

- **Marketing and Rating Integrity docs saved to `docs/architecture/`** — Strategy documents that previously lived outside the repo are now versioned, reviewable, and linked from ARCHITECTURE.md. The Indian Dallas First GTM plan and the anti-gaming layered defense spec are now first-class project artifacts.

- **Helpfulness voting strengthens the core loop** — The `helpful_votes` signal (weight 0.10) in reputation-v2 creates a measurable feedback mechanism: helpful reviewers gain credibility, which increases their ranking influence. Constitution #64 delivered.

- **7 clean API endpoints** — Standard REST patterns, full test coverage, consistent with existing route conventions.

---

## What Could Improve

- **P0 audit findings must be fixed BEFORE more features** — Confidence not in API, tier namespace collision, and ARCHITECTURE.md schema drift are structural issues. Sprint 258 must be a fix-first sprint. No new features until these are resolved.

- **Sprint 257 added features AND docs simultaneously** — The helpfulness voting system and the three governing documents should have been separate commits for clarity. When reviewing git history, it's hard to distinguish "new feature" from "documentation formalization." Future sprints should separate feature work from documentation saves.

- **Constitution adoption needs team-wide walkthrough** — Saving 82 principles to a file is not the same as the team internalizing them. Jordan Blake is right that every engineer should be able to articulate why these principles matter. A file is not adoption; a walkthrough is.

- **Core loop audit should have been its own sprint** — The audit identified real issues, but combining it with feature delivery means the audit findings compete for attention with the new helpfulness system. Audits deserve their own sprint focus.

---

## Action Items

- [ ] **Fix P0: Add `confidenceLevel` to API responses** (leaderboard, search, business endpoints) — Sprint 258 — **Sarah Nakamura**
- [ ] **Fix P0: Resolve tier namespace collision** (reputation-v2 6-tier vs production 4-tier) — Sprint 258 — **Amir Patel**
- [ ] **Fix P0: Update ARCHITECTURE.md schema section** (4 missing tables) — Sprint 258 — **Marcus Chen**
- [ ] **Schedule Constitution walkthrough with full team** — Sprint 259 — **Jordan Blake**

---

## Team Morale

**8/10** — Constitution adoption gives the team clarity on what we're building and why. The audit findings give direction rather than anxiety — we know exactly what's broken and who's fixing it. The helpfulness voting system is a tangible, math-backed feature that everyone can point to as "this is what TopRanker does differently." Energy is high, focus is sharp, and the P0 list is short and actionable.
