export interface MutationGuardDecision { route: string; method: string; allowed: boolean; outcome: 'allow' | 'deny' | 'redact_response' | 'require_approval'; reason: string; }
