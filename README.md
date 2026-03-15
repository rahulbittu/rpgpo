# GPO — Governed Personal Office

A privacy-first, AI-powered personal operating system with governed multi-agent execution.

## Architecture

GPO uses a Board of AI deliberation pattern: tasks are submitted, deliberated by AI (OpenAI, Perplexity, Gemini), broken into subtasks, and executed with governance gates.

**Stack:** Node.js + TypeScript + JSON file-based state | **UI:** Raw HTML/JS dashboard at localhost:3200

## 15 Engines

| # | Engine | Domain ID | Status |
|---|--------|-----------|--------|
| 1 | Code & Product Engineering | `startup` | Active |
| 2 | Writing & Documentation | `writing` | Active |
| 3 | Research & Analysis | `research` | Active |
| 4 | Learning & Tutoring | `learning` | Active |
| 5 | Scheduling & Life Operations | `personalops` | Active |
| 6 | Health & Wellness Coach | `health` | Active |
| 7 | Shopping & Buying Advisor | `shopping` | Active |
| 8 | Travel & Relocation Planner | `travel` | Active |
| 9 | Personal Finance & Investing | `wealthresearch` | Active |
| 10 | Startup & Business Builder | `topranker` | Active |
| 11 | Career & Job Search | `careeregine` | Active |
| 12 | Screenwriting & Story Development | `screenwriting` | Active |
| 13 | Filmmaking & Video Production | `general` | Blocked (no video gen) |
| 14 | Music & Audio Creation | `music` | Blocked (no audio gen) |
| 15 | Home & Lifestyle Design | `personalops` | Active |

## Directory Structure

```
/
├── 00-Governance/       — Governance policies, constitution
├── 01-Inbox/            — Incoming work items
├── 02-Projects/         — Project-specific contexts
├── 03-Operations/       — Reports, logs, briefs, templates
├── 04-Dashboard/        — GPO Command Center (server + UI + worker)
│   ├── app/             — Application code
│   │   ├── server.js    — HTTP server (raw Node.js, port 3200)
│   │   ├── worker.js    — Background task worker
│   │   ├── lib/         — 275 TypeScript modules
│   │   ├── index.html   — Dashboard UI
│   │   ├── app.js       — Frontend logic
│   │   └── operator.js  — Operator product layer
│   └── state/           — JSON file-based state store
├── artifacts/           — Testing artifacts
│   └── testing/         — Execution results, gap classification
├── docs/                — Documentation
│   ├── testing/         — Test harness, scoreboard
│   └── handoff/         — Claude↔ChatGPT handoff contract
└── .gpo-handoff/        — Agent handoff relay system
```

## Running

```bash
cd 04-Dashboard/app
npm install
pm2 start ecosystem.config.js   # Starts server + worker
```

Dashboard: http://localhost:3200

## Validation Status

- **130+ test cases executed** across all 15 engines
- **96% Level 1 pass** (prompt answering)
- **80% Level 2 pass** (contextual awareness)
- **10 gaps classified, 8 fixed**

See `docs/testing/engine-maturity-scoreboard.md` for details.

## Providers

| Provider | Use | Model |
|----------|-----|-------|
| OpenAI | Synthesis, analysis, report generation | gpt-4o |
| Perplexity | Web search, live research | sonar |
| Gemini | Strategy, comparison | gemini-2.5-flash-lite |
| Claude | Code implementation (local CLI) | claude |

## Principles

- Board of AI deliberation before execution
- Privacy-first: tenant isolation, project isolation
- Governed execution with approval gates
- Operator (Rahul) is final authority
- Evidence-driven development via test harness
