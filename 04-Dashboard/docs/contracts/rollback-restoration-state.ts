export interface RollbackRestorationState { path: string; state: 'fully_restorable' | 'partially_restorable' | 'logical_only'; detail: string; }
