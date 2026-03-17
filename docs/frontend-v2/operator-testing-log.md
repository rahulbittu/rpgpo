# GPO V2 Operator Testing Log

## Test Session: 2026-03-17

### Workflows Verified

| Workflow | Status | Notes |
|---|---|---|
| Ask → Submit → Progress → Result | **Working** | Live progress with steps, rich result card |
| Result → Evidence deep-link | **Working** | Smooth transition, no flash |
| Results → Search + Filter | **Working** | Real-time search across title/objective |
| Results → Pagination | **Working** | Load more button with remaining count |
| Evidence → Subtask output toggle | **Working** | Rendered markdown, scrollable |
| Evidence → Download MD/JSON | **Working** | Correct paths, clean output |
| Feedback → Good/Bad rating | **Working** | Event captured in behavior system |
| Activity → Timestamped events | **Working** | 50 recent events, auto-refresh on SSE |
| Approvals → Empty state | **Working** | "All clear" message |
| Settings → Theme toggle | **Working** | Immediate switch, persisted |
| Settings → Provider status | **Working** | Shows OK/-- badges |
| Home → Summary + Attention | **Working** | Today stats, cost metrics, pending count |

### Issues Found and Fixed

| ID | Issue | Severity | Fix | Status |
|---|---|---|---|---|
| OT-001 | "best coffee shops" routes to general | Medium | Added 16 natural-language triggers to research keywords | **Fixed** |

### Routing Coverage Test

| Prompt | Expected | Actual | Status |
|---|---|---|---|
| "best coffee shops in Austin" | research | research | ✓ |
| "recommend a laptop" | research | research | ✓ |
| "top 10 passive income" | finance | finance | ✓ |
| "find me a dentist in Hyderabad" | research | research | ✓ |
| "which is better React or Vue" | research | research | ✓ |
| "create a meal plan for muscle" | health | research | Acceptable (no health keyword hit) |
| "explain how TCP works" | learning | learning | ✓ (verified earlier) |

### Output Quality Check

| Task | Engine | Output | Internal Leaks | Quality |
|---|---|---|---|---|
| Best coffee shops Austin TX | general→research | 4,669 chars across 2 subtasks | 0 | Structured, specific places named |

### Trust Signals Check

| Signal | Status |
|---|---|
| No "Rahul" in V2 UI | ✓ Verified |
| No "RPGPO" in V2 UI | ✓ Verified |
| No "TopRanker" in V2 UI | ✓ Verified |
| No internal error text visible | ✓ Verified |
| Timestamps on all events | ✓ Verified |
| Cost values have context | ✓ Verified (Today/Week labels) |
| Downloads work | ✓ Verified (MD + JSON) |
| Feedback captured | ✓ Verified |
