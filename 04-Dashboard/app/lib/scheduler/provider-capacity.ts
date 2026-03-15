// GPO Provider Capacity — Semaphore tracking with dynamic backpressure

import type { SchedulerConfig, QueueItem, CapacityWindow, BackpressureSignal, ProviderKey } from '../types';

const _inUse: Map<string, number> = new Map();
const _globalInUse = { count: 0 };
const _tenantInUse: Map<string, number> = new Map();
const _projectInUse: Map<string, number> = new Map();
let _signals: BackpressureSignal[] = [];

export function computeCapacityWindows(config: SchedulerConfig): CapacityWindow[] {
  const providers = Object.keys(config.perProviderMaxConcurrent);
  const now = Date.now();

  // Clean expired signals
  _signals = _signals.filter(s => new Date(s.at).getTime() + s.ttlMs > now);

  return providers.map(provider => {
    const baseLimit = config.perProviderMaxConcurrent[provider] || 1;
    const providerSignals = _signals.filter(s => s.provider === provider);
    const minFactor = providerSignals.length > 0 ? Math.min(...providerSignals.map(s => s.factor)) : 1;
    const dynamicLimit = Math.max(1, Math.floor(baseLimit * minFactor));
    const inUse = _inUse.get(provider) || 0;

    return {
      provider, baseLimit, dynamicLimit, inUse,
      available: Math.max(0, dynamicLimit - inUse),
      signals: providerSignals,
    };
  });
}

export function tryAcquire(item: QueueItem, config: SchedulerConfig): boolean {
  // Global limit
  if (_globalInUse.count >= config.globalMaxConcurrent) return false;

  // Provider limit
  const windows = computeCapacityWindows(config);
  const pw = windows.find(w => w.provider === item.provider);
  if (pw && pw.available <= 0) return false;

  // Tenant limit
  const tenantLimit = config.perTenantMaxConcurrent[item.tenantId];
  if (tenantLimit !== undefined) {
    const tenantUse = _tenantInUse.get(item.tenantId) || 0;
    if (tenantUse >= tenantLimit) return false;
  }

  // Project limit
  const projectLimit = config.perProjectMaxConcurrent[item.projectId];
  if (projectLimit !== undefined) {
    const projectUse = _projectInUse.get(item.projectId) || 0;
    if (projectUse >= projectLimit) return false;
  }

  // Acquire
  _globalInUse.count++;
  _inUse.set(item.provider, (_inUse.get(item.provider) || 0) + 1);
  _tenantInUse.set(item.tenantId, (_tenantInUse.get(item.tenantId) || 0) + 1);
  _projectInUse.set(item.projectId, (_projectInUse.get(item.projectId) || 0) + 1);
  return true;
}

export function release(item: QueueItem): void {
  _globalInUse.count = Math.max(0, _globalInUse.count - 1);
  _inUse.set(item.provider, Math.max(0, (_inUse.get(item.provider) || 0) - 1));
  _tenantInUse.set(item.tenantId, Math.max(0, (_tenantInUse.get(item.tenantId) || 0) - 1));
  _projectInUse.set(item.projectId, Math.max(0, (_projectInUse.get(item.projectId) || 0) - 1));
}

export function applyBackpressureSignals(signals: BackpressureSignal[]): void {
  _signals.push(...signals);
}

export function currentWindows(config: SchedulerConfig): CapacityWindow[] {
  return computeCapacityWindows(config);
}

export function reset(): void {
  _inUse.clear();
  _globalInUse.count = 0;
  _tenantInUse.clear();
  _projectInUse.clear();
  _signals = [];
}

module.exports = { computeCapacityWindows, tryAcquire, release, applyBackpressureSignals, currentWindows, reset };
