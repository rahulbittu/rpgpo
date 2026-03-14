// Contract: ConsensusDecision
export interface ConsensusDecision {
  session_id: string;
  level: 'unanimous' | 'majority' | 'split' | 'blocked';
  winning_proposal_id?: string;
  total_votes: number;
  votes_for: number;
  votes_against: number;
  abstentions: number;
  rationale: string;
  created_at: string;
}
