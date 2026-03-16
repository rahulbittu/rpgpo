# GPO System Overview

## What is GPO?

GPO (Governed Personal Office) is a privacy-first AI operating system that uses a Board of AI deliberation pattern to execute tasks across 15 specialized engines.

## How It Works

```
User submits request → Domain routing → Board of AI deliberation →
Subtask plan → Provider execution (OpenAI/Perplexity/Gemini/Claude) →
Output synthesis → Deliverable saved → Operator notified
```

## Architecture

- **Runtime**: Node.js + TypeScript + raw HTTP server
- **State**: JSON file-based (no database required)
- **UI**: Single-page HTML/CSS/JS dashboard at localhost:3200
- **Worker**: Background task processor (PM2 managed)
- **Providers**: OpenAI (synthesis), Perplexity (web search), Gemini (strategy), Claude (code)

## Key Components

| Component | Location | Purpose |
|---|---|---|
| Server | `04-Dashboard/app/server.js` | HTTP API + SSE events |
| Worker | `04-Dashboard/app/worker.js` | Background task execution |
| Board of AI | `04-Dashboard/app/lib/deliberation.ts` | Task analysis + planning |
| Workflow | `04-Dashboard/app/lib/workflow.ts` | Subtask orchestration |
| Intake | `04-Dashboard/app/lib/intake.ts` | Task creation + domain detection |
| Engines | `04-Dashboard/app/lib/engines.ts` | 15 engine definitions |
| Behavior | `04-Dashboard/app/lib/behavior.ts` | Operator behavior learning |
| Dashboard | `04-Dashboard/app/index.html` | Operator UI |

## 15 Engines

1. Code & Product Engineering
2. Writing & Documentation
3. Research & Analysis
4. Learning & Tutoring
5. Scheduling & Life Operations
6. Health & Wellness Coach
7. Shopping & Buying Advisor
8. Travel & Relocation Planner
9. Personal Finance & Investing
10. Startup & Business Builder
11. Career & Job Search
12. Screenwriting & Story Development
13. Filmmaking & Video Production
14. Music & Audio Creation
15. Home & Lifestyle Design
