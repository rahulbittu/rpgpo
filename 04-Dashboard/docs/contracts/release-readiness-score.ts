// Contract: ReleaseReadinessScore
// Location: app/lib/types.ts
// Module: app/lib/release-readiness.ts

export type ReadinessRecommendation = 'not_ready' | 'conditional' | 'ready';

export interface ReadinessRule {
  rule_id: string;              // rr_*
  category: string;
  title: string;
  weight: number;               // Points this rule contributes
  check_fn: string;             // Internal check function name
  enabled: boolean;
}

export interface ReleaseReadinessScore {
  score_id: string;             // rr_*
  related_type: 'graph' | 'dossier' | 'release';
  related_id: string;
  overall_score: number;        // 0-100
  category_scores: Record<string, {
    score: number;
    max: number;
    details: string;
  }>;
  blockers: string[];
  warnings: string[];
  recommendation: ReadinessRecommendation;
  created_at: string;           // ISO 8601
}
