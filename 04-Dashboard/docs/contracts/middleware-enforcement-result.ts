export interface MiddlewareEnforcementResult { area: string; route_count: number; enforced_count: number; state: 'enforced' | 'partially_enforced' | 'missing'; detail: string; }
