# GPO Component Index

## Runtime Components

### Server (`server.js` — ~4100 lines)
The HTTP server handles all API routes, SSE events, and static file serving.
- Runs on port 3200
- Raw Node.js HTTP (no Express)
- ~860 API routes
- SSE event broadcasting for real-time dashboard updates
- File watchers for task queue and intake state changes

### Worker (`worker.js` — ~1200 lines)
Background task processor that polls the queue and executes tasks.
- Polls every 2 seconds
- Handles task types: deliberate, execute-subtask, board-run, ai-channel
- Provider fallback (Perplexity → OpenAI, Gemini → OpenAI)
- Stuck task recovery on startup
- Builder execution for code tasks (Claude CLI)

### Dashboard (`index.html` + `app.js` + `operator.js`)
Single-page application for operator interaction.
- `index.html`: Page structure and navigation
- `app.js`: Core logic, SSE handling, task rendering, search
- `operator.js`: Admin features, templates, mission statements, Chief of Staff

## Core Pipeline

```
Intake → Domain Router → Board Deliberation → Workflow → Worker → Providers → Output
```

| Step | Module | What It Does |
|---|---|---|
| Task creation | `intake.ts` | Creates tasks, detects domain, stores in JSON |
| Domain routing | `domain-router.ts` | Scores keywords to find best engine |
| Deliberation | `deliberation.ts` | Calls OpenAI to produce subtask plan |
| Workflow | `workflow.ts` | Manages subtask state machine, auto-continues |
| Execution | `worker.js` | Calls AI providers for each subtask |
| Output | `workflow.ts` | Saves deliverables, emits notifications |

## State Management

All state is stored as JSON files in `04-Dashboard/state/`:
- `intake-tasks.json` — All submitted tasks
- `subtasks.json` — All subtasks
- `tasks.json` — Worker queue
- `costs.json` — API cost ledger
- `deliverables/` — Completed task output files
- `context/operator-profile.json` — Operator preferences

## AI Providers

| Provider | Module | Used For |
|---|---|---|
| OpenAI | `ai.ts` | Synthesis, deliberation, reports |
| Perplexity | `ai.ts` | Web search, live research |
| Gemini | `ai.ts` | Strategic comparison |
| Claude | `worker.js` (builder) | Code implementation |
