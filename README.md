# GPO — Governed Personal Office

A privacy-first AI operating system for one operator. 15 specialized engines, governed execution pipeline, behavior learning that gets smarter over time.

## What GPO Does

You give GPO a request in plain language. GPO:

1. **Routes** it to the right engine (finance, career, health, travel, etc.)
2. **Deliberates** via a Board of AI (3 perspectives analyze the request)
3. **Plans** subtasks (web search → synthesis → deliverable)
4. **Executes** using AI providers (Perplexity for search, OpenAI for synthesis, Gemini for strategy)
5. **Delivers** a structured output file (markdown or JSON)

Everything runs locally. No data leaves your machine except API calls to providers.

## Quick Start

```bash
cd 04-Dashboard/app
npm install
node server.js &     # HTTP server on port 3200
node worker.js &     # Background task processor
open http://localhost:3200
```

Required: API keys in `04-Dashboard/app/.env`:
```
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
GEMINI_API_KEY=AIza...
```

## 15 Engines

| Engine | What It Handles |
|---|---|
| Code & Product Engineering | Architecture, deployment, infrastructure |
| Writing & Documentation | Guides, specs, SOPs, creative writing |
| Research & Analysis | Product comparisons, market analysis, deep dives |
| Learning & Tutoring | Technical explanations, how things work |
| Scheduling & Life Operations | Routines, productivity, organization |
| Health & Wellness Coach | Fitness, nutrition, mobility, sleep |
| Shopping & Buying Advisor | Product research, comparisons, reviews |
| Travel & Relocation Planner | Trip planning, itineraries, logistics |
| Personal Finance & Investing | Tax strategy, retirement, investing, insurance |
| Startup & Business Builder | Business strategy, product development |
| Career & Job Search | Job search, negotiation, leadership growth |
| Screenwriting & Story Development | Creative concepts, series bibles, game design |
| Filmmaking & Video Production | Documentary, video essay concepts |
| Music & Audio Creation | Musical concepts, audio production |
| Home & Lifestyle Design | Home improvement, garden, DIY |

## How It's Built

| Component | What It Is |
|---|---|
| `04-Dashboard/app/server.js` | HTTP server — API routes, SSE events, static files |
| `04-Dashboard/app/worker.js` | Background processor — executes tasks via AI providers |
| `04-Dashboard/app/lib/deliberation.ts` | Board of AI — analyzes requests, plans subtasks |
| `04-Dashboard/app/lib/behavior.ts` | Behavior learning — captures events, derives operator signals |
| `04-Dashboard/app/lib/intake.ts` | Task creation + domain routing |
| `04-Dashboard/app/lib/workflow.ts` | Subtask state machine + deliverable generation |
| `04-Dashboard/state/` | JSON state files (tasks, subtasks, costs, signals) |
| `artifacts/behavior/` | Behavior learning data (events, signals, preferences) |

## Current State

| Metric | Value |
|---|---|
| Total tasks executed | 1,316 |
| Successfully completed | 1,264 (96%) |
| Behavior signals | 26 (10 live_observed, 13 seeded, 3 explicit_profile) |
| Engine attribution | Improved routing — reduced general catch-all from 76% to <10% on new tasks |
| Consecutive clean batches | 50+ |

## Key Principles

1. **Reliability beats autonomy theater** — predictable execution over impressive demos
2. **Only automate what is understood** — AI assists, human judges where risk is high
3. **Memory reduces friction, not creates false certainty** — conservative behavior learning
4. **Hunt for why it fails, not just proof it works** — honest evidence system

See [Operating Doctrine](docs/product/gpo-operating-doctrine.md).

## Documentation

| If you want to... | Read this |
|---|---|
| Understand the full system | [System Overview](docs/system-overview.md) |
| Navigate the repository | [Repo Map](docs/repo-map.md) |
| Understand task execution | [Task Lifecycle](docs/task-lifecycle.md) |
| Understand behavior learning | [Behavior Learning](docs/behavior-learning.md) |
| Understand governance | [Human Control Boundaries](docs/governance/human-control-boundaries.md) |
| Review test results | [Validation Scoreboard](docs/testing/engine-maturity-scoreboard.md) |
| See all docs | [Documentation Index](docs/README.md) |
