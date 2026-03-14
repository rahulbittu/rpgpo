Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Do not solve the part.
- Do not output module decomposition outside the prompt.
- Do not output TypeScript types outside the prompt.
- Do not output commentary before or after the prompt.
- Output exactly one paste-ready prompt in the same style as the prior GPO prompts.

Match this output style exactly:
- "Implement Part XX for GPO/RPGPO: ..."
- short baseline paragraph
- long numbered requirement list
- explicit APIs/UI/docs/verification sections
- final "Return:" section

Project context:
- GPO = Govern Private Office, reusable privacy-first product/platform.
- RPGPO = Rahul Pitta's configured private instance of GPO.
- Parts 19-59 complete. 65 TS modules. 15 engines with output contracts. 150 acceptance scenarios. 9 structured deliverable variants with rendering. Contract enforcement at plan-time and completion-time. Inline route protection on 22/25 routes. 10/10 mutation guards. Deep field-level redaction.
- Part 59 added: structured-deliverables.ts, contract-enforcement.ts, deliverable-rendering.ts with 9 typed deliverable variants (Newsroom, Shopping, CodeChange, Document, Recommendation, Schedule, CreativeDraft, Analysis, ActionPlan), RenderModel, BoardContractContext, plan augmentation with Assemble/Validate subtasks.

Current baseline summary:
- Deliverables are stored as flat JSON in state/deliverables/:taskId.json with no versioning
- No evidence linking between deliverables and artifact registry / traceability ledger
- No propose/approve/reject lifecycle for deliverables
- Subtask outputs merged by simple text append into scaffold, no field-aware merge
- No deterministic deliverable ID scheme
- Existing approval workspace exists (Part 33) but not connected to deliverable lifecycle

Requested next part:
Part 60: Deliverable Store + Evidence Linking + Approval Gates + Merge Pipeline

The goal is to make deliverables first-class versioned artifacts with evidence chains, approval gates, and contract-aware merging — so the operator can see deliverable history, approve/reject versions, and trace every field back to the subtask that produced it.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
