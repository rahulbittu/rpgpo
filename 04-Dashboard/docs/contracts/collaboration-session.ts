// Contract: CollaborationSession
export interface CollaborationSession {
  session_id: string;
  scope_type: string;
  scope_id: string;
  domain?: string;
  project_id?: string;
  participants: Array<{ provider_id: string; role: string }>;
  protocol_type: string;
  status: 'open' | 'negotiating' | 'consensus_reached' | 'unresolved' | 'escalated' | 'closed';
  turns: CollaborationTurn[];
  proposals: AgentProposal[];
  consensus?: ConsensusDecision;
  created_at: string;
  updated_at: string;
}
