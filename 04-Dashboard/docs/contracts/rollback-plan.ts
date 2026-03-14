// Contract: RollbackPlan + RollbackExecution
export interface RollbackPlan {
  plan_id: string;
  release_execution_id: string;
  trigger: 'failed_verification' | 'post_release_block' | 'provider_incident' | 'policy_violation' | 'manual_request';
  description: string;
  affected_artifacts: string[];
  status: 'ready' | 'executing' | 'completed' | 'failed';
  created_at: string;
}

export interface RollbackExecution {
  execution_id: string;
  plan_id: string;
  release_execution_id: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  executed_at: string;
}
