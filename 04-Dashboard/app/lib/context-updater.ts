// GPO Context Updater — Automatic context pipeline
// Updates structured context when meaningful events happen.
// Called from server/worker after task lifecycle events.

import type {
  IntakeTask,
  Subtask,
  BoardDeliberation,
  Domain,
  DecisionRecord,
  ArtifactRef,
} from './types';

const context = require('./context') as {
  addDecision(d: Omit<DecisionRecord, 'id' | 'made_at'>): DecisionRecord;
  addArtifact(a: Omit<ArtifactRef, 'id' | 'created_at'>): ArtifactRef;
  addOpenQuestion(q: { domain: Domain; question: string; context: string; priority: 'low' | 'medium' | 'high' }): void;
  recordApprovalPattern(domain: Domain, stage: string, outcome: 'approved' | 'rejected' | 'revised'): void;
  updateMissionContext(domain: Domain, updates: Record<string, unknown>): void;
  getMissionContext(domain: Domain): { known_issues: string[]; [key: string]: unknown };
  recordStylePreference(category: string, preference: string): void;
  getOperatorProfile(): { name: string };
};

// ═══════════════════════════════════════════
// Event Handlers — call these from server/worker
// ═══════════════════════════════════════════

/** Called after board deliberation completes */
export function onDeliberationComplete(task: IntakeTask, deliberation: BoardDeliberation): void {
  try {
    const domain = task.domain as Domain;

    // Record the strategy decision
    context.addDecision({
      domain,
      category: 'strategy',
      title: `Deliberation: ${task.title.slice(0, 60)}`,
      decision: deliberation.recommended_strategy,
      reasoning: `Objective: ${deliberation.interpreted_objective}`,
      impact: `${deliberation.subtasks.length} subtasks planned. Risk: ${deliberation.risk_level}`,
      task_id: task.task_id,
    });

    // Record open questions from key_unknowns
    for (const unknown of (deliberation.key_unknowns || []).slice(0, 3)) {
      context.addOpenQuestion({
        domain,
        question: unknown,
        context: `From deliberation on: ${task.title}`,
        priority: 'medium',
      });
    }

    // Update mission context summary
    context.updateMissionContext(domain, {
      objective: deliberation.interpreted_objective,
      next_actions: deliberation.subtasks.map((s: { title: string }) => s.title),
    });

    console.log(`[context-updater] Deliberation context recorded for ${domain}: ${task.task_id}`);
  } catch (e: unknown) {
    console.log(`[context-updater] Warning: failed to update context on deliberation: ${(e as Error).message}`);
  }
}

/** Called after a subtask completes (done or failed) */
export function onSubtaskComplete(subtask: Subtask, parentTask: IntakeTask): void {
  try {
    const domain = subtask.domain as Domain;

    // Record artifacts
    if (subtask.report_file) {
      context.addArtifact({
        domain,
        type: 'report',
        title: `${subtask.stage}: ${subtask.title}`,
        path: subtask.report_file,
        task_id: subtask.parent_task_id,
      });
    }

    if (subtask.status === 'done' && subtask.code_modified && subtask.files_changed?.length) {
      context.addArtifact({
        domain,
        type: 'code_change',
        title: `Code: ${subtask.title} (${subtask.files_changed.length} files)`,
        path: subtask.files_changed[0],
        task_id: subtask.parent_task_id,
      });
    }

    // Record significant decisions from completed subtasks
    if (subtask.status === 'done' && subtask.what_done) {
      const category = subtask.stage === 'implement' || subtask.stage === 'build' || subtask.stage === 'code'
        ? 'technical' as const
        : subtask.stage === 'strategy' ? 'strategy' as const : 'process' as const;

      context.addDecision({
        domain,
        category,
        title: subtask.title,
        decision: subtask.what_done,
        reasoning: `Stage: ${subtask.stage}, Model: ${subtask.assigned_model}`,
        impact: subtask.code_modified
          ? `${subtask.files_changed?.length || 0} files changed`
          : 'No code changes',
        task_id: subtask.parent_task_id,
        subtask_id: subtask.subtask_id,
      });
    }

    // Record failure as known issue
    if (subtask.status === 'failed') {
      const mc = context.getMissionContext(domain) as { known_issues: string[] };
      const issue = `${subtask.title}: ${(subtask.error || 'Unknown failure').slice(0, 100)}`;
      if (!mc.known_issues.includes(issue)) {
        mc.known_issues.unshift(issue);
        if (mc.known_issues.length > 20) mc.known_issues.length = 20;
        context.updateMissionContext(domain, { known_issues: mc.known_issues });
      }
    }

    console.log(`[context-updater] Subtask context recorded: ${subtask.subtask_id} (${subtask.status})`);
  } catch (e: unknown) {
    console.log(`[context-updater] Warning: failed to update context on subtask: ${(e as Error).message}`);
  }
}

/** Called when an approval is granted */
export function onApprovalGranted(subtask: Subtask): void {
  try {
    const domain = subtask.domain as Domain;
    context.recordApprovalPattern(domain, subtask.stage, 'approved');

    // Track operator style
    if (subtask.builder_outcome === 'code_applied') {
      context.recordStylePreference('approval', 'accepts_code_changes');
    }

    console.log(`[context-updater] Approval pattern recorded: ${domain}/${subtask.stage}/approved`);
  } catch (e: unknown) {
    console.log(`[context-updater] Warning: failed to record approval: ${(e as Error).message}`);
  }
}

/** Called when an approval is rejected */
export function onApprovalRejected(subtask: Subtask, reason: string): void {
  try {
    const domain = subtask.domain as Domain;
    context.recordApprovalPattern(domain, subtask.stage, 'rejected');

    context.addDecision({
      domain,
      category: 'approval',
      title: `Rejected: ${subtask.title}`,
      decision: `Rejected with reason: ${reason}`,
      reasoning: `Stage: ${subtask.stage}, Outcome: ${subtask.builder_outcome || 'N/A'}`,
      impact: 'Changes reverted',
      subtask_id: subtask.subtask_id,
    });

    console.log(`[context-updater] Rejection recorded: ${domain}/${subtask.stage}`);
  } catch (e: unknown) {
    console.log(`[context-updater] Warning: failed to record rejection: ${(e as Error).message}`);
  }
}

/** Called when a revision is requested */
export function onRevisionRequested(subtask: Subtask, notes: string): void {
  try {
    const domain = subtask.domain as Domain;
    context.recordApprovalPattern(domain, subtask.stage, 'revised');
    context.recordStylePreference('revision', 'requests_revisions');

    console.log(`[context-updater] Revision pattern recorded: ${domain}/${subtask.stage}`);
  } catch (e: unknown) {
    console.log(`[context-updater] Warning: failed to record revision: ${(e as Error).message}`);
  }
}

/** Called when a task fully completes */
export function onTaskComplete(task: IntakeTask): void {
  try {
    const domain = task.domain as Domain;

    context.addDecision({
      domain,
      category: 'process',
      title: `Task completed: ${task.title.slice(0, 60)}`,
      decision: `Task finished with status: ${task.status}`,
      reasoning: task.board_deliberation?.recommended_strategy || '',
      impact: task.board_deliberation?.expected_outcome || '',
      task_id: task.task_id,
    });

    // Update mission status
    context.updateMissionContext(domain, {
      current_status: `Last completed: ${task.title.slice(0, 60)} (${task.status})`,
    });

    console.log(`[context-updater] Task completion recorded: ${task.task_id}`);
  } catch (e: unknown) {
    console.log(`[context-updater] Warning: failed to record task completion: ${(e as Error).message}`);
  }
}

/** Called when builder produces an outcome */
export function onBuilderOutcome(subtask: Subtask): void {
  try {
    const domain = subtask.domain as Domain;

    if (subtask.builder_outcome === 'code_applied' && subtask.files_changed?.length) {
      context.addArtifact({
        domain,
        type: 'code_change',
        title: `Builder: ${subtask.files_changed.length} files changed`,
        path: subtask.report_file || subtask.files_changed[0],
        task_id: subtask.parent_task_id,
      });
    }

    if (subtask.builder_outcome === 'builder_fallback_prompt_created' && subtask.prompt_file) {
      context.addArtifact({
        domain,
        type: 'prompt',
        title: `Builder fallback prompt: ${subtask.title}`,
        path: subtask.prompt_file,
        task_id: subtask.parent_task_id,
      });
    }
  } catch (e: unknown) {
    console.log(`[context-updater] Warning: failed to record builder outcome: ${(e as Error).message}`);
  }
}

module.exports = {
  onDeliberationComplete,
  onSubtaskComplete,
  onApprovalGranted,
  onApprovalRejected,
  onRevisionRequested,
  onTaskComplete,
  onBuilderOutcome,
};
