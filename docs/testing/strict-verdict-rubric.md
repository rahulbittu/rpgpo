# GPO Strict Verdict Rubric

## Verdict Categories

| Verdict | Definition | Counts Toward Official |
|---|---|---|
| PASS | All subtasks completed, substantial output, board deliberation present, no anomalies | Yes |
| PARTIAL | Completed but with anomalies: manual intervention, template placeholders, incomplete subtasks | Yes |
| FAIL | Task failed or produced no usable output | Yes (as failure) |
| BLOCKED | Blocked by provider limitation (no audio/video gen) | Yes (as blocked) |
| MISSING_EVIDENCE | No deliberation, zero subtasks, or no output recorded | No |
| SYNTHESIS_DRIFT | Output contains generic templates or hallucinated data | Yes |
| MANUAL_INTERVENTION_REQUIRED | Needed operator approval for non-code task | Yes |
| NOT_CANONICAL | Not part of the 360 harness (retry, ad-hoc, legacy) | No |

## Grading Criteria

### PASS requires ALL of:
- Board deliberation recorded with objective and strategy
- All subtasks completed (done status)
- At least one subtask has substantial output (>200 chars)
- No template placeholders in output
- No manual intervention required for non-code tasks

### PARTIAL if ANY of:
- Not all subtasks completed
- Manual intervention was required
- Template placeholders in output
- Output exists but is thin (<200 chars)

### Confidence Score (0-100)
- Starts at 90 for completed tasks
- -20 for incomplete subtasks
- -30 for no substantial output
- -10 for manual intervention
- -15 for template placeholders
- Minimum 10

## Official Reporting Rules
1. Only canonical_360 cases count toward official rates
2. Retries, ad-hoc, and legacy tasks are excluded
3. L1/L2/L3 are assessed independently
4. Average confidence must be reported alongside pass rates
