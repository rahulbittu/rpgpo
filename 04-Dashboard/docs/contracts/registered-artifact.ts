// Contract: RegisteredArtifact
export interface RegisteredArtifact {
  artifact_id: string;
  source_id: string;
  type: string; // 22 artifact types
  scope: { lane?: string; domain?: string; project_id?: string; isolation_level: 'public' | 'engine' | 'project' };
  related_task_id?: string;
  related_graph_id?: string;
  related_node_id?: string;
  related_dossier_id?: string;
  producer: string;
  title: string;
  retention: 'active' | 'archived' | 'expired';
  integrity: 'valid' | 'stale' | 'superseded';
  created_at: string;
  updated_at: string;
}
