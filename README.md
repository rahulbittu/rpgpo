# GPO — Governed Personal Office

A privacy-first, AI-powered personal operating system with governed multi-agent execution across 15 specialized engines.

## Quick Start

```bash
cd 04-Dashboard/app
npm install
pm2 start ecosystem.config.js
open http://localhost:3200
```

## Architecture

GPO uses a **Board of AI** deliberation pattern: tasks are submitted, analyzed by AI from three perspectives (Chief of Staff, Critic, Domain Specialist), broken into provider-specific subtasks, and executed with governance gates.

**Stack**: Node.js + TypeScript + JSON file state | **UI**: Dashboard at localhost:3200

## 15 Engines

| Engine | Domain ID |
|---|---|
| Code & Product Engineering | `startup` |
| Writing & Documentation | `writing` |
| Research & Analysis | `research` |
| Learning & Tutoring | `learning` |
| Scheduling & Life Operations | `personalops` |
| Health & Wellness Coach | `health` |
| Shopping & Buying Advisor | `shopping` |
| Travel & Relocation Planner | `travel` |
| Personal Finance & Investing | `wealthresearch` |
| Startup & Business Builder | `topranker` |
| Career & Job Search | `careeregine` |
| Screenwriting & Story Development | `screenwriting` |
| Filmmaking & Video Production | `founder2founder` |
| Music & Audio Creation | `music` |
| Home & Lifestyle Design | `home` |

## Validation Results

360-case test harness executed across all 15 engines:

| Metric | Result |
|---|---|
| Canonical cases | 361 |
| **PASS** | **360 (99.7%)** |
| PARTIAL | 1 (0.3%) |
| FAIL | 0 |
| L1 (Prompt Pass) | 99.7% |
| L2 (Context Pass) | 99.7% |
| Avg Confidence | 90/100 |

See `docs/testing/engine-maturity-scoreboard.md` for details.

## Repository Structure

See `docs/repo-map.md` for the complete directory map.

## Documentation

| Document | Purpose |
|---|---|
| [System Overview](docs/system-overview.md) | Architecture and components |
| [Repo Map](docs/repo-map.md) | Directory structure |
| [Task Lifecycle](docs/task-lifecycle.md) | Request → execution flow |
| [Board of AI Guide](docs/board-of-ai-guide.md) | Deliberation process |
| [Operator Guide](docs/operator-guide.md) | How to use GPO |
| [Test Results](docs/testing/engine-maturity-scoreboard.md) | Validation scoreboard |
| [Review Guide](docs/testing/test-review-guide.md) | How to review test cases |

## Providers

| Provider | Role | Model |
|---|---|---|
| OpenAI | Synthesis, reports | gpt-4o |
| Perplexity | Web search, research | sonar |
| Gemini | Strategy, comparison | gemini-2.5-flash-lite |
| Claude | Code implementation | claude (local CLI) |

## Principles

- Board of AI deliberation before execution
- Privacy-first: tenant isolation, project isolation
- Governed execution with approval gates
- Evidence-driven development via test harness
- Operator is final authority
