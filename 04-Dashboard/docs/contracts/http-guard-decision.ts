export interface HTTPGuardDecision { allowed: boolean; status: number; outcome: 'allow' | 'deny' | 'redact'; payload: unknown; reason: string; }
