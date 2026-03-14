// Contract: NegotiationOutcome
export interface NegotiationOutcome {
  session_id: string;
  protocol_type: string;
  rounds_completed: number;
  outcome: 'accepted' | 'revision_required' | 'unresolved' | 'escalate_board' | 'escalate_operator';
  winning_proposal_id?: string;
  reason: string;
  created_at: string;
}
