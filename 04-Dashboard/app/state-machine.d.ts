import type { TaskStatus, SubtaskStatus } from './types';
/** All terminal task states */
export declare const TASK_TERMINAL: ReadonlySet<TaskStatus>;
/** Task states that require human action */
export declare const TASK_NEEDS_HUMAN: ReadonlySet<TaskStatus>;
/** Check if a task state transition is valid */
export declare function isValidTaskTransition(from: TaskStatus, to: TaskStatus): boolean;
/** Assert a task transition is valid, throw if not */
export declare function assertTaskTransition(from: TaskStatus, to: TaskStatus, taskId?: string): void;
/** All terminal subtask states */
export declare const SUBTASK_TERMINAL: ReadonlySet<SubtaskStatus>;
/** Subtask states where work has stopped and needs human action */
export declare const SUBTASK_STOPPING: ReadonlySet<SubtaskStatus>;
/** Subtask states that count as "completed work" (not needing re-execution on approval) */
export declare const SUBTASK_COMPLETED_WORK: ReadonlySet<SubtaskStatus>;
/** Subtask states that are approvable */
export declare const SUBTASK_APPROVABLE: ReadonlySet<SubtaskStatus>;
/** Check if a subtask state transition is valid */
export declare function isValidSubtaskTransition(from: SubtaskStatus, to: SubtaskStatus): boolean;
/** Assert a subtask transition is valid, throw if not */
export declare function assertSubtaskTransition(from: SubtaskStatus, to: SubtaskStatus, subtaskId?: string): void;
/** Is this subtask in a state where the builder already ran? */
export declare function hasBuilderResult(status: SubtaskStatus): boolean;
/** Is this subtask actively executing? */
export declare function isActive(status: SubtaskStatus): boolean;
/** Can this subtask be approved? */
export declare function isApprovable(status: SubtaskStatus): boolean;
/** Is this a final state for a subtask? */
export declare function isTerminal(status: SubtaskStatus): boolean;
/** Does this task need operator input? */
export declare function taskNeedsHuman(status: TaskStatus): boolean;
//# sourceMappingURL=state-machine.d.ts.map