# GPO Command Center

A privacy-first, governed personal AI operating system.

## Quick Start

```bash
cd 04-Dashboard/app
node server.js    # Start server on port 3200
node worker.js    # Start background task worker
```

Open **http://localhost:3200** in your browser.

## Features

### Core Pipeline
- **Zero-click research**: Submit → Auto-deliberate → Auto-approve → Execute → Report
- **Multi-provider AI**: OpenAI (GPT-4o), Perplexity (web search), Gemini (strategy)
- **Context injection**: Every AI call includes operator profile + domain context
- **Subtask output chaining**: Synthesis sees research data from prior steps

### Task Templates (12 built-in)
- Passive Income Ideas, Side Project Ideas
- Data Engineering Jobs, Career Growth Plan
- AI News Today, Startup News, Tech Industry
- TopRanker Build, TopRanker Strategy
- Weekly Plan, Quick Research

### Engines
- **Research & Analysis** — Evidence-based research with citations
- **News & Intelligence** — Current news with Perplexity web search
- **Income & Wealth** — Passive income opportunity discovery
- **Career & Growth** — Job market and career intelligence
- **Planning & Strategy** — Decision support and action planning
- **TopRanker** — Flagship mission: community business leaderboard

### Advanced
- **Compound Workflows**: Multi-engine DAG execution (Research → Analyze → Plan)
- **Recurring Scheduler**: Cron-like task scheduling
- **Persistent Learning**: Provider performance tracking across sessions
- **Task Chaining**: Automatic follow-up tasks on completion
- **Integration Gateway**: Inbound/outbound webhooks
- **State Backup**: Atomic snapshots + export/import
- **Analytics**: Productivity metrics, cost trends, value insights

### API

| Category | Endpoints |
|----------|-----------|
| Tasks | `/api/intake/submit`, `/api/intake/run`, `/api/intake/tasks` |
| AI | `/api/chief-of-staff/brief`, `/api/final-output/:id` |
| Analytics | `/api/analytics/summary`, `/api/analytics/cost-trend` |
| Health | `/api/health`, `/api/health/repair`, `/api/onboarding` |
| Templates | `/api/templates`, `/api/compound-workflows/templates` |
| Schedules | `/api/schedules` |
| Learning | `/api/learning/meta`, `/api/learning/knowledge` |
| Backup | `/api/backup/snapshot`, `/api/backup/verify` |
| Reports | `/api/reports` |

### Keyboard Shortcuts
- **/** — Quick-focus task form from any tab

## Architecture
- 142+ TypeScript modules
- 960+ API routes
- File-based JSON state (no database required)
- Privacy-first: deep redaction, tenant isolation, secret governance

## Requirements
- Node.js 20+
- API keys: OpenAI, Perplexity (optional), Gemini (optional)
