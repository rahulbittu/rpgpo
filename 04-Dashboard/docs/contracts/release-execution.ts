// Contract: ReleaseExecution
export interface ReleaseExecution {
  execution_id: string;
  plan_id: string;
  status: 'executing' | 'verified' | 'failed' | 'rolled_back';
  started_at: string;
  completed_at?: string;
  verification_notes?: string;
  rollback_plan_id?: string;
}
