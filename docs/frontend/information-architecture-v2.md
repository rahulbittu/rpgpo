# GPO Information Architecture v2

## Home

**Purpose:** What matters right now

| Section | Content | Priority |
|---|---|---|
| Status | System health dot + task count | Background |
| Attention | Pending approvals + blockers | P0 — top |
| Running | Current active task | P1 |
| Completed | Recent deliverables (last 5) | P2 |
| Summary | Today stats + AI spend | P3 |
| Activity | Recent events (last 10) | P4 — bottom |

## Work

**Purpose:** Create, track, review work

| View | Content |
|---|---|
| Submit | Task input form + engine selector + templates |
| Queue | Active/queued/recent tasks with status |
| Detail | Task detail + board deliberation + subtask timeline |
| Result | Full output review + download + feedback |

Navigation: Submit ↔ Queue ↔ Detail ↔ Result (linear flow, not separate screens)

## Approvals

**Purpose:** Human decisions needed

| Content |
|---|
| Pending subtask approvals with Approve/Reject/Revise |
| Risk level badges |
| Parent task context |

## Engines

**Purpose:** 15 engine overview + provider health

| Section | Content |
|---|---|
| Engine grid | 15 engines with status + task count |
| Provider status | OpenAI/Perplexity/Gemini health + model info |

## Activity

**Purpose:** Timestamped audit trail

| Content |
|---|
| Events with timestamps |
| Task completions with duration |
| Approvals/rejections |
| Errors with context |

## Settings

**Purpose:** Configure the system

| Section | Content |
|---|---|
| Profile | Operator preferences |
| Providers | API key status + model selection |
| Budget | Daily limits + warnings |
| Theme | Dark/Light toggle |
| System | Version + diagnostics |
