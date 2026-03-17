# GPO Frontend V2 — Execution State Model

## Operator-Facing States

The user should never see internal status names. Map backend states to operator language:

| Backend Status | Operator Label | Visual | Message |
|---|---|---|---|
| intake | Submitted | Dot (gray) | "Request received" |
| deliberating | Planning | Dot (blue, pulse) | "Analyzing your request..." |
| planned | Ready | Dot (blue) | "Plan ready — executing..." |
| executing | Working | Dot (yellow, pulse) | "Working on it..." |
| waiting_approval | Needs Review | Dot (orange, pulse) | "Needs your approval" |
| done | Complete | Dot (green) | "Done ✓" |
| failed | Issue | Dot (red) | "Encountered an issue" |

## Live Progress Panel

When a task is executing, show a live progress panel:

```
┌─────────────────────────────────────────────────┐
│ ● Working on: "best waffle places in Hyderabad" │
│                                                 │
│ Step 1 ✓  Searching the web          0:04       │
│ Step 2 ●  Analyzing results          0:12       │
│ Step 3 ○  Writing recommendations    —          │
│                                                 │
│ Engine: Research & Analysis                     │
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░ 2/3 steps                │
└─────────────────────────────────────────────────┘
```

## Subtask → Step Mapping

Translate internal subtask terminology to operator language:

| Subtask Stage | Operator Label |
|---|---|
| research | "Searching the web" |
| report | "Writing the response" |
| strategy | "Analyzing and comparing" |
| implement | "Making changes" |
| audit | "Reviewing quality" |
| locate_files | "Finding relevant files" |

| Subtask Provider | Operator Label |
|---|---|
| perplexity | "Web search" |
| openai | "AI synthesis" |
| gemini | "Strategic analysis" |
| claude | "Code execution" |

## Error Translation

Never show raw error messages. Translate:

| Internal Error | Operator Message |
|---|---|
| `You exceeded your current quota` | "API limit reached. Waiting to retry." |
| `timeout` | "Taking longer than expected. Still working." |
| `ECONNREFUSED` | "Connection issue. Retrying." |
| `No content in response` | "Received an empty response. Trying again." |
| Any unknown error | "Encountered an issue. You can retry." |

## Polling Strategy

- Poll task status every 3 seconds while executing
- Stop polling when status is done/failed
- Never re-render the full page on poll — update progress panel only
- Never scroll on poll update
- Single completion notification (toast), never repeated
