/**
 * GPO Behavior Learning System
 *
 * Captures operator events, derives behavioral signals, and provides
 * execution guidance based on learned preferences.
 *
 * Architecture:
 *   Events (JSONL append-only) → Signals (derived JSON) → Guidance (query API)
 *
 * Safety: Conservative, explainable, confidence-gated.
 * All signals require minimum event count before activation.
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Canonical Engine Mapping ──────────────────────────
let _toCanonical: (id: string) => string;
try {
  const ce = require('./canonical-engines');
  _toCanonical = ce.toCanonical;
} catch {
  _toCanonical = (id: string) => id; // fallback: identity
}

// ─── Paths ─────────────────────────────────────────────
const ARTIFACTS_DIR = path.resolve(__dirname, '..', '..', '..', 'artifacts', 'behavior');
const EVENTS_FILE = path.join(ARTIFACTS_DIR, 'operator-events.jsonl');
const SIGNALS_FILE = path.join(ARTIFACTS_DIR, 'operator-signals.json');
const ENGINE_PREFS_FILE = path.join(ARTIFACTS_DIR, 'engine-preferences.json');
const LEARNING_LOG_FILE = path.join(ARTIFACTS_DIR, 'behavior-learning-log.md');

function ensureDir() {
  if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

// ─── Event Types ───────────────────────────────────────
export type BehaviorEventType =
  | 'task_created'
  | 'task_routed'
  | 'engine_overridden'
  | 'provider_overridden'
  | 'approval_granted'
  | 'approval_denied'
  | 'approval_timeout'
  | 'rewrite_requested'
  | 'followup_requested'
  | 'deliverable_downloaded'
  | 'deliverable_ignored'
  | 'output_accepted'
  | 'output_abandoned'
  | 'export_generated'
  | 'escalation_triggered'
  | 'depth_preference'
  | 'format_preference'
  | 'speed_preference';

export interface BehaviorEvent {
  id: string;
  type: BehaviorEventType;
  timestamp: string;
  taskId?: string;
  subtaskId?: string;
  engine?: string;
  provider?: string;
  metadata: Record<string, any>;
}

// ─── Signal Types ──────────────────────────────────────
export type SignalScope = 'global' | 'engine' | 'project' | 'workflow';

export type SignalProvenance = 'explicit_profile' | 'seeded_historical' | 'live_observed';

export interface BehaviorSignal {
  name: string;
  value: any;
  confidence: number;       // 0.0 - 1.0
  scope: SignalScope;
  scopeKey?: string;        // engine name, project id, etc.
  sourceEventCount: number;
  lastUpdated: string;
  active: boolean;           // false = advisory only
  provenance?: SignalProvenance; // where this signal came from — set by post-processing if not explicit
  reinforced_count?: number; // how many times this signal has been re-derived with consistent value (ECC instinct-inspired)
  explanation: string;
}

// ─── Minimum thresholds for signal activation ──────────
const MIN_EVENTS_FOR_SIGNAL = 5;
const MIN_CONFIDENCE_FOR_ACTIVE = 0.6;

// ─── Event Capture ─────────────────────────────────────

function generateEventId(): string {
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Record an operator behavior event.
 * Append-only to JSONL for durability and auditability.
 */
function recordEvent(type: BehaviorEventType, metadata: Record<string, any> = {}, context: { taskId?: string; subtaskId?: string; engine?: string; provider?: string } = {}): BehaviorEvent {
  ensureDir();
  const event: BehaviorEvent = {
    id: generateEventId(),
    type,
    timestamp: new Date().toISOString(),
    taskId: context.taskId,
    subtaskId: context.subtaskId,
    engine: context.engine ? _toCanonical(context.engine) : undefined,
    provider: context.provider,
    metadata,
  };
  fs.appendFileSync(EVENTS_FILE, JSON.stringify(event) + '\n');
  return event;
}

/**
 * Read all recorded events.
 */
function readEvents(): BehaviorEvent[] {
  ensureDir();
  if (!fs.existsSync(EVENTS_FILE)) return [];
  const lines = fs.readFileSync(EVENTS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
  return lines.map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean) as BehaviorEvent[];
}

/**
 * Read events filtered by type.
 */
function readEventsByType(type: BehaviorEventType): BehaviorEvent[] {
  return readEvents().filter(e => e.type === type);
}

/**
 * Read events for a specific engine.
 */
function readEventsByEngine(engine: string): BehaviorEvent[] {
  return readEvents().filter(e => e.engine === engine);
}

// ─── Signal Derivation ────────────────────────────────

/**
 * Determine provenance for event-based signals.
 * If all source events are seeded, provenance is seeded_historical.
 * If any live events exist, provenance is live_observed.
 */
function determineProvenance(sourceEvents: BehaviorEvent[]): SignalProvenance {
  if (sourceEvents.length === 0) return 'seeded_historical';
  const hasLive = sourceEvents.some(e => !e.metadata?.source || e.metadata.source !== 'historical_seed');
  return hasLive ? 'live_observed' : 'seeded_historical';
}

/**
 * Derive all behavioral signals from the event log.
 * Called periodically or after significant event batches.
 */
function deriveSignals(): BehaviorSignal[] {
  const events = readEvents();
  if (events.length === 0) return [];

  const signals: BehaviorSignal[] = [];

  // 1. Approval strictness (global)
  const approvals = events.filter(e => e.type === 'approval_granted');
  const denials = events.filter(e => e.type === 'approval_denied');
  const totalDecisions = approvals.length + denials.length;
  if (totalDecisions >= MIN_EVENTS_FOR_SIGNAL) {
    const approvalRate = approvals.length / totalDecisions;
    signals.push({
      name: 'approval_strictness',
      value: approvalRate < 0.5 ? 'strict' : approvalRate < 0.8 ? 'moderate' : 'permissive',
      confidence: Math.min(1.0, totalDecisions / 20),
      scope: 'global',
      sourceEventCount: totalDecisions,
      lastUpdated: new Date().toISOString(),
      active: totalDecisions >= MIN_EVENTS_FOR_SIGNAL * 2,
      provenance: determineProvenance([...approvals, ...denials]),
      explanation: `Based on ${totalDecisions} decisions: ${approvals.length} approved, ${denials.length} denied (${(approvalRate * 100).toFixed(0)}% approval rate)`,
    });
  }

  // 2. Engine-specific approval rates
  const engineDecisions: Record<string, { approved: number; denied: number }> = {};
  [...approvals, ...denials].forEach(e => {
    if (!e.engine) return;
    if (!engineDecisions[e.engine]) engineDecisions[e.engine] = { approved: 0, denied: 0 };
    if (e.type === 'approval_granted') engineDecisions[e.engine].approved++;
    else engineDecisions[e.engine].denied++;
  });
  for (const [engine, counts] of Object.entries(engineDecisions)) {
    const total = counts.approved + counts.denied;
    if (total >= 3) {
      const rate = counts.approved / total;
      signals.push({
        name: 'engine_approval_rate',
        value: rate,
        confidence: Math.min(1.0, total / 10),
        scope: 'engine',
        scopeKey: engine,
        sourceEventCount: total,
        lastUpdated: new Date().toISOString(),
        active: total >= MIN_EVENTS_FOR_SIGNAL,
        explanation: `Engine ${engine}: ${counts.approved}/${total} approved (${(rate * 100).toFixed(0)}%)`,
      });
    }
  }

  // 3. Preferred providers by engine
  const routingEvents = events.filter(e => e.type === 'task_routed' && e.engine && e.provider);
  const providerByEngine: Record<string, Record<string, number>> = {};
  routingEvents.forEach(e => {
    if (!providerByEngine[e.engine!]) providerByEngine[e.engine!] = {};
    providerByEngine[e.engine!][e.provider!] = (providerByEngine[e.engine!][e.provider!] || 0) + 1;
  });
  for (const [engine, providers] of Object.entries(providerByEngine)) {
    const total = Object.values(providers).reduce((a, b) => a + b, 0);
    if (total >= MIN_EVENTS_FOR_SIGNAL) {
      const sorted = Object.entries(providers).sort((a, b) => b[1] - a[1]);
      signals.push({
        name: 'preferred_provider',
        value: sorted[0][0],
        confidence: Math.min(1.0, sorted[0][1] / total),
        scope: 'engine',
        scopeKey: engine,
        sourceEventCount: total,
        lastUpdated: new Date().toISOString(),
        active: sorted[0][1] / total >= MIN_CONFIDENCE_FOR_ACTIVE,
        explanation: `Engine ${engine} provider usage: ${sorted.map(([p, c]) => `${p}=${c}`).join(', ')}`,
      });
    }
  }

  // 4. Engine override frequency (manual routing preference)
  const overrides = events.filter(e => e.type === 'engine_overridden');
  if (overrides.length >= 3) {
    const taskTotal = events.filter(e => e.type === 'task_created').length;
    const overrideRate = taskTotal > 0 ? overrides.length / taskTotal : 0;
    signals.push({
      name: 'routing_override_tendency',
      value: overrideRate > 0.3 ? 'frequent' : overrideRate > 0.1 ? 'occasional' : 'rare',
      confidence: Math.min(1.0, overrides.length / 10),
      scope: 'global',
      sourceEventCount: overrides.length,
      lastUpdated: new Date().toISOString(),
      active: overrides.length >= MIN_EVENTS_FOR_SIGNAL,
      explanation: `${overrides.length} engine overrides out of ${taskTotal} tasks (${(overrideRate * 100).toFixed(1)}%)`,
    });
  }

  // 5. Output acceptance vs abandonment
  const accepted = events.filter(e => e.type === 'output_accepted');
  const abandoned = events.filter(e => e.type === 'output_abandoned');
  const downloaded = events.filter(e => e.type === 'deliverable_downloaded');
  const totalOutputDecisions = accepted.length + abandoned.length;
  if (totalOutputDecisions >= MIN_EVENTS_FOR_SIGNAL) {
    const acceptRate = accepted.length / totalOutputDecisions;
    signals.push({
      name: 'output_satisfaction',
      value: acceptRate > 0.8 ? 'high' : acceptRate > 0.5 ? 'moderate' : 'low',
      confidence: Math.min(1.0, totalOutputDecisions / 20),
      scope: 'global',
      sourceEventCount: totalOutputDecisions,
      lastUpdated: new Date().toISOString(),
      active: totalOutputDecisions >= MIN_EVENTS_FOR_SIGNAL * 2,
      explanation: `${accepted.length} accepted, ${abandoned.length} abandoned, ${downloaded.length} downloaded`,
    });
  }

  // 6. Rewrite frequency (quality signal)
  const rewrites = events.filter(e => e.type === 'rewrite_requested');
  if (rewrites.length >= 3) {
    const taskTotal = events.filter(e => e.type === 'task_created').length;
    const rewriteRate = taskTotal > 0 ? rewrites.length / taskTotal : 0;
    signals.push({
      name: 'rewrite_frequency',
      value: rewriteRate,
      confidence: Math.min(1.0, rewrites.length / 10),
      scope: 'global',
      sourceEventCount: rewrites.length,
      lastUpdated: new Date().toISOString(),
      active: rewrites.length >= MIN_EVENTS_FOR_SIGNAL,
      explanation: `${rewrites.length} rewrites out of ${taskTotal} tasks (${(rewriteRate * 100).toFixed(1)}%)`,
    });
  }

  // 7. Follow-up intensity
  const followups = events.filter(e => e.type === 'followup_requested');
  if (followups.length >= 3) {
    signals.push({
      name: 'followup_intensity',
      value: followups.length > 20 ? 'high' : followups.length > 5 ? 'moderate' : 'low',
      confidence: Math.min(1.0, followups.length / 15),
      scope: 'global',
      sourceEventCount: followups.length,
      lastUpdated: new Date().toISOString(),
      active: followups.length >= MIN_EVENTS_FOR_SIGNAL,
      explanation: `${followups.length} follow-up requests recorded`,
    });
  }

  // 8. Output satisfaction PER ENGINE
  const acceptedByEngine: Record<string, number> = {};
  const abandonedByEngine: Record<string, number> = {};
  const eventsByEngine: Record<string, BehaviorEvent[]> = {};
  accepted.forEach(e => { if (e.engine) { acceptedByEngine[e.engine] = (acceptedByEngine[e.engine] || 0) + 1; if (!eventsByEngine[e.engine]) eventsByEngine[e.engine] = []; eventsByEngine[e.engine].push(e); } });
  abandoned.forEach(e => { if (e.engine) { abandonedByEngine[e.engine] = (abandonedByEngine[e.engine] || 0) + 1; if (!eventsByEngine[e.engine]) eventsByEngine[e.engine] = []; eventsByEngine[e.engine].push(e); } });
  const allEnginesArr = Object.keys(acceptedByEngine).concat(Object.keys(abandonedByEngine)).filter((v, i, a) => a.indexOf(v) === i);
  for (const engine of allEnginesArr) {
    const acc = acceptedByEngine[engine] || 0;
    const abn = abandonedByEngine[engine] || 0;
    const total = acc + abn;
    if (total >= 3) {
      const rate = acc / total;
      signals.push({
        name: 'output_satisfaction',
        value: rate > 0.9 ? 'high' : rate > 0.7 ? 'moderate' : 'low',
        confidence: Math.min(1.0, total / 15),
        scope: 'engine' as SignalScope,
        scopeKey: engine,
        sourceEventCount: total,
        lastUpdated: new Date().toISOString(),
        active: total >= MIN_EVENTS_FOR_SIGNAL,
        provenance: determineProvenance(eventsByEngine[engine] || []),
        explanation: `Engine ${engine}: ${acc} accepted, ${abn} abandoned (${(rate * 100).toFixed(0)}% satisfaction)`,
      });
    }
  }

  // 9. Task volume by engine (indicates operator priority)
  const tasksByEngine: Record<string, number> = {};
  events.filter(e => e.type === 'task_created' && e.engine).forEach(e => {
    tasksByEngine[e.engine!] = (tasksByEngine[e.engine!] || 0) + 1;
  });
  const totalTasks = events.filter(e => e.type === 'task_created').length;
  for (const [engine, count] of Object.entries(tasksByEngine)) {
    if (count >= 3) {
      const share = count / totalTasks;
      signals.push({
        name: 'task_volume',
        value: { count, share: Math.round(share * 100) + '%' },
        confidence: Math.min(1.0, count / 20),
        scope: 'engine' as SignalScope,
        scopeKey: engine,
        sourceEventCount: count,
        lastUpdated: new Date().toISOString(),
        active: count >= MIN_EVENTS_FOR_SIGNAL,
        explanation: `Engine ${engine}: ${count} tasks (${(share * 100).toFixed(1)}% of total)`,
      });
    }
  }

  // 10. Operator profile signals (from static profile if available)
  try {
    const profilePath = path.resolve(__dirname, '..', '..', 'state', 'context', 'operator-profile.json');
    if (fs.existsSync(profilePath)) {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
      if (profile.communication_style) {
        signals.push({
          name: 'communication_style',
          value: profile.communication_style,
          confidence: 1.0,
          scope: 'global' as SignalScope,
          sourceEventCount: 1,
          lastUpdated: new Date().toISOString(),
          active: true,
          provenance: 'explicit_profile' as SignalProvenance,
          explanation: `From operator profile: communication_style = ${profile.communication_style}`,
        });
      }
      if (profile.output_preferences) {
        signals.push({
          name: 'output_preferences',
          value: profile.output_preferences,
          confidence: 1.0,
          scope: 'global' as SignalScope,
          sourceEventCount: 1,
          lastUpdated: new Date().toISOString(),
          active: true,
          provenance: 'explicit_profile' as SignalProvenance,
          explanation: `From operator profile: stated output preferences`,
        });
      }
      if (profile.risk_tolerance) {
        signals.push({
          name: 'risk_tolerance',
          value: profile.risk_tolerance,
          confidence: 1.0,
          scope: 'global' as SignalScope,
          sourceEventCount: 1,
          lastUpdated: new Date().toISOString(),
          active: true,
          provenance: 'explicit_profile' as SignalProvenance,
          explanation: `From operator profile: risk_tolerance = ${profile.risk_tolerance}`,
        });
      }
    }
  } catch { /* profile not available */ }

  // 11. Verification metrics — first-pass clean rate (ECC-inspired eval pattern)
  const liveAccepted = events.filter(e => e.type === 'output_accepted' && e.metadata?.source === 'workflow_completion');
  const liveAbandoned = events.filter(e => e.type === 'output_abandoned' && e.metadata?.source === 'workflow_completion');
  const liveTotal = liveAccepted.length + liveAbandoned.length;
  if (liveTotal >= 5) {
    const cleanRate = liveAccepted.length / liveTotal;
    // Average quality metrics from live events
    const withQuality = liveAccepted.filter(e => e.metadata?.quality);
    const avgLength = withQuality.length > 0
      ? Math.round(withQuality.reduce((s, e) => s + (e.metadata.quality.output_length || 0), 0) / withQuality.length)
      : 0;
    const structuredPct = withQuality.length > 0
      ? Math.round(withQuality.filter(e => e.metadata.quality.has_structure).length / withQuality.length * 100)
      : 0;

    signals.push({
      name: 'first_pass_clean_rate',
      value: { rate: Math.round(cleanRate * 100) + '%', accepted: liveAccepted.length, failed: liveAbandoned.length },
      confidence: Math.min(1.0, liveTotal / 30),
      scope: 'global' as SignalScope,
      sourceEventCount: liveTotal,
      lastUpdated: new Date().toISOString(),
      active: liveTotal >= 10,
      provenance: 'live_observed' as SignalProvenance,
      explanation: `Live verification: ${liveAccepted.length}/${liveTotal} tasks clean on first pass (${(cleanRate * 100).toFixed(0)}%). Avg output: ${avgLength} chars, ${structuredPct}% structured.`,
    });
  }

  // Post-process: ensure all signals have provenance
  for (const sig of signals) {
    if (!sig.provenance) {
      sig.provenance = 'seeded_historical';
    }
  }

  return signals;
}

/**
 * Persist derived signals to disk.
 */
function persistSignals(signals: BehaviorSignal[]): void {
  ensureDir();
  fs.writeFileSync(SIGNALS_FILE, JSON.stringify(signals, null, 2));
}

/**
 * Read persisted signals.
 */
function readSignals(): BehaviorSignal[] {
  ensureDir();
  if (!fs.existsSync(SIGNALS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SIGNALS_FILE, 'utf-8')); } catch { return []; }
}

// ─── Execution Guidance ────────────────────────────────

export interface ExecutionGuidance {
  autoApproveRecommended: boolean;
  preferredProvider?: string;
  depthHint?: 'brief' | 'standard' | 'deep';
  confidenceNote: string;
}

/**
 * Get execution guidance for a given task context.
 * Only returns guidance from active, high-confidence signals.
 */
function getGuidance(engine?: string): ExecutionGuidance {
  const signals = readSignals();
  const activeSignals = signals.filter(s => s.active && s.confidence >= MIN_CONFIDENCE_FOR_ACTIVE);

  const guidance: ExecutionGuidance = {
    autoApproveRecommended: false,
    confidenceNote: `Based on ${activeSignals.length} active signals`,
  };

  // Auto-approve recommendation
  const strictness = activeSignals.find(s => s.name === 'approval_strictness' && s.scope === 'global');
  if (strictness && strictness.value === 'permissive') {
    guidance.autoApproveRecommended = true;
  }

  // Engine-specific provider preference
  if (engine) {
    const provPref = activeSignals.find(s => s.name === 'preferred_provider' && s.scopeKey === engine);
    if (provPref) guidance.preferredProvider = provPref.value;

    const engineRate = activeSignals.find(s => s.name === 'engine_approval_rate' && s.scopeKey === engine);
    if (engineRate && (engineRate.value as number) > 0.9) {
      guidance.autoApproveRecommended = true;
    }
  }

  // Output satisfaction → depth hint
  const satisfaction = activeSignals.find(s => s.name === 'output_satisfaction');
  if (satisfaction) {
    if (satisfaction.value === 'low') guidance.depthHint = 'deep';
    else if (satisfaction.value === 'high') guidance.depthHint = 'standard';
  }

  return guidance;
}

// ─── Scoped Memory Retrieval ───────────────────────────

/**
 * Get context-relevant signals for a specific engine/project/workflow.
 * Applies scope priority: global < engine < project < workflow
 * Returns only active, high-confidence signals.
 */
function getScopedContext(opts: { engine?: string; project?: string; workflow?: string } = {}): {
  global: BehaviorSignal[];
  engine: BehaviorSignal[];
  project: BehaviorSignal[];
  summary: string;
} {
  const signals = readSignals();
  const active = signals.filter(s => s.active && s.confidence >= MIN_CONFIDENCE_FOR_ACTIVE);

  const globalSignals = active.filter(s => s.scope === 'global');
  // Match engine signals by canonical ID (also check legacy ID for backward compat)
  const canonicalEngine = opts.engine ? _toCanonical(opts.engine) : undefined;
  const engineSignals = canonicalEngine
    ? active.filter(s => s.scope === 'engine' && (s.scopeKey === canonicalEngine || s.scopeKey === opts.engine))
    : [];
  // project/workflow scopes will be populated as those layers are built

  // Build a human-readable summary for prompt injection
  const parts: string[] = [];

  // Communication style
  const commStyle = globalSignals.find(s => s.name === 'communication_style');
  if (commStyle) parts.push(`Operator communication style: ${commStyle.value}`);

  // Output preferences
  const outPref = globalSignals.find(s => s.name === 'output_preferences');
  if (outPref && typeof outPref.value === 'object') {
    if (outPref.value.style) parts.push(`Output style: ${outPref.value.style}`);
    if (outPref.value.avoid) parts.push(`Avoid: ${outPref.value.avoid}`);
  }

  // Risk tolerance
  const riskTol = globalSignals.find(s => s.name === 'risk_tolerance');
  if (riskTol) parts.push(`Risk tolerance: ${riskTol.value}`);

  // Engine-specific satisfaction
  if (opts.engine) {
    const engSat = engineSignals.find(s => s.name === 'output_satisfaction');
    if (engSat) parts.push(`Engine ${opts.engine} satisfaction: ${engSat.value}`);
    const engVol = engineSignals.find(s => s.name === 'task_volume');
    if (engVol && typeof engVol.value === 'object') parts.push(`Engine ${opts.engine} usage: ${engVol.value.count} tasks (${engVol.value.share})`);
  }

  return {
    global: globalSignals,
    engine: engineSignals,
    project: [],
    summary: parts.length > 0 ? parts.join('. ') + '.' : 'No learned preferences available.',
  };
}

// ─── Learning Log ──────────────────────────────────────

/**
 * Append an entry to the behavior learning log.
 */
function logLearning(message: string): void {
  ensureDir();
  const entry = `## ${new Date().toISOString()}\n${message}\n\n`;
  fs.appendFileSync(LEARNING_LOG_FILE, entry);
}

// ─── Summary / Stats ───────────────────────────────────

function getStats(): { totalEvents: number; eventsByType: Record<string, number>; signalCount: number; activeSignalCount: number } {
  const events = readEvents();
  const signals = readSignals();
  const eventsByType: Record<string, number> = {};
  events.forEach(e => { eventsByType[e.type] = (eventsByType[e.type] || 0) + 1; });
  return {
    totalEvents: events.length,
    eventsByType,
    signalCount: signals.length,
    activeSignalCount: signals.filter(s => s.active).length,
  };
}

// ─── Exports ───────────────────────────────────────────
module.exports = {
  recordEvent,
  readEvents,
  readEventsByType,
  readEventsByEngine,
  deriveSignals,
  persistSignals,
  readSignals,
  getGuidance,
  getScopedContext,
  logLearning,
  getStats,
};
