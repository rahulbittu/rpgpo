Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-65 complete. 75 TS modules, ~810 API routes, ~430+ types.
- Part 65 just added runtime pipeline integration: onTaskStart creates scaffold, onSubtaskComplete merges output, onTaskComplete validates contract and gates closure.
- The full deliverable lifecycle exists: scaffold → merge → validate → store → approve → release assembly.

What's needed next:
The deliverable infrastructure is complete but the **actual task worker** (worker.js) doesn't call the runtime hooks yet. The worker creates subtasks, runs them through AI providers, and completes tasks — but it doesn't invoke `onTaskStart`, `onSubtaskComplete`, or `onTaskComplete` from the runtime pipeline. This means real task executions still don't produce structured deliverables.

Also, the Board deliberation prompt doesn't include the engine contract context, so it doesn't plan subtasks that target contract-required fields.

Requested part:
Part 66: Worker + Board Wiring — Connect the actual execution worker and board deliberation to the structured deliverable pipeline so real tasks produce real deliverables.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
