# GPO/RPGPO Review Package for ChatGPT (2026-03-15)

## Current Reality
- 117+ TS modules, 860+ API routes, 530+ types, 297 tests
- File-backed JSON state, single-user (Rahul), locally-run Node.js server
- Working pipeline: intake → AI deliberation → subtask execution → output artifacts
- 3 AI providers: OpenAI (gpt-4o), Perplexity (sonar), Gemini (flash)
- 1,967 subtask executions, 800+ cost records, real $ spend

## What's Working
- Task submission + AI-powered planning/breakdown
- Multi-provider execution with cost tracking
- Context storage per domain/mission
- TopRanker flagship engine with source repo integration
- Dashboard UI with 15+ tabs
- Structured output pipeline (Parts 67-68)
- Parallel execution engine (Part 70)
- Workflow orchestrator with 14-stage state machine (Part 71)

## What's Weak
1. **Worker prompts don't include context** — AI calls are context-free, producing generic outputs
2. **Operator profile is thin** — 5 priorities, no depth on goals/interests/projects
3. **Research outputs are templates** — No live data, no citations, no actionable specifics
4. **News synthesis fails** — Produces "[Insert Title]" placeholders instead of real news
5. **Reports sit on disk** — No proactive delivery to operator
6. **18+ tabs, most empty** — Governance infrastructure overwhelms user-facing value
7. **No career/job/income workflows** — The things Rahul actually needs

## What Gives Value Now
- Structured task breakdown (Board deliberation is excellent)
- Provider routing (right model for right task)
- Cost visibility (know what you're spending)
- Context persistence (decisions and artifacts tracked across sessions)
- TopRanker build adapter (dry-run build pipeline)

## Top Risks
1. **Complexity outrunning value** — 117 modules but outputs are generic
2. **Architecture addiction** — Each ChatGPT handoff produces more infrastructure, not more value
3. **No real-time data** — LLMs work from training data; Perplexity helps but isn't fully leveraged
4. **Worker context gap** — The single biggest fix (inject context into prompts) hasn't been done
5. **UI overload** — Governance tabs that show nothing distract from functional features

## Top 5 Next Implementation Moves
1. **Inject domain context + operator profile into every worker subtask prompt** (touches: worker.js, deliberation.ts)
2. **Seed rich operator profile** (touches: state/context/operator-profile.json)
3. **Improve Perplexity research prompts** to produce cited, specific outputs (touches: ai.ts, deliberation.ts)
4. **Wire task completion → in-app notifications + activity feed** (touches: worker.js, in-app-notifications.ts)
5. **Create career/income research templates** (touches: engines.ts, intake.ts)

## Questions for ChatGPT Review
1. Given the infrastructure depth (117 modules), what's the most efficient way to make research tasks produce specific, actionable outputs instead of generic templates?
2. Should I create dedicated engine templates for "career research" and "income research" or handle them through the general engine with better prompts?
3. The worker.js calls AI providers without domain context. What's the cleanest way to inject context without breaking the existing execution flow?
4. The UI has 18 tabs. What should the simplified tab structure look like for a single-user operator console?
5. Is the file-based state system adequate for the next 6 months, or should I plan a SQLite migration now?
