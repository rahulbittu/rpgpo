// Contract: MarketplaceListing
export interface MarketplaceListing {
  listing_id: string; asset_type: 'extension' | 'skill_pack' | 'engine_template' | 'shared_asset';
  asset_ref: string; name: string; description: string; owner: string; version: number;
  trust_level: string; permissions: string[];
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'deprecated';
  plan_availability: string[]; docs_complete: boolean; created_at: string; updated_at: string;
}
