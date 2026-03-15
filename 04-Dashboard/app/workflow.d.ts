import type { Subtask, BoardDeliberation, WorkflowResult } from './types';
/**
 * After a subtask completes (done or failed), decide what happens next.
 * - Green + success → auto-queue next safe subtask
 * - Yellow/Red → stop, surface approval
 * - Failed → block dependents, stop
 */
export declare function onSubtaskComplete(subtaskId: string): WorkflowResult;
/**
 * Find subtasks that are ready to run after a given subtask completes.
 * A subtask is ready when all its depends_on subtasks are done.
 */
export declare function findReadySubtasks(completedSubtaskId: string, allSubs: Subtask[]): Subtask[];
/**
 * Block subtasks that depend on a failed subtask.
 */
export declare function blockDependents(failedSubtaskId: string, allSubs: Subtask[]): void;
/**
 * Check if all subtasks are in terminal state. If so, mark the parent task accordingly.
 */
export declare function checkTaskCompletion(taskId: string, allSubs?: Subtask[]): void;
/**
 * Materialize subtasks from a deliberation result into the subtask store.
 * Links them to the parent task and sets up dependency chains.
 */
export declare function materializeSubtasks(taskId: string, deliberation: BoardDeliberation): Subtask[];
/**
 * Queue the first batch of subtasks that have no dependencies.
 */
export declare function queueInitialSubtasks(taskId: string): string[];
//# sourceMappingURL=workflow.d.ts.map