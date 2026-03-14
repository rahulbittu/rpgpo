// GPO Route Middleware Enforcement — Inline route guard bindings and coverage

import type { RouteMiddlewareBinding, MiddlewareBindingCoverage, RouteEnforcementExecution } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EXEC_FILE = path.resolve(__dirname, '..', '..', 'state', 'route-enforcement-executions.json');

function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Protected route bindings — these are enforced inline in server.js */
export function getBindings(): RouteMiddlewareBinding[] {
  return [
    { route: '/api/compliance-export', method: 'GET', guard_type: 'entitlement', tenant_param: 'x-tenant-id', enforced: true },
    { route: '/api/compliance-export', method: 'POST', guard_type: 'entitlement', tenant_param: 'x-tenant-id', enforced: true },
    { route: '/api/tenant-admin', method: 'GET', guard_type: 'isolation', tenant_param: 'x-tenant-id', enforced: true },
    { route: '/api/audit-hub', method: 'GET', guard_type: 'boundary', tenant_param: 'x-project-id', enforced: true },
    { route: '/api/release-orchestration', method: 'GET', guard_type: 'entitlement', tenant_param: 'x-tenant-id', enforced: true },
    { route: '/api/marketplace', method: 'GET', guard_type: 'extension', tenant_param: 'x-tenant-id', enforced: true },
    { route: '/api/enforcement-evidence', method: 'GET', guard_type: 'boundary', tenant_param: 'x-project-id', enforced: true },
    { route: '/api/release-provider-gating', method: 'GET', guard_type: 'provider', tenant_param: 'x-tenant-id', enforced: true },
  ];
}

/** Get middleware binding coverage */
export function getCoverage(): MiddlewareBindingCoverage {
  const bindings = getBindings();
  const enforced = bindings.filter(b => b.enforced).length;
  return {
    total_protected: bindings.length,
    total_enforced: enforced,
    bindings,
    coverage_percent: bindings.length > 0 ? Math.round((enforced / bindings.length) * 100) : 0,
    created_at: new Date().toISOString(),
  };
}

/** Record a route enforcement execution */
export function recordExecution(route: string, guardType: string, tenantId: string, outcome: 'allow' | 'deny' | 'redact', httpStatus: number, detail: string): RouteEnforcementExecution {
  const exec: RouteEnforcementExecution = { route, guard_type: guardType, tenant_id: tenantId, outcome, http_status: httpStatus, detail, created_at: new Date().toISOString() };
  const all = readJson<RouteEnforcementExecution[]>(EXEC_FILE, []);
  all.unshift(exec);
  if (all.length > 500) all.length = 500;
  writeJson(EXEC_FILE, all);
  return exec;
}

/** Get enforcement executions */
export function getExecutions(route?: string): RouteEnforcementExecution[] {
  const all = readJson<RouteEnforcementExecution[]>(EXEC_FILE, []);
  return route ? all.filter(e => e.route === route) : all;
}

module.exports = { getBindings, getCoverage, recordExecution, getExecutions };
