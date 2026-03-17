# GPO Frontend V2 — Product Experience

## Core Experience

When the operator asks GPO something — "best waffle places in Hyderabad" — the product should:

1. **Accept** the request cleanly
2. **Show live progress** in operator language ("Searching the web..." → "Synthesizing results..." → "Done")
3. **Present results richly** — not a raw text dump but structured cards with sources, evidence, downloads
4. **Offer actions** — download, re-run, rate, share
5. **Never expose internal errors** — "grounding ripper failed" must become "Research step encountered an issue. Retrying."

## Screen Model

| Screen | What It Does | Primary Action |
|---|---|---|
| **Home** | What needs attention, what's new, what's next | Quick action buttons |
| **Ask** | Submit a request + see live execution | Type → Submit → Watch progress → See result |
| **Results** | Browse all completed outputs with rich rendering | Open, download, rate |
| **Evidence** | Trace how a result was produced | View sources, subtask chain, provider data |
| **Approvals** | Decisions needing human action | Approve / Reject / Revise |
| **Activity** | Timestamped event history | Filter, search |
| **Settings** | Configuration + preferences | Toggle, save |

## Ask/Create Experience (The Core Flow)

```
[Input box] → [Submit] → [Live Progress Panel] → [Result Card]
                          ↓
                   "Searching..."
                   "Analyzing..."
                   "Writing..."
                   "Done ✓"
```

The progress panel shows:
- Current step name in operator language
- Time elapsed
- Provider being used (optional, subtle)
- Completion percentage or step count

The result card shows:
- Title (from the request)
- Engine that handled it (badge)
- Structured output (headings, lists, tables rendered — not raw markdown)
- Sources/citations as clickable links
- Download buttons (MD, JSON)
- Feedback controls ("Was this helpful?")
- "View Evidence" link to trace the full execution chain

## Result Rendering by Output Type

| Output Type | Rendering |
|---|---|
| Research/analysis | Structured sections + source links + key findings highlighted |
| Product comparison | Comparison table + recommendation + pricing |
| Travel itinerary | Day-by-day cards + logistics + costs |
| Creative concept | Narrative blocks + character/episode lists |
| Health protocol | Phase-by-phase progression + safety notes |
| Financial strategy | Calculations + tax implications + timelines |
| News digest | Headline cards + source links + timestamps |
| Code/architecture | Code blocks with syntax highlighting + diagrams if present |
| General | Structured markdown rendering with headings/lists/links |

## Error Handling (Operator-Facing)

| Internal State | Operator Message |
|---|---|
| Perplexity API timeout | "Search is taking longer than expected. Retrying..." |
| OpenAI rate limit | "Processing paused briefly. Resuming shortly." |
| Subtask failed | "One step encountered an issue. Trying an alternative approach." |
| All subtasks failed | "Unable to complete this request. You can try again or modify your request." |
| grounding ripper failed | (Never shown) → translates to "Research step encountered an issue" |

## What's NOT Shown

- Internal subsystem names (grounding ripper, workflow orchestrator, etc.)
- Raw JSON error responses
- Stack traces
- Provider API error codes
- Internal task IDs (except in Evidence/debug views)
- Worker queue internal state
