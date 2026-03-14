// Contract: PromotionDecision
// Location: app/lib/types.ts
// Module: app/lib/promotion-control.ts

export type PromotionControlResult = 'allowed' | 'allowed_with_override' | 'blocked';

export interface PromotionDecision {
  decision_id: string;
  dossier_id: string;
  target_lane: 'dev' | 'beta' | 'prod';
  result: PromotionControlResult;
  enforcement_level: string;
  readiness_score?: number;
  blockers: string[];
  overrides_used: string[];
  decided_at: string;
}
