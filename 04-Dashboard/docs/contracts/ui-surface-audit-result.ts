// Contract: UISurfaceAuditResult
export interface UISurfaceAuditResult {
  audit_id: string;
  surfaces: UISurfaceDefinition[];
  total: number; complete: number; partial: number; empty: number;
  dead: number; api_only: number; hidden: number;
  top_gaps: string[];
  created_at: string;
}
