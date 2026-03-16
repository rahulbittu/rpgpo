# GPO Task Lifecycle

## The Full Journey of a Task

When you submit a request to GPO, it goes through a governed pipeline:

```
Submit → Route → Deliberate → Plan → Execute → Deliver → Export
```

### 1. Submit

You type a request in the dashboard (or call the API):
> "Create a comprehensive guide to Roth conversion ladder strategies for early retirees"

The system creates an intake task with your raw request, priority, and timestamp.

### 2. Route

GPO's domain router scores your request against keyword patterns for all 15 engines. It picks the best match:
- "Roth conversion" → matches `wealthresearch` keywords (retirement, tax, Roth IRA)
- Confidence: 0.7 (strong match)

If no keywords match, the task goes to `general`. Recent routing improvements reduced the general catch-all rate from 76% to <10% on new tasks.

### 3. Deliberate

The Board of AI (powered by OpenAI GPT-4o) analyzes your request from three perspectives:

| Perspective | What It Does |
|---|---|
| **Chief of Staff** | Interprets the objective, assesses feasibility, identifies what needs your input |
| **Critic** | Challenges assumptions, identifies risks and unknowns |
| **Domain Specialist** | Proposes the specific technical/strategic approach |

The Board produces a JSON plan including:
- Interpreted objective
- Recommended strategy
- Risk level (green/yellow/red)
- Subtask breakdown

**Behavior context injection:** The Board also receives your learned preferences (communication style, output format preferences) to shape the plan to your style.

### 4. Plan

The deliberation outputs a set of subtasks, typically:
1. **Research subtask** (Perplexity) — search the web for current data
2. **Synthesis subtask** (OpenAI) — combine research into structured output

Each subtask includes:
- Provider assignment
- Specific prompt
- Expected output format
- Risk level
- Whether approval is required

### 5. Execute

The background worker processes subtasks sequentially:

| Provider | Role | Example |
|---|---|---|
| **Perplexity Sonar** | Web search | "Search for current Roth conversion rules, SECURE Act changes, tax bracket data" |
| **OpenAI GPT-4o** | Synthesis | "Based on the research, create a structured guide with specific strategies and calculations" |
| **Gemini Flash** | Strategy | "Provide strategic comparison of conversion approaches" |
| **Claude** | Code | "Modify the TypeScript file to add this feature" (only for code tasks) |

Later subtasks receive output from earlier ones, so the synthesis builds on actual research data.

### 6. Deliver

When all subtasks complete:
- Outputs are combined into a deliverable markdown file
- A notification is sent to the dashboard
- A behavior event (`output_accepted`) is recorded for learning

### 7. Export

You can download the deliverable:
- `GET /api/intake/task/:id/export?fmt=md` — Markdown
- `GET /api/intake/task/:id/export?fmt=json` — Structured JSON

## Governance Rules

| Risk Level | What Happens |
|---|---|
| **Green** | Auto-executes, no approval needed |
| **Yellow** | Executes but flagged for review |
| **Red** | Requires explicit operator approval before execution |

Non-code tasks (writing, research, analysis) default to green risk with auto-execution.
Code tasks (file modifications) require approval because they change the repository.

## Provider Fallback

If a provider fails:
- Perplexity failure → falls back to OpenAI for search
- Gemini failure → falls back to OpenAI for strategy
- All failures logged in cost tracker with error details
