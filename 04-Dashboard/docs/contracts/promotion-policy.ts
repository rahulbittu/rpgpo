// Contract: PromotionPolicy
// Location: app/lib/types.ts
// Module: app/lib/promotion-control.ts

export interface PromotionPolicy {
  policy_id: string;
  target_lane: 'dev' | 'beta' | 'prod';
  min_readiness_score: number;
  require_all_reviews_passed: boolean;
  require_documentation_complete: boolean;
  require_no_open_escalations: boolean;
  allow_override: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
