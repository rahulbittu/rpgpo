// Contract: ApprovalDecisionRecord
export interface ApprovalDecisionRecord {
  decision_id: string;
  request_id: string;
  decision: 'approve' | 'reject' | 'request_evidence';
  decided_by: string;
  notes: string;
  created_at: string;
}
