// Contract: WorkflowActivationReport
export interface WorkflowActivationReport {
  report_id: string; workflows: ActivatedWorkflow[];
  total: number; activated: number; partial: number; blocked: number;
  top_blockers: string[]; created_at: string;
}
