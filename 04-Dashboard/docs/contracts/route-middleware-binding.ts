export interface RouteMiddlewareBinding { route: string; method: string; guard_type: 'entitlement' | 'boundary' | 'isolation' | 'extension' | 'provider'; tenant_param: string; enforced: boolean; }
