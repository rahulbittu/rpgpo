Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-66 complete. 76 TS modules, ~815 API routes, ~440+ types.
- Part 66 wired the worker and board to the structured deliverable pipeline: board creates scaffold, subtasks merge output, completion validates contract.
- The full lifecycle works: scaffold → merge → validate → store → approve → release assembly.

Gap:
The deliberation prompt sent to AI providers doesn't include the engine's output contract. The AI produces unstructured text that gets merged heuristically. For deliverables to be truly structured, the AI must be told what fields to produce (e.g., "return ranked_items as JSON array with headline, summary, source fields"). The subtask execution prompt also doesn't request structured output. This means the merge step does text-append instead of field-level population.

Requested part:
Part 67: Contract-Aware Prompt Augmentation + Structured Output Extraction — Make the AI produce deliverable-shaped output by injecting contract schemas into prompts and extracting structured fields from responses.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
