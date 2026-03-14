# Output Contracts Architecture

## Purpose
Each engine must define what a successful task deliverable looks like. The output contract specifies required visible fields, approval model, and final action.

## Contract Validation
When a task completes, `output-contracts.validateTask()` checks:
1. Does the task have a visible final answer? (via final-output-surfacing)
2. Do required fields appear in subtask outputs?
3. Is the approval gate satisfied?
4. Is the closure state valid?

## Closure States
- `final_deliverable_visible` — answer shown to operator
- `awaiting_operator_approval` — waiting for human decision
- `blocked_with_remediation` — failed but with partial output and next steps
- `action_executed_with_proof` — action taken with evidence
- `failed_with_reason` — explicit failure with explanation
