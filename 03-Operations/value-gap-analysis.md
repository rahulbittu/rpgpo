# Value Gap Analysis (2026-03-15) — Updated After Sprint

## Gap 1: Worker subtasks don't use context — CLOSED
**Status:** Fixed. Worker injects operator profile (name, role, priorities, output preferences) + domain context (mission context, recent decisions, constraints) into every subtask prompt.

## Gap 2: Research outputs are generic — IMPROVED
**Status:** Significantly improved. Perplexity search instructions now require specific names, numbers, dates, URLs, and sources. OpenAI synthesis instructions require using prior subtask data as primary source. Search recency now contextual (day for news, month for research). Max tokens increased (4000 for Perplexity, 3000 for OpenAI). Domain context enriched for newsroom, career, wealth, and planning engines.

## Gap 3: News synthesis is template-only — CLOSED
**Status:** Fixed. End-to-end pipeline verified working. Perplexity uses 'day' recency for news. System prompt explicitly forbids placeholder text.

## Gap 4: Operator profile is thin — CLOSED
**Status:** Rich profile with: professional context (role, expertise, years, location, target salary), active projects, career goals, output preferences, interests, and custom notes. Auto-injected into all prompts.

## Gap 5: No proactive delivery — CLOSED
**Status:** Fixed with multiple layers:
- Task completion notifications via in-app-notifications
- Intake file watcher (2s polling) broadcasts SSE events on status changes
- Activity feed shows real-time task completion events
- Deliverable files auto-generated on task completion
- Home dashboard shows "Recent Deliverables" panel with output previews
- Home dashboard shows "Notifications" panel with dismissable items

## Gap 6: Too many empty tabs — CLOSED
**Status:** Sidebar reduced from 17 to 13 tabs. Governance, Releases, Audit, Admin moved to Operations tab's "System Panels" section.

## Gap 7: Next-best-actions are vague — CLOSED
**Status:** Fixed with:
- One-click action buttons on every Chief of Staff action
- Proactive suggestion grid when queue is clear (5 specific one-click tasks)
- Time-aware suggestions (morning vs afternoon vs evening)
- quickRunTask() function for instant submission without forms
- Template cards have "Run" button on hover for instant execution

## Gap 8: No career/job workflow — CLOSED
**Status:** 4 career templates: Data Eng Jobs $180k+, Career Growth Plan, Interview Prep, Salary Benchmark. Quick actions include job search and salary benchmark. Domain routing consolidated (career → careeregine alias). Operator profile includes target salary and location.

## Additional Improvements Made
- **Scroll jump fix:** Debounced intake-update SSE handler (3s), task status dedup prevents toast spam
- **Domain routing:** Consolidated career/careeregine, finance/wealthresearch aliases
- **Deliverables system:** Auto-generates combined output files, API endpoint (/api/task-outputs), retroactively generated 23 deliverable files
- **Output viewing:** "Show Full Output" expandable in task timeline, markdown rendering in Ask AI channel
- **TopRanker quick actions:** Competitive Analysis and GTM Strategy one-click tasks
- **Polling optimization:** Reduced approval polling from 4s to 8s (SSE handles real-time)
- **Pre-existing TS errors fixed:** deliberation.ts, scheduler.ts, workflow-orchestrator.ts

## Remaining Opportunities
1. **Search index** — Full-text search across deliverables and reports
2. **Follow-up suggestions** — Auto-suggest related tasks when one completes
3. **Recurring tasks** — Schedule daily news briefs, weekly career updates
4. **Output quality scoring** — Rate AI outputs and feed back to improve prompts
5. **Mobile optimization** — Dashboard responsive improvements
