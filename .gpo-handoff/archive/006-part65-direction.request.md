Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Do not solve the part.
- Output exactly one paste-ready prompt in the same style as the prior GPO prompts.

Current baseline:
- Parts 19-64 complete. 73 TS modules, ~800 API routes, ~420+ types.
- Part 59: 9 structured deliverable variants with contract enforcement and rendering
- Part 60: Versioned deliverable store with deterministic IDs, atomic writes, migration
- Part 61: Merge pipeline with 5 strategies, per-variant field policies, provenance
- Part 62: Evidence linking and deliverable approval lifecycle (propose/approve/reject)
- Part 63: Deliverables UI panel in releases tab
- Part 64: Release candidate assembly with lockfiles, promotion, diff

What's needed next:
The system now has deliverables, versioning, merging, evidence, approvals, and release assembly. The next gap is making the **runtime task pipeline actually produce structured deliverables** during execution. Currently the pipeline creates raw text outputs, and the structured deliverable system exists alongside but isn't wired into the live task execution flow. The Board deliberation should consume engine contracts, subtask execution should merge outputs into deliverable scaffolds, and task completion should gate on contract satisfaction.

Requested part:
Part 65: Runtime Pipeline Integration — Wire structured deliverables into live task execution (board → subtasks → scaffold → merge → validate → surface)

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
