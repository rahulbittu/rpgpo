// Contract: ProviderIncident
export interface ProviderIncident {
  incident_id: string;
  provider_id: string;
  incident_type: 'repeated_failure' | 'latency_spike' | 'governance_issue' | 'cost_spike' | 'reliability_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
  domain?: string;
  project_id?: string;
  resolved: boolean;
  created_at: string;
}
