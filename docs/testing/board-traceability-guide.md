# Board of AI Traceability Guide

## How to Trace a Task

For any task, you can follow the complete execution chain:

### 1. Find the Task
- Dashboard: Tasks tab → click any task
- API: GET /api/intake/task/{task_id}
- Case report: docs/testing/case-reports/{task_id}-*.md

### 2. Review the Board Deliberation
Each task has a \`board_deliberation\` field containing:
- \`interpreted_objective\`: What the Board understood
- \`recommended_strategy\`: How the Board decided to approach it
- \`risk_level\`: green/yellow/red
- \`subtasks\`: Ordered execution plan with provider assignments

### 3. Understand Routing
- Domain detected by keyword scoring in domain-router.ts
- Operator profile injected automatically (name, role, priorities)
- Domain context loaded from deliberation.ts DOMAIN_CONTEXT

### 4. Review Execution
Each subtask in the plan maps to a provider call:
- Perplexity: Web search (research/audit stages)
- OpenAI: Synthesis (report stages)
- Gemini: Strategy (strategy stages)
- Claude: Code (implement stages)

### 5. Check Output
- Subtask output stored in subtasks.json
- Deliverable file in state/deliverables/
- Report file in 03-Operations/Reports/

### 6. Export
- GET /api/intake/task/{task_id}/export?fmt=md
- GET /api/intake/task/{task_id}/export?fmt=json

## Provider Selection Logic

The Board selects providers based on:
1. Stage type (research → Perplexity, report → OpenAI)
2. Task domain (code tasks → Claude)
3. Deliberation prompt rules (explicit model assignment)

## Evidence Chain

```
User Request
  → Intake (domain detection)
    → Board Deliberation (objective + strategy + subtask plan)
      → Subtask 1 (provider + output)
      → Subtask 2 (provider + output)
        → Deliverable File
          → Export (MD/JSON)
            → Notification
```
