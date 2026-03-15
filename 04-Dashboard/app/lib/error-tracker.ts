// GPO Error Tracker — Centralized error tracking with categorization and trending

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const ERRORS_FILE = path.resolve(__dirname, '..', '..', 'state', 'error-tracker.json');
const MAX_ERRORS = 500;

export interface TrackedError {
  id: string;
  timestamp: number;
  category: 'provider' | 'parse' | 'validation' | 'system' | 'network' | 'timeout' | 'budget' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  code?: string;
  taskId?: string;
  providerId?: string;
  retryable: boolean;
  resolved: boolean;
  resolvedAt?: number;
  occurrences: number;
}

function readErrors(): TrackedError[] {
  try { if (fs.existsSync(ERRORS_FILE)) return JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8')); } catch { /* */ }
  return [];
}

function writeErrors(errors: TrackedError[]): void {
  if (errors.length > MAX_ERRORS) errors = errors.slice(-MAX_ERRORS);
  const dir = path.dirname(ERRORS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2));
}

export function trackError(data: {
  category: TrackedError['category'];
  severity: TrackedError['severity'];
  source: string;
  message: string;
  code?: string;
  taskId?: string;
  providerId?: string;
  retryable?: boolean;
}): string {
  const errors = readErrors();

  // Check for duplicate (same category + source + code within last 5 min)
  const recent = errors.find(e =>
    e.category === data.category &&
    e.source === data.source &&
    e.code === data.code &&
    !e.resolved &&
    Date.now() - e.timestamp < 300000
  );

  if (recent) {
    recent.occurrences++;
    recent.timestamp = Date.now();
    writeErrors(errors);
    return recent.id;
  }

  const error: TrackedError = {
    id: 'err_' + crypto.randomBytes(4).toString('hex'),
    timestamp: Date.now(),
    category: data.category,
    severity: data.severity,
    source: data.source,
    message: data.message.slice(0, 500),
    code: data.code,
    taskId: data.taskId,
    providerId: data.providerId,
    retryable: data.retryable ?? false,
    resolved: false,
    occurrences: 1,
  };

  errors.push(error);
  writeErrors(errors);
  return error.id;
}

export function resolveError(id: string): boolean {
  const errors = readErrors();
  const error = errors.find(e => e.id === id);
  if (!error) return false;
  error.resolved = true;
  error.resolvedAt = Date.now();
  writeErrors(errors);
  return true;
}

export function getErrors(filter?: { category?: string; severity?: string; resolved?: boolean; limit?: number }): TrackedError[] {
  let errors = readErrors();
  if (filter?.category) errors = errors.filter(e => e.category === filter.category);
  if (filter?.severity) errors = errors.filter(e => e.severity === filter.severity);
  if (filter?.resolved !== undefined) errors = errors.filter(e => e.resolved === filter.resolved);
  return errors.sort((a, b) => b.timestamp - a.timestamp).slice(0, filter?.limit || 50);
}

export function getErrorStats(): {
  total: number;
  unresolved: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byProvider: Record<string, number>;
  recentRate: number;
} {
  const errors = readErrors();
  const unresolved = errors.filter(e => !e.resolved);
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byProvider: Record<string, number> = {};

  for (const e of unresolved) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
    if (e.providerId) byProvider[e.providerId] = (byProvider[e.providerId] || 0) + 1;
  }

  // Recent rate: errors in last hour
  const lastHour = errors.filter(e => Date.now() - e.timestamp < 3600000).length;

  return { total: errors.length, unresolved: unresolved.length, byCategory, bySeverity, byProvider, recentRate: lastHour };
}

export function getSuggestions(): Array<{ error: string; suggestion: string; action?: string }> {
  const errors = getErrors({ resolved: false, limit: 10 });
  return errors.map(e => {
    let suggestion = 'Investigate and resolve manually';
    let action: string | undefined;

    switch (e.category) {
      case 'provider': suggestion = `Provider ${e.providerId || 'unknown'} is having issues. Check API key and quota.`; action = 'Check provider status'; break;
      case 'timeout': suggestion = 'Task timed out. Consider increasing timeout or reducing complexity.'; action = 'Retry task'; break;
      case 'parse': suggestion = 'AI output failed to parse. Check prompt quality and schema.'; action = 'Review prompt'; break;
      case 'budget': suggestion = 'Cost budget exceeded. Review budget settings or increase limit.'; action = 'Update budget'; break;
      case 'validation': suggestion = 'Output validation failed. Check contract definitions.'; break;
      case 'network': suggestion = 'Network error. Check internet connection and provider status.'; action = 'Retry'; break;
    }

    return { error: `${e.category}: ${e.message.slice(0, 80)}`, suggestion, action };
  });
}

module.exports = { trackError, resolveError, getErrors, getErrorStats, getSuggestions };
