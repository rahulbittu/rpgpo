# Part 59: Structured Deliverables + Contract Enforcement + Rendering

## Architecture (from ChatGPT handoff)
Contract-first deliverable pipeline:
- Typed StructuredDeliverable discriminated union (9 variants)
- Plan-time enforcement: BoardContractContext steers deliberation + adds Assemble/Validate subtasks
- Completion-time enforcement: validates deliverable against contract, gates closure
- RenderModel abstraction with per-engine-family renderers
- Balanced enforcement: soft_fail (<=2 missing) → hard_fail (>2 missing)

## 3 New Modules
1. `structured-deliverables.ts` — schema registry, normalization, validation, diff
2. `contract-enforcement.ts` — scaffold lifecycle, subtask merge, completion gate, remediation
3. `deliverable-rendering.ts` — StructuredDeliverable → RenderModel transforms, renderer key mapping

## 9 Deliverable Variants
Newsroom, Shopping, CodeChange, Document, Recommendation, Schedule, CreativeDraft, Analysis, ActionPlan

## 9 Renderer Keys
newsroom_list, shopping_table, code_diff, document_sections, recommendation_list, schedule_timeline, creative_view, analysis_brief, action_plan_steps

## UI Integration
Final Result block tries structured deliverable first (/api/tasks/:id/deliverable), falls back to raw text. Structured rendering shows engine-appropriate cards/tables/diffs with missing-field badges.
