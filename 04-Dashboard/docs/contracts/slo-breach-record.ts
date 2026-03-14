// Contract: SLOBreachRecord
export interface SLOBreachRecord {
  breach_id: string; slo_id: string; slo_name: string;
  target: number; actual: number; unit: string;
  severity: 'warning' | 'critical'; routed_to: string; created_at: string;
}
