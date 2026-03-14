// Contract: SLODefinition + SLOStatus
export interface SLODefinition {
  slo_id: string;
  name: string;
  target: number;
  unit: string;
  scope: string;
  lane?: string;
}

export interface SLOStatus {
  slo_id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  met: boolean;
  budget_remaining: number;
}
