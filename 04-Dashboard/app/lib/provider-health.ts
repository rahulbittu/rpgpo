// GPO Provider Health Monitor — Real-time provider status and reliability tracking

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const HEALTH_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-health.json');

export interface ProviderHealth {
  providerId: string;
  displayName: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastCheck: number;
  lastSuccess: number;
  lastError?: string;
  uptime24h: number;
  successRate1h: number;
  avgLatencyMs: number;
  totalCalls: number;
  recentErrors: string[];
}

let _healthData: Record<string, ProviderHealth> = {};

function loadHealth(): void {
  try { if (fs.existsSync(HEALTH_FILE)) _healthData = JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf-8')); } catch { _healthData = {}; }
}

function saveHealth(): void {
  const dir = path.dirname(HEALTH_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(HEALTH_FILE, JSON.stringify(_healthData, null, 2));
}

const PROVIDER_NAMES: Record<string, string> = {
  openai: 'OpenAI GPT-4o', perplexity: 'Perplexity Sonar', gemini: 'Google Gemini', claude: 'Claude (Local)',
};

export function recordProviderCall(providerId: string, success: boolean, latencyMs: number, errorMsg?: string): void {
  loadHealth();
  if (!_healthData[providerId]) {
    _healthData[providerId] = {
      providerId, displayName: PROVIDER_NAMES[providerId] || providerId,
      status: 'unknown', lastCheck: 0, lastSuccess: 0, uptime24h: 1,
      successRate1h: 1, avgLatencyMs: 0, totalCalls: 0, recentErrors: [],
    };
  }

  const h = _healthData[providerId];
  h.lastCheck = Date.now();
  h.totalCalls++;

  const alpha = 0.1;
  h.avgLatencyMs = alpha * latencyMs + (1 - alpha) * h.avgLatencyMs;
  h.successRate1h = alpha * (success ? 1 : 0) + (1 - alpha) * h.successRate1h;
  h.uptime24h = 0.01 * (success ? 1 : 0) + 0.99 * h.uptime24h;

  if (success) {
    h.lastSuccess = Date.now();
    h.status = h.successRate1h > 0.9 ? 'healthy' : 'degraded';
  } else {
    h.lastError = errorMsg?.slice(0, 200);
    h.recentErrors.push(`${new Date().toISOString()}: ${errorMsg?.slice(0, 100)}`);
    if (h.recentErrors.length > 10) h.recentErrors = h.recentErrors.slice(-10);
    h.status = h.successRate1h < 0.5 ? 'down' : 'degraded';
  }

  saveHealth();
}

export function getProviderHealth(): ProviderHealth[] {
  loadHealth();
  const providers = ['openai', 'perplexity', 'gemini', 'claude'];
  return providers.map(p => _healthData[p] || {
    providerId: p, displayName: PROVIDER_NAMES[p] || p,
    status: 'unknown' as const, lastCheck: 0, lastSuccess: 0,
    uptime24h: 0, successRate1h: 0, avgLatencyMs: 0, totalCalls: 0, recentErrors: [],
  });
}

export function getProviderStatus(providerId: string): ProviderHealth | null {
  loadHealth();
  return _healthData[providerId] || null;
}

module.exports = { recordProviderCall, getProviderHealth, getProviderStatus };
