# Final Output Surfacing Architecture

## Problem
Completed tasks showed "all subtasks done" but no visible final answer. The actual result was buried in report files and subtask outputs.

## Solution
`final-output-surfacing.ts` synthesizes the final answer from:
1. Report files (read from 03-Operations/Reports or path-based)
2. Subtask `what_done` field
3. Subtask `output` field
4. Subtask `diff_summary` for code tasks

## UI Integration
- Task timeline shows "Final Result" block for completed tasks
- Block contains: final answer text, artifact links, report paths, changed files
- Async-loaded via `/api/final-output/:taskId`

## Artifact Types
- `report` — file-backed report with preview and open link
- `code_change` — diff summary from builder subtask
- `answer` — text output from reasoning subtask
- `approval` — approval decision record
