# GPO Architecture

## What is GPO?

**Govern Private Office** — a privacy-first AI operating system for running a personal or professional private office. GPO orchestrates multiple AI agents, manages workflows, enforces privacy policies, and provides a calm operator experience.

**RPGPO** is the first configured instance (Rahul Pitta's GPO).

## System Layers

```
┌─────────────────────────────────────────┐
│           Operator Product Layer        │  ← Dashboard, Needs Operator, Live Feed
├─────────────────────────────────────────┤
│        Governed Autonomy Layer          │  ← Auto-continue, blockers, loops
├─────────────────────────────────────────┤
│          Context Engine                 │  ← Decisions, artifacts, patterns
├─────────────────────────────────────────┤
│       Workflow / Board / Builder        │  ← Task lifecycle, 4-agent board, code execution
├─────────────────────────────────────────┤
│    Privacy / Policy / Plans             │  ← Redaction, isolation, plan enforcement
├─────────────────────────────────────────┤
│       Instance / Provisioning           │  ← GPO instance model, lifecycle
├─────────────────────────────────────────┤
│    Providers / Agents / Capabilities    │  ← Claude, OpenAI, Gemini, Perplexity
├─────────────────────────────────────────┤
│        Typed Core (TypeScript)          │  ← types.ts, state-machine, validate
└─────────────────────────────────────────┘
```

## Module Map

| Module | Purpose | Layer |
|--------|---------|-------|
| `types.ts` | All domain types (1200+ lines) | Core |
| `state-machine.ts` | Task/subtask state transitions | Core |
| `validate.ts` | Runtime validation for all data | Core |
| `instance.ts` | GPO instance model | Instance |
| `plans.ts` | Product plan/tier enforcement | Instance |
| `provisioning.ts` | Instance lifecycle management | Instance |
| `privacy.ts` | Redaction, isolation, access control | Privacy |
| `missions.ts` | Mission plugin framework | Missions |
| `rpgpo-missions.ts` | RPGPO instance missions | Missions |
| `capabilities.ts` | Capability/skill registry | Capabilities |
| `ai.ts` | Provider API calls | Providers |
| `agents.ts` | Agent interop registry | Agents |
| `board.ts` | Real 4-agent board deliberation | Board |
| `deliberation.ts` | Single-agent deliberation (legacy) | Workflow |
| `workflow.ts` | Task state machine, continuation | Workflow |
| `intake.ts` | Task/subtask CRUD | Workflow |
| `queue.ts` | Worker task queue | Workflow |
| `context.ts` | Context engine — decisions, artifacts | Context |
| `context-updater.ts` | Auto-update pipeline | Context |
| `autonomy.ts` | Governed auto-continue, blockers | Autonomy |
| `loops.ts` | Mission loop health tracking | Autonomy |
| `notifications.ts` | Notification hooks | Notifications |
| `gitops.ts` | Git state, release summaries | GitOps |
| `costs.ts` | Cost ledger, budget enforcement | Costs |
| `events.ts` | SSE broadcast hub | Events |
| `files.ts` | File I/O, mission parsing | Persistence |
| `repo-scanner.ts` | Repo grounding for code tasks | Grounding |
| `system-map.ts` | Visual system map data | Dashboard |
| `activity.ts` | Structured event constructors | Events |

## Data Flow

```
Operator submits task
  → Intake creates task record
  → Board of AI deliberates (4 agents)
  → Workflow materializes subtasks
  → Operator approves plan
  → Worker executes subtasks
    → Green stages auto-continue
    → Yellow/red stages stop for approval
    → Builder (Claude) writes code → stops for review
  → Operator approves/rejects/revises
  → Workflow continues to next subtask
  → Context engine records decisions, artifacts, patterns
  → Task completes
```

## Privacy Architecture

- All data is instance-scoped
- Providers see only what their privacy scope allows
- Redaction applied before any external call
- Mission isolation prevents data leakage between domains
- Export/import is policy-gated
- Secret scope is always `env` (no secrets in state files)
