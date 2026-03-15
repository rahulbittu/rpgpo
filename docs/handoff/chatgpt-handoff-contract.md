# ChatGPT ↔ Claude Handoff Contract

**Version:** 2.0 | **Date:** 2026-03-15

## Current Defects in Handoff System

### Defect 1: Drift Amplification
The current handoff asks ChatGPT to "generate the next architecture implementation prompt." This is open-ended and causes ChatGPT to produce increasingly abstract, enterprise-scale architecture parts (Part 67 → Part 101+) without anchoring to whether prior parts actually work. Claude then implements whatever ChatGPT generates, regardless of operator value.

**Evidence:** claude-state.md shows "Parts 19-100 complete" with "175+ TS modules, 1070+ API routes" but the test harness shows 0/360 cases verified as working.

### Defect 2: No Feedback Loop
ChatGPT responses are consumed as prompts and executed, but results are never fed back. If Part 67 produces broken output, Part 68's prompt doesn't know. The system moves forward without regression awareness.

### Defect 3: No Test Anchoring
Handoff packets don't reference specific test cases or user-facing capabilities. The "Requested part" field is a description, not a test-case-driven objective. This means development is architecture-driven rather than validation-driven.

### Defect 4: Stale Context
claude-state.md says "Part 66 complete" but the system is now at Part 135+. The handoff state file is badly outdated, meaning ChatGPT operates on stale context.

---

## Corrected Handoff Contract

Every handoff packet to ChatGPT MUST contain:

### Required Fields

```json
{
  "handoff_type": "critique | planning | evaluation | provider_advice",
  "product_stage": "validation_mode",
  "current_objective": "string — exact 1-sentence objective",
  "target_test_cases": ["GPO-XXX-01", "GPO-XXX-02"],
  "failing_cases_summary": "string — what is failing and why",
  "constraints": {
    "do_not_drift": true,
    "preserve_existing": ["list of working systems that must not break"],
    "scope_boundary": "string — what ChatGPT is allowed to recommend"
  },
  "expected_output": {
    "format": "structured_json | markdown_report | implementation_prompt",
    "schema_hint": "what fields are expected",
    "max_scope": "string — e.g. 'only recommend prompt changes, not new modules'"
  },
  "how_claude_will_use_response": "string — exactly how the response changes execution",
  "what_must_not_change": ["routing logic", "governance model", "etc"],
  "evidence_payload": {
    "test_results": [],
    "execution_logs": [],
    "gap_classification": []
  }
}
```

### Do-Not-Drift Clauses (always included)
1. Do not propose new subsystems unless a failing test case requires it.
2. Do not redesign existing working pipelines.
3. Do not generate open-ended architecture prompts.
4. Every recommendation must map to specific test case IDs.
5. Preserve current engine/domain/routing structure.
6. Favor surgical fixes over sweeping changes.

### How Claude Processes ChatGPT Responses
1. Validate response maps to target test cases
2. Reject any recommendation not tied to a specific gap
3. Check for drift indicators (new modules, new patterns, architectural proposals)
4. Extract only actionable, bounded changes
5. Record decision in execution-results.json before implementing

---

## Handoff Flow

```
Claude identifies gap → writes constrained packet → ChatGPT responds →
Claude validates response against test cases → Claude implements or rejects →
Claude records result → cycle continues
```

## Anti-Patterns to Reject
- "Consider building a new X subsystem" → Reject unless test case requires it
- "You could redesign Y for better Z" → Reject (non-drift rule)
- "Here's a comprehensive architecture for..." → Reject (scope violation)
- Open-ended brainstorming → Reject and reframe with constraints
