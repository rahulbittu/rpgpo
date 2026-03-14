// Contract: ComplianceExportResult
export interface ComplianceExportResult {
  export_id: string;
  scope_type: string;
  related_id: string;
  artifacts: ComplianceArtifact[];
  policy_versions: PolicyVersion[];
  evidence_summary: string;
  override_count: number;
  exception_count: number;
  readiness_score?: number;
  documentation_complete: boolean;
  created_at: string;
}
