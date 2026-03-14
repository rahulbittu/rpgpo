// Contract: AuditPackage
export interface AuditPackage {
  package_id: string;
  scope_type: string;
  related_id: string;
  artifacts: RegisteredArtifact[];
  evidence: EvidenceBundle | null;
  ledger_entries: TraceabilityLedgerEntry[];
  findings: AuditFinding[];
  summary: string;
  created_at: string;
}

export interface AuditFinding {
  finding_id: string;
  category: string;
  severity: 'info' | 'warning' | 'issue' | 'critical';
  title: string;
  detail: string;
  related_artifact_ids: string[];
  created_at: string;
}
