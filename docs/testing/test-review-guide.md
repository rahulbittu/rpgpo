# GPO Test Review Guide

## How to Review a Test Case

### Quick Review (2 minutes)
1. Open `docs/testing/case-reports/{task_id}-*.md`
2. Check Phase 2 (Board Deliberation) — does the objective make sense?
3. Check Phase 3 (Execution) — did the right providers run?
4. Check Phase 4 (Deliverable) — is there substantial output?

### Deep Review (10 minutes)
1. GET /api/intake/task/{task_id} — full task data with subtasks
2. Check each subtask output for quality, citations, specificity
3. Verify routing matched the request intent
4. Download the export: /api/intake/task/{task_id}/export?fmt=md

### Strict Verdict Check
Open `artifacts/testing/strict-case-verdicts.json` and find the case:
- `strict_verdict`: PASS/PARTIAL/FAIL
- `confidence`: 0-100 score
- `anomalies`: any issues found
- `missing_evidence`: what's lacking

## Review Checklist

- [ ] Board deliberation recorded?
- [ ] Objective matches user intent?
- [ ] Strategy is reasonable?
- [ ] Subtasks assigned to correct providers?
- [ ] All subtasks completed?
- [ ] Output is substantial (>200 chars)?
- [ ] Output is specific (not generic)?
- [ ] No template placeholders in non-template tasks?
- [ ] Export available (MD/JSON)?

## Where to Find Evidence

| Evidence | Location |
|---|---|
| Case reports | docs/testing/case-reports/ |
| Verdicts | artifacts/testing/strict-case-verdicts.json |
| Classification | artifacts/testing/canonical-case-classification.json |
| Deliverable files | 04-Dashboard/state/deliverables/ |
| Subtask reports | 03-Operations/Reports/ |
| Score history | artifacts/testing/score-improvement-log.json |
| Provider stats | artifacts/testing/provider-role-index.json |
