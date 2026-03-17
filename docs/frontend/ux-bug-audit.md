# GPO UX Bug Audit

## Critical Bugs Found and Fixed

### BUG-001: Repeated "Task completed" toast
**Severity:** High
**Symptom:** Toast appears multiple times, distracting during result review
**Root cause:** Two independent systems fire completion toasts:
1. Intake detail poll (every 3 seconds) — fires toast on every poll cycle where status is done
2. SSE task event handler — fires a second toast from the worker queue

**Fix:** Poll handler now checks `wasComplete` — only fires toast on status TRANSITION to done/failed. SSE toast suppressed when intake detail panel is active.

### BUG-002: Scroll hijack to top on task completion
**Severity:** High
**Symptom:** Operator scrolls down to read result, page jumps back to top
**Root cause:** `showIntakeDetail()` always calls `scrollIntoView()`. Called from:
- Poll completion handler
- Approve/reject/deliberate action handlers (6 call sites)
- Each call replaces content with "Loading..." and scrolls

**Fix:** `showIntakeDetail()` now detects same-task re-fetch. Only scrolls and shows "Loading..." on first open or task switch. Same-task re-fetches update silently in-place without scroll or content flash.

### BUG-003: Deliverable links return 404
**Severity:** Medium
**Symptom:** Clicking a deliverable opens a "Not found" page
**Root cause:** `/api/task-outputs` returned path `state/deliverables/file.md` but `/api/file/` resolves from RPGPO_ROOT. Missing `04-Dashboard/` prefix.

**Fix:** Path now includes `04-Dashboard/` prefix.

### BUG-004: Layout shift during reading
**Severity:** Medium
**Symptom:** Task list re-renders while reading detail panel, causing visual jump
**Root cause:** SSE debounced `loadIntakeTasks()` fires every 3 seconds when intake tab is active

**Fix:** Skip list refresh when detail panel is open.

### BUG-005: Unnecessary polling on completed tasks
**Severity:** Low
**Symptom:** CPU/network waste polling a completed task
**Root cause:** `showIntakeDetail()` always started poll regardless of task status

**Fix:** Only start poll for non-terminal task statuses.
