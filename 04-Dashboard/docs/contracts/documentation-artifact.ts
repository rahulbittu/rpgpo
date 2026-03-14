// Contract: DocumentationRequirement + DocumentationArtifact
// Location: app/lib/types.ts
// Module: app/lib/documentation-governance.ts

export interface DocumentationRequirement {
  req_id: string;                             // Unique ID (dr_*)
  scope_type: DocScopeType;                   // What kind of thing needs docs
  title: string;
  description: string;
  required_artifacts: string[];               // Named artifact types needed
  lane_behavior: Record<Lane, DocBlockLevel>; // How strictly to enforce per lane
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentationArtifact {
  artifact_id: string;                        // Unique ID (da_*)
  req_id?: string;                            // Links to requirement
  scope_type: DocScopeType;                   // architecture_part | execution_graph | promotion | release
  related_id: string;                         // ID of the related entity
  title: string;
  path: string;                               // File path to the document
  status: 'draft' | 'complete' | 'outdated';
  created_at: string;
  updated_at: string;
}

export type DocScopeType = 'architecture_part' | 'execution_graph' | 'promotion' | 'release';
export type DocBlockLevel = 'warn' | 'soft_block' | 'hard_block';
export type Lane = 'dev' | 'beta' | 'prod';
