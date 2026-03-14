// Contract: TelemetryEvent + TelemetryMetric
export interface TelemetryEvent {
  event_id: string;
  category: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked' | 'warning';
  duration_ms?: number;
  lane?: string;
  domain?: string;
  project_id?: string;
  provider_id?: string;
  created_at: string;
}

export interface TelemetryMetric {
  metric: string;
  value: number;
  unit: string;
  scope: string;
  window: string;
}
