// GPO Mission Control — Aggregated system state for operator dashboard

import type { MissionControlSummary, MissionControlPayload, MCHealth, NotificationBadgeCounts } from './types';

export function getMissionControlSummary(): MissionControlSummary {
  const counts = {
    workflowsActive: 0, workflowsStuck: 0, pendingApprovals: 0,
    openAlerts: 0, recentDeliverables: 0, providersDegraded: 0,
    queueDepth: 0, runningTasks: 0,
  };
  const notes: string[] = [];

  // Workflows
  try {
    const ws = require('./workflow-store') as { list(f?: any): any[] };
    const all = ws.list();
    const active = all.filter((w: any) => !['released', 'failed', 'cancelled'].includes(w.state));
    counts.workflowsActive = active.length;
    counts.workflowsStuck = active.filter((w: any) => w.state === 'blocked' || w.state === 'paused').length;
  } catch { notes.push('Workflow data unavailable'); }

  // Approvals
  try {
    const cos = require('./chief-of-staff') as { getDeliverableApprovalRequests?(): any[] };
    if (cos.getDeliverableApprovalRequests) {
      counts.pendingApprovals = cos.getDeliverableApprovalRequests().filter((r: any) => r.status === 'pending').length;
    }
  } catch { /* */ }

  // Alerts
  try {
    const alerts = require('./structured-io-alerts') as { listActiveAlerts(): any[] };
    counts.openAlerts = alerts.listActiveAlerts().length;
  } catch { /* */ }

  // Providers
  try {
    const pl = require('./provider-learning') as { getProviderLearningState(): Record<string, any> };
    const state = pl.getProviderLearningState();
    counts.providersDegraded = Object.values(state).filter((p: any) => p.circuitOpen || p.successRate < 0.7).length;
  } catch { /* */ }

  // Scheduler
  try {
    const wq = require('./scheduler/work-queue') as { stats(): any };
    const stats = wq.stats();
    counts.queueDepth = stats.queued || 0;
    counts.runningTasks = stats.inFlight || 0;
  } catch { /* */ }

  // Health computation
  let health: MCHealth = 'green';
  if (counts.openAlerts > 0 || counts.providersDegraded > 0 || counts.workflowsStuck > 0) health = 'yellow';
  if (counts.providersDegraded >= 2 || (counts.workflowsStuck > 0 && counts.workflowsActive > 0 && counts.workflowsStuck / counts.workflowsActive > 0.1)) health = 'red';

  return { timestamp: Date.now(), health, counts, notes: notes.length > 0 ? notes : undefined };
}

export function getMissionControlPayload(opts?: { limit?: { workflows?: number; deliverables?: number; alerts?: number } }): MissionControlPayload {
  const summary = getMissionControlSummary();
  const wLimit = opts?.limit?.workflows || 20;
  const dLimit = opts?.limit?.deliverables || 20;
  const aLimit = opts?.limit?.alerts || 20;

  let workflows: any[] = [];
  try {
    const ws = require('./workflow-store') as { list(f?: any): any[] };
    workflows = ws.list().slice(0, wLimit).map((w: any) => ({
      id: w.id, state: w.state, createdAt: w.createdAt, updatedAt: w.updatedAt,
      stuck: w.state === 'blocked' || w.state === 'paused',
    }));
  } catch { /* */ }

  let providers: any[] = [];
  try {
    const pl = require('./provider-learning') as { getProviderLearningState(): Record<string, any> };
    providers = Object.values(pl.getProviderLearningState()).map((p: any) => ({
      id: p.providerKey, health: p.circuitOpen ? 'down' : p.successRate < 0.7 ? 'degraded' : 'healthy',
      circuit: p.circuitOpen ? 'open' : 'closed',
      errorRate1m: 1 - p.successRate, p95LatencyMs1m: p.p95LatencyMs, cost1h: p.totalCostUsd,
    }));
  } catch { /* */ }

  let scheduler: any = { queueDepth: 0, runningTasks: 0, capacity: 1, backpressure: false };
  try {
    const wq = require('./scheduler/work-queue') as { stats(): any };
    const stats = wq.stats();
    scheduler = { queueDepth: stats.queued, runningTasks: stats.inFlight, capacity: 1, backpressure: false };
  } catch { /* */ }

  let alerts: any[] = [];
  try {
    const al = require('./structured-io-alerts') as { listActiveAlerts(): any[] };
    alerts = al.listActiveAlerts().slice(0, aLimit).map((a: any) => ({
      id: a.id, severity: 'warning', source: a.kind, message: a.details?.slice(0, 100),
      createdAt: a.windowEnd || Date.now(), acknowledged: a.acknowledged,
    }));
  } catch { /* */ }

  let badgeCounts: NotificationBadgeCounts = { unread: 0, unackedAlerts: 0, pendingApprovals: 0 };
  try {
    const notif = require('./notifications') as { getBadgeCounts(): NotificationBadgeCounts };
    badgeCounts = notif.getBadgeCounts();
  } catch { /* */ }

  return {
    summary, workflows, providers, scheduler, alerts,
    deliverables: [], approvals: [], badgeCounts,
  };
}

module.exports = { getMissionControlSummary, getMissionControlPayload };
