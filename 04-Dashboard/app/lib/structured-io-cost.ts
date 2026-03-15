// GPO Structured I/O Cost — Per-call, per-provider, per-task cost tracking

import type { StructuredIoEvent, StructuredIoConfig } from './types';

let _config: StructuredIoConfig['cost'] | null = null;

export function initStructuredIoCost(costConfig: StructuredIoConfig['cost']): void {
  _config = costConfig;
}

function getConfig(): StructuredIoConfig['cost'] {
  if (_config) return _config;
  try {
    const { loadConfig } = require('./structured-io-metrics');
    const cfg = loadConfig();
    _config = cfg.cost;
    return _config!;
  } catch { /* */ }
  return { providerPricing: {}, defaultPricing: { inputPer1k: 2.0, outputPer1k: 6.0 } };
}

/**
 * Estimate cost in USD for a structured I/O call.
 */
export function estimateCostUsd(providerKey: string, inputTokens?: number, outputTokens?: number): number {
  const cfg = getConfig();
  const pricing = cfg.providerPricing[providerKey] || cfg.defaultPricing;
  const inCost = ((inputTokens || 0) / 1000) * pricing.inputPer1k;
  const outCost = ((outputTokens || 0) / 1000) * pricing.outputPer1k;
  return Math.round((inCost + outCost) * 1000000) / 1000000; // 6 decimal precision
}

/** Per-task cost accumulator */
const _taskCosts: Map<string, number> = new Map();

export function recordCost(event: StructuredIoEvent): void {
  if (!event.costUsd && (event.inputTokens || event.outputTokens)) {
    event.costUsd = estimateCostUsd(event.providerKey, event.inputTokens, event.outputTokens);
  }
  if (event.taskId && event.costUsd) {
    _taskCosts.set(event.taskId, (_taskCosts.get(event.taskId) || 0) + event.costUsd);
  }
}

export function getCostSummary(windowMinutes?: number): { totalUsd: number; byProvider: Record<string, number>; byTask: Record<string, number> } {
  try {
    const metrics = require('./structured-io-metrics');
    const snap = metrics.getCurrentSnapshot(windowMinutes);
    const byProvider: Record<string, number> = {};
    for (const [k, pm] of Object.entries(snap.byProvider)) {
      byProvider[k] = (pm as any).totalCostUsd || 0;
    }
    const byTask: Record<string, number> = {};
    _taskCosts.forEach((v, k) => { byTask[k] = v; });
    return { totalUsd: snap.totalCostUsd, byProvider, byTask };
  } catch {
    return { totalUsd: 0, byProvider: {}, byTask: {} };
  }
}

module.exports = { initStructuredIoCost, estimateCostUsd, recordCost, getCostSummary };
