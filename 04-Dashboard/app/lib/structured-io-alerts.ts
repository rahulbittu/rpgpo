// GPO Structured I/O Alerts — Spike detection and alert lifecycle

import type { StructuredIoAlert, StructuredIoConfig } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ALERTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'alerts', 'structured-io.json');

let _config: StructuredIoConfig['alerts'] | null = null;
let _alerts: StructuredIoAlert[] = [];
let _lastEval: Record<string, number> = {};

function uid(): string { return 'sio_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

export function initStructuredIoAlerts(alertsConfig?: StructuredIoConfig['alerts']): void {
  if (alertsConfig) _config = alertsConfig;
  loadAlerts();
}

function getConfig(): StructuredIoConfig['alerts'] {
  if (_config) return _config;
  try {
    const { loadConfig } = require('./structured-io-metrics');
    const cfg = loadConfig();
    _config = cfg.alerts;
    return _config!;
  } catch { /* */ }
  return { parseFailureRateThreshold: 0.2, providerErrorRateThreshold: 0.3, minCalls: 20, evaluationIntervalMinutes: 5, cooldownMinutes: 30 };
}

function loadAlerts(): void {
  try {
    if (fs.existsSync(ALERTS_FILE)) {
      _alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf-8'));
    }
  } catch { _alerts = []; }
}

function saveAlerts(): void {
  try {
    const dir = path.dirname(ALERTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(_alerts.slice(-200), null, 2));
  } catch { /* non-fatal */ }
}

/**
 * Evaluate current metrics and generate alerts if thresholds exceeded.
 */
export function evaluateAlerts(now?: number): StructuredIoAlert[] {
  const cfg = getConfig();
  const currentTime = now || Date.now();
  const newAlerts: StructuredIoAlert[] = [];

  let snap: any;
  try {
    const metrics = require('./structured-io-metrics');
    snap = metrics.getCurrentSnapshot(cfg.evaluationIntervalMinutes);
  } catch { return []; }

  if (snap.totalCalls < cfg.minCalls) return [];

  // Check parse failure spike
  if (snap.parseFailureRate > cfg.parseFailureRateThreshold) {
    if (!isOnCooldown('parse_spike', undefined, currentTime, cfg.cooldownMinutes)) {
      const alert: StructuredIoAlert = {
        id: uid(), kind: 'parse_spike',
        windowStart: snap.windowStart, windowEnd: snap.windowEnd,
        observedRate: snap.parseFailureRate,
        threshold: cfg.parseFailureRateThreshold,
        totalCalls: snap.totalCalls,
        acknowledged: false,
        details: `Parse failure rate ${(snap.parseFailureRate * 100).toFixed(1)}% exceeds ${(cfg.parseFailureRateThreshold * 100).toFixed(1)}% threshold over ${snap.totalCalls} calls`,
      };
      newAlerts.push(alert);
      _lastEval['parse_spike:global'] = currentTime;
    }
  }

  // Check per-provider error spikes
  for (const [key, pm] of Object.entries(snap.byProvider) as Array<[string, any]>) {
    if (pm.totalCalls < cfg.minCalls) continue;
    if (pm.providerErrorRate > cfg.providerErrorRateThreshold) {
      if (!isOnCooldown('provider_error_spike', key, currentTime, cfg.cooldownMinutes)) {
        const alert: StructuredIoAlert = {
          id: uid(), kind: 'provider_error_spike',
          providerKey: key,
          windowStart: snap.windowStart, windowEnd: snap.windowEnd,
          observedRate: pm.providerErrorRate,
          threshold: cfg.providerErrorRateThreshold,
          totalCalls: pm.totalCalls,
          acknowledged: false,
          details: `Provider ${key} error rate ${(pm.providerErrorRate * 100).toFixed(1)}% exceeds ${(cfg.providerErrorRateThreshold * 100).toFixed(1)}% threshold`,
        };
        newAlerts.push(alert);
        _lastEval[`provider_error_spike:${key}`] = currentTime;
      }
    }
  }

  if (newAlerts.length > 0) {
    _alerts.push(...newAlerts);
    saveAlerts();
  }

  return newAlerts;
}

export function listActiveAlerts(): StructuredIoAlert[] {
  return _alerts.filter(a => !a.acknowledged);
}

export function listAllAlerts(): StructuredIoAlert[] {
  return [..._alerts];
}

export function acknowledgeAlert(id: string, actor: string): boolean {
  const alert = _alerts.find(a => a.id === id);
  if (!alert) return false;
  alert.acknowledged = true;
  alert.acknowledgedBy = actor;
  alert.acknowledgedAt = Date.now();
  saveAlerts();
  return true;
}

function isOnCooldown(kind: string, providerKey: string | undefined, now: number, cooldownMinutes: number): boolean {
  const key = `${kind}:${providerKey || 'global'}`;
  const last = _lastEval[key];
  if (!last) return false;
  return (now - last) < cooldownMinutes * 60000;
}

module.exports = { initStructuredIoAlerts, evaluateAlerts, listActiveAlerts, listAllAlerts, acknowledgeAlert };
