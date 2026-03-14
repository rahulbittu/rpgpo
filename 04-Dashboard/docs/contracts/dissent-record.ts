// Contract: DissentRecord
export interface DissentRecord {
  dissent_id: string;
  session_id: string;
  provider_id: string;
  role: string;
  dissent_reason: string;
  proposal_opposed_id: string;
  alternative_proposal?: string;
  created_at: string;
}
