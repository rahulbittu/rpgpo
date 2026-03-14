# Runbook: Final Output Verification

## Check Specific Task
`GET /api/final-output/:taskId` — returns synthesized answer, artifacts, reports, files

## Check All Tasks
`GET /api/final-output-report` — surfacing quality across all completed tasks

## Expected Behavior
- Completed research task → shows actual research answer in Final Result block
- Completed code task → shows summary, changed files, diff links
- Completed content task → shows generated content directly

## Verify in UI
1. Go to Tasks tab
2. Click any completed task
3. Scroll to bottom of timeline
4. "Final Result" block should show the answer
5. Report links should be clickable
