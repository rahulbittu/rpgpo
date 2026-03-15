# Value Gap Analysis (2026-03-15)

## Gap 1: Worker subtasks don't use context
**Current:** Deliberation injects context, but worker.js calls providers with just the subtask prompt — no domain context, no operator priorities, no recent decisions.
**Target:** Every AI call should include relevant context so outputs are specific to Rahul's situation.
**Fix:** Inject context into worker subtask prompts before calling AI providers.
**Effort:** Medium | **Impact:** HIGH

## Gap 2: Research outputs are generic
**Current:** "Research passive income ideas" produces generic framework docs.
**Target:** Specific, cited, actionable research with sources, numbers, and concrete next steps.
**Fix:** Use Perplexity for live research with better prompt engineering; synthesize with OpenAI using Rahul's context.
**Effort:** Medium | **Impact:** HIGH

## Gap 3: News synthesis is template-only
**Current:** News tasks produce template reports with "[Insert Title]" placeholders.
**Target:** Real headlines, real sources, real summaries from today's news.
**Fix:** Ensure Perplexity research subtasks are properly wired with web-search-first prompts; increase output quality instructions.
**Effort:** Low | **Impact:** HIGH

## Gap 4: Operator profile is thin
**Current:** 5 recurring priorities, basic decision style.
**Target:** Rich profile: Rahul's active projects, interests, income goals, career stage, tech stack preferences, communication style.
**Fix:** Seed a richer operator profile that gets injected into all prompts.
**Effort:** Low | **Impact:** HIGH

## Gap 5: No proactive delivery
**Current:** Reports written to disk. Operator has to click through tabs to find them.
**Target:** Activity feed shows completed work. Notifications for important outputs.
**Fix:** Wire task completion into the in-app notification system (Part 73) and activity feed.
**Effort:** Low | **Impact:** MEDIUM

## Gap 6: Too many empty tabs
**Current:** 18+ tabs, most governance/audit tabs show "No data" or empty panels.
**Target:** 6-8 tabs that all have useful content. Hide infrastructure tabs.
**Fix:** Condense navigation. Move governance to admin section. Surface what matters.
**Effort:** Low | **Impact:** MEDIUM

## Gap 7: Next-best-actions are vague
**Current:** Chief of Staff generates priorities but they're generic ("Review mission statements").
**Target:** Specific actions: "Submit 'research passive income SaaS ideas' task" or "Review TopRanker PR #42".
**Fix:** Seed better action templates based on Rahul's actual priorities.
**Effort:** Medium | **Impact:** MEDIUM

## Gap 8: No career/job workflow
**Current:** No engine template for career/job research.
**Target:** "Find data engineering jobs in Austin $180k+" produces real listings with analysis.
**Fix:** Create career research template using Perplexity live search + structured output.
**Effort:** Medium | **Impact:** HIGH

## Priority Ranking
1. Gap 1 (context injection) + Gap 4 (richer profile) — foundation for everything
2. Gap 2 (research quality) + Gap 3 (news quality) — immediate value
3. Gap 5 (proactive delivery) + Gap 7 (better actions) — operator experience
4. Gap 6 (UI cleanup) — polish
5. Gap 8 (career workflow) — new capability
