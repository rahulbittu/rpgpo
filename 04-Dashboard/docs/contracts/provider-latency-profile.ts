// Contract: ProviderLatencyProfile + ProviderLatencyDecision
export interface ProviderLatencyProfile {
  provider_id: string;
  avg_latency_ms: number;
  p95_latency_ms: number;
  recent_samples: number;
  classification: 'fast' | 'acceptable' | 'slow' | 'degraded';
  updated_at: string;
}

export interface ProviderLatencyDecision {
  decision_id: string;
  provider_id: string;
  role: string;
  lane: string;
  current_latency_ms: number;
  threshold_ms: number;
  outcome: 'proceed' | 'warn' | 'reroute' | 'fallback' | 'block';
  reason: string;
  created_at: string;
}
