// GPO Output Contracts — Define and validate engine output requirements

import type { OutputContract, TaskDeliverableStatus, TaskClosureState, ResultContractValidation, DeliverableVisibilityReport } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

function uid(): string { return 'oc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }

/** Output contracts per engine */
export function getContracts(): OutputContract[] {
  return [
    { engine_id: 'newsroom', required_fields: ['ranked_items', 'summaries', 'source_links'], optional_fields: ['briefing_artifact'], approval_required: false, final_action: 'surface_ranked_list', example_deliverable: 'Top 10 news with one-line summaries and source links' },
    { engine_id: 'shopping', required_fields: ['ranked_products', 'price_vendor', 'pros_cons'], optional_fields: ['buy_path', 'comparison_table'], approval_required: true, final_action: 'approval_to_buy', example_deliverable: 'Top 3 products with pros/cons and purchase link' },
    { engine_id: 'startup', required_fields: ['implementation_plan', 'changed_files', 'diff_preview'], optional_fields: ['test_results'], approval_required: true, final_action: 'approve_and_deploy', example_deliverable: 'Code changes with diff preview and approval gate' },
    { engine_id: 'legal', required_fields: ['extracted_facts', 'evidence_map', 'draft_document'], optional_fields: ['revision_notes'], approval_required: true, final_action: 'review_and_export', example_deliverable: 'Complaint letter with extracted facts and evidence mapping' },
    { engine_id: 'screenwriting', required_fields: ['premise', 'beat_sheet'], optional_fields: ['scene_breakdown', 'dialogue_draft'], approval_required: false, final_action: 'review_creative_draft', example_deliverable: 'One-page premise and beat sheet' },
    { engine_id: 'music', required_fields: ['composition_draft', 'lyrics_or_structure'], optional_fields: ['arrangement_notes'], approval_required: false, final_action: 'review_creative_draft', example_deliverable: 'Song structure with lyrics or composition notes' },
    { engine_id: 'calendar', required_fields: ['recommended_slots', 'calendar_diff'], optional_fields: ['conflict_analysis'], approval_required: true, final_action: 'approve_schedule', example_deliverable: 'Best 3 time slots with calendar update proposal' },
    { engine_id: 'chief_of_staff', required_fields: ['briefing', 'priorities', 'next_actions'], optional_fields: ['delegations'], approval_required: false, final_action: 'surface_briefing', example_deliverable: 'Daily briefing with prioritized action items' },
    { engine_id: 'career', required_fields: ['polished_document', 'recommendations'], optional_fields: ['interview_prep'], approval_required: true, final_action: 'review_and_export', example_deliverable: 'Polished resume with tailored recommendations' },
    { engine_id: 'health', required_fields: ['plan', 'recommendations'], optional_fields: ['tracking_setup'], approval_required: false, final_action: 'surface_plan', example_deliverable: 'Fitness plan with habit recommendations' },
    { engine_id: 'finance', required_fields: ['analysis', 'recommendations', 'data_summary'], optional_fields: ['projections'], approval_required: true, final_action: 'review_analysis', example_deliverable: 'Investment analysis with recommendation memo' },
    { engine_id: 'travel', required_fields: ['itinerary', 'options', 'cost_comparison'], optional_fields: ['booking_links'], approval_required: true, final_action: 'approve_itinerary', example_deliverable: 'Trip itinerary with cost comparison and booking options' },
    { engine_id: 'research', required_fields: ['thesis', 'evidence', 'recommendation'], optional_fields: ['sources', 'methodology'], approval_required: false, final_action: 'surface_recommendation', example_deliverable: 'Research memo with thesis, evidence, and recommendation' },
    { engine_id: 'home', required_fields: ['recommendations', 'options', 'comparison'], optional_fields: ['budget_estimate'], approval_required: true, final_action: 'review_recommendation', example_deliverable: 'Interior options with comparison and budget' },
    { engine_id: 'communications', required_fields: ['polished_draft', 'tone_variants'], optional_fields: ['subject_line_options'], approval_required: false, final_action: 'review_and_send', example_deliverable: 'Professional email with 3 tone variants' },
  ];
}

/** Get contract for a specific engine */
export function getContract(engineId: string): OutputContract | null {
  return getContracts().find(c => c.engine_id === engineId) || null;
}

/** Validate a task against its engine's output contract */
export function validateTask(taskId: string): TaskDeliverableStatus {
  const tasks = readJson<any[]>(path.join(STATE_DIR, 'tasks.json'), []);
  const subtasks = readJson<any[]>(path.join(STATE_DIR, 'subtasks.json'), []);
  const intakeTasks = readJson<any[]>(path.join(STATE_DIR, 'intake-tasks.json'), []);

  const task = tasks.find(t => t.task_id === taskId);
  const intake = intakeTasks.find(t => t.intake_id === taskId || t.task_id === taskId);
  if (!task && !intake) return { task_id: taskId, engine_id: 'unknown', closure_state: 'failed_with_reason', deliverable_visible: false, contract_satisfied: false, missing_fields: ['task_not_found'], remediation: 'Task not found', best_partial: null };

  const engineId = intake?.domain || task?.domain || 'general';
  const contract = getContract(engineId);
  const taskSubs = subtasks.filter(st => st.parent_task === taskId);
  const doneSubs = taskSubs.filter(st => st.status === 'done');

  // Check for visible deliverable
  let hasAnswer = false;
  let bestPartial: string | null = null;
  try {
    const fos = require('./final-output-surfacing') as { getFinalOutput(id: string): { final_answer: string | null; summary: string | null } | null };
    const output = fos.getFinalOutput(taskId);
    hasAnswer = !!(output?.final_answer);
    if (!hasAnswer && output?.summary) bestPartial = output.summary;
  } catch { /* */ }

  // Determine closure state
  let closureState: TaskClosureState = 'failed_with_reason';
  const isDone = (task?.status === 'done') || (intake?.status === 'done');
  const isWaiting = taskSubs.some(st => st.status === 'waiting_approval' || st.status === 'waiting_human');
  const isBlocked = taskSubs.some(st => st.status === 'blocked' || st.status === 'failed');

  if (isDone && hasAnswer) closureState = 'final_deliverable_visible';
  else if (isWaiting) closureState = 'awaiting_operator_approval';
  else if (isBlocked) closureState = 'blocked_with_remediation';
  else if (isDone && !hasAnswer && doneSubs.length > 0) closureState = 'blocked_with_remediation';
  else if (isDone && doneSubs.length === 0) closureState = 'failed_with_reason';

  // Contract validation
  const missingFields: string[] = [];
  if (contract) {
    // For completed tasks, check if required fields are present in outputs
    const allOutputText = doneSubs.map(st => [st.output || '', st.what_done || '', st.report_file || ''].join(' ')).join(' ').toLowerCase();
    for (const field of contract.required_fields) {
      // Heuristic: check if field concept appears in outputs
      const keywords = field.replace(/_/g, ' ').split(' ');
      const found = keywords.some(k => allOutputText.includes(k));
      if (!found && isDone) missingFields.push(field);
    }
  }

  const contractSatisfied = missingFields.length === 0 && hasAnswer;

  // Remediation for blocked state
  let remediation: string | null = null;
  if (closureState === 'blocked_with_remediation') {
    const failedSubs = taskSubs.filter(st => st.status === 'failed' || st.status === 'blocked');
    if (failedSubs.length > 0) {
      remediation = `${failedSubs.length} subtask(s) failed/blocked: ${failedSubs.map(s => s.title || s.subtask_id).join(', ')}. Best available output shown below.`;
    } else {
      remediation = 'Task completed but deliverable not surfaced. Check report files for partial results.';
    }
    // Try to extract best partial from any done subtask
    if (!bestPartial && doneSubs.length > 0) {
      const best = doneSubs.find(st => st.output || st.what_done);
      if (best) bestPartial = best.output || best.what_done;
    }
  }

  return { task_id: taskId, engine_id: engineId, closure_state: closureState, deliverable_visible: hasAnswer, contract_satisfied: contractSatisfied, missing_fields: missingFields, remediation, best_partial: bestPartial };
}

/** Get deliverable visibility report across all completed tasks */
export function getVisibilityReport(): DeliverableVisibilityReport {
  const tasks = readJson<any[]>(path.join(STATE_DIR, 'tasks.json'), []);
  const doneTasks = tasks.filter(t => t.status === 'done').slice(0, 30);
  const violations: DeliverableVisibilityReport['violations'] = [];
  let visible = 0;
  let invisible = 0;
  let blocked = 0;

  for (const task of doneTasks) {
    const status = validateTask(task.task_id);
    if (status.deliverable_visible) visible++;
    else if (status.closure_state === 'blocked_with_remediation') { blocked++; violations.push({ task_id: task.task_id, engine_id: status.engine_id, issue: status.remediation || 'Blocked' }); }
    else { invisible++; violations.push({ task_id: task.task_id, engine_id: status.engine_id, issue: 'No visible deliverable' }); }
  }

  return { report_id: uid(), tasks_checked: doneTasks.length, visible, invisible, blocked, violations: violations.slice(0, 20), created_at: new Date().toISOString() };
}

module.exports = { getContracts, getContract, validateTask, getVisibilityReport };
