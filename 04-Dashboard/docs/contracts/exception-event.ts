// Contract: ExceptionEvent + ExceptionAggregate
// Location: app/lib/types.ts
// Module: app/lib/exception-analytics.ts

export interface ExceptionEvent {
  event_id: string;
  category: 'override' | 'enforcement_block' | 'promotion_block' | 'simulation_failure' | 'readiness_shortfall' | 'escalation' | 'review_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lane?: string;
  domain?: string;
  project_id?: string;
  provider_id?: string;
  action?: string;
  blocker_type?: string;
  override_type?: string;
  detail: string;
  source_id: string;
  created_at: string;
}

export interface ExceptionAggregate {
  scope: string;
  total: number;
  by_category: Record<string, number>;
  by_severity: Record<string, number>;
  by_lane: Record<string, number>;
  by_domain: Record<string, number>;
  by_provider: Record<string, number>;
  hotspots: string[];
  trends: string[];
  window_start: string;
  window_end: string;
}
