# GPO — Governed Personal Office

A privacy-first AI operating system that executes tasks across 15 specialized engines using a multi-agent Board of AI deliberation pattern.

## Quick Start

```bash
cd 04-Dashboard/app
npm install
pm2 start ecosystem.config.js
open http://localhost:3200
```

## How It Works

1. You submit a request (natural language)
2. GPO detects the right engine and routes it
3. A Board of AI deliberates: objective, strategy, risk, subtask plan
4. Providers execute each subtask (web search, synthesis, strategy, code)
5. Output is delivered as a downloadable markdown or JSON file

## 15 Engines

| # | Engine |
|---|--------|
| 1 | Code & Product Engineering |
| 2 | Writing & Documentation |
| 3 | Research & Analysis |
| 4 | Learning & Tutoring |
| 5 | Scheduling & Life Operations |
| 6 | Health & Wellness Coach |
| 7 | Shopping & Buying Advisor |
| 8 | Travel & Relocation Planner |
| 9 | Personal Finance & Investing |
| 10 | Startup & Business Builder |
| 11 | Career & Job Search |
| 12 | Screenwriting & Story Development |
| 13 | Filmmaking & Video Production |
| 14 | Music & Audio Creation |
| 15 | Home & Lifestyle Design |

## Validation

A 360-case test harness was executed across all 15 engines.

| Metric | Result |
|---|---|
| Harness target | 360 cases |
| Unique cases executed | 361 |
| PASS (strict) | 338 (93.6%) |
| PARTIAL | 23 (6.4%) |
| FAIL | 0 |
| Average confidence | 89/100 |

23 PARTIAL cases had anomalies: Perplexity web search returned weak data (18), thin output (1), or multiple issues (4). See `docs/testing/engine-maturity-scoreboard.md`.

## Stack

- **Runtime**: Node.js, TypeScript, raw HTTP server (port 3200)
- **State**: JSON files (no database)
- **UI**: Single-page HTML/CSS/JS dashboard
- **Providers**: OpenAI (synthesis), Perplexity (web search), Gemini (strategy), Claude (code)

## Documentation

- [System Overview](docs/system-overview.md)
- [Repository Map](docs/repo-map.md)
- [Task Lifecycle](docs/task-lifecycle.md)
- [Board of AI Guide](docs/board-of-ai-guide.md)
- [Operator Guide](docs/operator-guide.md)
- [Test Results](docs/testing/engine-maturity-scoreboard.md)
- [How to Review a Test Case](docs/testing/test-review-guide.md)
