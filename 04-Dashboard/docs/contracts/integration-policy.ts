// Contract: IntegrationConnector
export interface IntegrationConnector {
  integration_id: string; name: string;
  category: 'provider_api' | 'storage' | 'docs_knowledge' | 'messaging' | 'deployment' | 'observability';
  trust_level: string; permissions: string[]; secret_scope: string;
  tenant_ids: string[]; enabled: boolean; usage_count: number;
  created_at: string; updated_at: string;
}
