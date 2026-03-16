"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// ─── Paths ─────────────────────────────────────────────
var ARTIFACTS_DIR = path.resolve(__dirname, '..', '..', '..', 'artifacts', 'behavior');
var EVENTS_FILE = path.join(ARTIFACTS_DIR, 'operator-events.jsonl');
var SIGNALS_FILE = path.join(ARTIFACTS_DIR, 'operator-signals.json');
var ENGINE_PREFS_FILE = path.join(ARTIFACTS_DIR, 'engine-preferences.json');
var LEARNING_LOG_FILE = path.join(ARTIFACTS_DIR, 'behavior-learning-log.md');
function ensureDir() {
    if (!fs.existsSync(ARTIFACTS_DIR))
        fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}
// ─── Minimum thresholds for signal activation ──────────
var MIN_EVENTS_FOR_SIGNAL = 5;
var MIN_CONFIDENCE_FOR_ACTIVE = 0.6;
// ─── Event Capture ─────────────────────────────────────
function generateEventId() {
    return 'evt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
/**
 * Record an operator behavior event.
 * Append-only to JSONL for durability and auditability.
 */
function recordEvent(type, metadata, context) {
    if (metadata === void 0) { metadata = {}; }
    if (context === void 0) { context = {}; }
    ensureDir();
    var event = {
        id: generateEventId(),
        type: type,
        timestamp: new Date().toISOString(),
        taskId: context.taskId,
        subtaskId: context.subtaskId,
        engine: context.engine,
        provider: context.provider,
        metadata: metadata,
    };
    fs.appendFileSync(EVENTS_FILE, JSON.stringify(event) + '\n');
    return event;
}
/**
 * Read all recorded events.
 */
function readEvents() {
    ensureDir();
    if (!fs.existsSync(EVENTS_FILE))
        return [];
    var lines = fs.readFileSync(EVENTS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
    return lines.map(function (line) {
        try {
            return JSON.parse(line);
        }
        catch (_a) {
            return null;
        }
    }).filter(Boolean);
}
/**
 * Read events filtered by type.
 */
function readEventsByType(type) {
    return readEvents().filter(function (e) { return e.type === type; });
}
/**
 * Read events for a specific engine.
 */
function readEventsByEngine(engine) {
    return readEvents().filter(function (e) { return e.engine === engine; });
}
// ─── Signal Derivation ────────────────────────────────
/**
 * Derive all behavioral signals from the event log.
 * Called periodically or after significant event batches.
 */
function deriveSignals() {
    var events = readEvents();
    if (events.length === 0)
        return [];
    var signals = [];
    // 1. Approval strictness (global)
    var approvals = events.filter(function (e) { return e.type === 'approval_granted'; });
    var denials = events.filter(function (e) { return e.type === 'approval_denied'; });
    var totalDecisions = approvals.length + denials.length;
    if (totalDecisions >= MIN_EVENTS_FOR_SIGNAL) {
        var approvalRate = approvals.length / totalDecisions;
        signals.push({
            name: 'approval_strictness',
            value: approvalRate < 0.5 ? 'strict' : approvalRate < 0.8 ? 'moderate' : 'permissive',
            confidence: Math.min(1.0, totalDecisions / 20),
            scope: 'global',
            sourceEventCount: totalDecisions,
            lastUpdated: new Date().toISOString(),
            active: totalDecisions >= MIN_EVENTS_FOR_SIGNAL * 2,
            explanation: "Based on ".concat(totalDecisions, " decisions: ").concat(approvals.length, " approved, ").concat(denials.length, " denied (").concat((approvalRate * 100).toFixed(0), "% approval rate)"),
        });
    }
    // 2. Engine-specific approval rates
    var engineDecisions = {};
    __spreadArray(__spreadArray([], approvals, true), denials, true).forEach(function (e) {
        if (!e.engine)
            return;
        if (!engineDecisions[e.engine])
            engineDecisions[e.engine] = { approved: 0, denied: 0 };
        if (e.type === 'approval_granted')
            engineDecisions[e.engine].approved++;
        else
            engineDecisions[e.engine].denied++;
    });
    for (var _i = 0, _a = Object.entries(engineDecisions); _i < _a.length; _i++) {
        var _b = _a[_i], engine = _b[0], counts = _b[1];
        var total = counts.approved + counts.denied;
        if (total >= 3) {
            var rate = counts.approved / total;
            signals.push({
                name: 'engine_approval_rate',
                value: rate,
                confidence: Math.min(1.0, total / 10),
                scope: 'engine',
                scopeKey: engine,
                sourceEventCount: total,
                lastUpdated: new Date().toISOString(),
                active: total >= MIN_EVENTS_FOR_SIGNAL,
                explanation: "Engine ".concat(engine, ": ").concat(counts.approved, "/").concat(total, " approved (").concat((rate * 100).toFixed(0), "%)"),
            });
        }
    }
    // 3. Preferred providers by engine
    var routingEvents = events.filter(function (e) { return e.type === 'task_routed' && e.engine && e.provider; });
    var providerByEngine = {};
    routingEvents.forEach(function (e) {
        if (!providerByEngine[e.engine])
            providerByEngine[e.engine] = {};
        providerByEngine[e.engine][e.provider] = (providerByEngine[e.engine][e.provider] || 0) + 1;
    });
    for (var _c = 0, _d = Object.entries(providerByEngine); _c < _d.length; _c++) {
        var _e = _d[_c], engine = _e[0], providers = _e[1];
        var total = Object.values(providers).reduce(function (a, b) { return a + b; }, 0);
        if (total >= MIN_EVENTS_FOR_SIGNAL) {
            var sorted = Object.entries(providers).sort(function (a, b) { return b[1] - a[1]; });
            signals.push({
                name: 'preferred_provider',
                value: sorted[0][0],
                confidence: Math.min(1.0, sorted[0][1] / total),
                scope: 'engine',
                scopeKey: engine,
                sourceEventCount: total,
                lastUpdated: new Date().toISOString(),
                active: sorted[0][1] / total >= MIN_CONFIDENCE_FOR_ACTIVE,
                explanation: "Engine ".concat(engine, " provider usage: ").concat(sorted.map(function (_a) {
                    var p = _a[0], c = _a[1];
                    return "".concat(p, "=").concat(c);
                }).join(', ')),
            });
        }
    }
    // 4. Engine override frequency (manual routing preference)
    var overrides = events.filter(function (e) { return e.type === 'engine_overridden'; });
    if (overrides.length >= 3) {
        var taskTotal = events.filter(function (e) { return e.type === 'task_created'; }).length;
        var overrideRate = taskTotal > 0 ? overrides.length / taskTotal : 0;
        signals.push({
            name: 'routing_override_tendency',
            value: overrideRate > 0.3 ? 'frequent' : overrideRate > 0.1 ? 'occasional' : 'rare',
            confidence: Math.min(1.0, overrides.length / 10),
            scope: 'global',
            sourceEventCount: overrides.length,
            lastUpdated: new Date().toISOString(),
            active: overrides.length >= MIN_EVENTS_FOR_SIGNAL,
            explanation: "".concat(overrides.length, " engine overrides out of ").concat(taskTotal, " tasks (").concat((overrideRate * 100).toFixed(1), "%)"),
        });
    }
    // 5. Output acceptance vs abandonment
    var accepted = events.filter(function (e) { return e.type === 'output_accepted'; });
    var abandoned = events.filter(function (e) { return e.type === 'output_abandoned'; });
    var downloaded = events.filter(function (e) { return e.type === 'deliverable_downloaded'; });
    var totalOutputDecisions = accepted.length + abandoned.length;
    if (totalOutputDecisions >= MIN_EVENTS_FOR_SIGNAL) {
        var acceptRate = accepted.length / totalOutputDecisions;
        signals.push({
            name: 'output_satisfaction',
            value: acceptRate > 0.8 ? 'high' : acceptRate > 0.5 ? 'moderate' : 'low',
            confidence: Math.min(1.0, totalOutputDecisions / 20),
            scope: 'global',
            sourceEventCount: totalOutputDecisions,
            lastUpdated: new Date().toISOString(),
            active: totalOutputDecisions >= MIN_EVENTS_FOR_SIGNAL * 2,
            explanation: "".concat(accepted.length, " accepted, ").concat(abandoned.length, " abandoned, ").concat(downloaded.length, " downloaded"),
        });
    }
    // 6. Rewrite frequency (quality signal)
    var rewrites = events.filter(function (e) { return e.type === 'rewrite_requested'; });
    if (rewrites.length >= 3) {
        var taskTotal = events.filter(function (e) { return e.type === 'task_created'; }).length;
        var rewriteRate = taskTotal > 0 ? rewrites.length / taskTotal : 0;
        signals.push({
            name: 'rewrite_frequency',
            value: rewriteRate,
            confidence: Math.min(1.0, rewrites.length / 10),
            scope: 'global',
            sourceEventCount: rewrites.length,
            lastUpdated: new Date().toISOString(),
            active: rewrites.length >= MIN_EVENTS_FOR_SIGNAL,
            explanation: "".concat(rewrites.length, " rewrites out of ").concat(taskTotal, " tasks (").concat((rewriteRate * 100).toFixed(1), "%)"),
        });
    }
    // 7. Follow-up intensity
    var followups = events.filter(function (e) { return e.type === 'followup_requested'; });
    if (followups.length >= 3) {
        signals.push({
            name: 'followup_intensity',
            value: followups.length > 20 ? 'high' : followups.length > 5 ? 'moderate' : 'low',
            confidence: Math.min(1.0, followups.length / 15),
            scope: 'global',
            sourceEventCount: followups.length,
            lastUpdated: new Date().toISOString(),
            active: followups.length >= MIN_EVENTS_FOR_SIGNAL,
            explanation: "".concat(followups.length, " follow-up requests recorded"),
        });
    }
    // 8. Output satisfaction PER ENGINE
    var acceptedByEngine = {};
    var abandonedByEngine = {};
    accepted.forEach(function (e) { if (e.engine)
        acceptedByEngine[e.engine] = (acceptedByEngine[e.engine] || 0) + 1; });
    abandoned.forEach(function (e) { if (e.engine)
        abandonedByEngine[e.engine] = (abandonedByEngine[e.engine] || 0) + 1; });
    var allEnginesArr = Object.keys(acceptedByEngine).concat(Object.keys(abandonedByEngine)).filter(function (v, i, a) { return a.indexOf(v) === i; });
    for (var _f = 0, allEnginesArr_1 = allEnginesArr; _f < allEnginesArr_1.length; _f++) {
        var engine = allEnginesArr_1[_f];
        var acc = acceptedByEngine[engine] || 0;
        var abn = abandonedByEngine[engine] || 0;
        var total = acc + abn;
        if (total >= 3) {
            var rate = acc / total;
            signals.push({
                name: 'output_satisfaction',
                value: rate > 0.9 ? 'high' : rate > 0.7 ? 'moderate' : 'low',
                confidence: Math.min(1.0, total / 15),
                scope: 'engine',
                scopeKey: engine,
                sourceEventCount: total,
                lastUpdated: new Date().toISOString(),
                active: total >= MIN_EVENTS_FOR_SIGNAL,
                explanation: "Engine ".concat(engine, ": ").concat(acc, " accepted, ").concat(abn, " abandoned (").concat((rate * 100).toFixed(0), "% satisfaction)"),
            });
        }
    }
    // 9. Task volume by engine (indicates operator priority)
    var tasksByEngine = {};
    events.filter(function (e) { return e.type === 'task_created' && e.engine; }).forEach(function (e) {
        tasksByEngine[e.engine] = (tasksByEngine[e.engine] || 0) + 1;
    });
    var totalTasks = events.filter(function (e) { return e.type === 'task_created'; }).length;
    for (var _g = 0, _h = Object.entries(tasksByEngine); _g < _h.length; _g++) {
        var _j = _h[_g], engine = _j[0], count = _j[1];
        if (count >= 3) {
            var share = count / totalTasks;
            signals.push({
                name: 'task_volume',
                value: { count: count, share: Math.round(share * 100) + '%' },
                confidence: Math.min(1.0, count / 20),
                scope: 'engine',
                scopeKey: engine,
                sourceEventCount: count,
                lastUpdated: new Date().toISOString(),
                active: count >= MIN_EVENTS_FOR_SIGNAL,
                explanation: "Engine ".concat(engine, ": ").concat(count, " tasks (").concat((share * 100).toFixed(1), "% of total)"),
            });
        }
    }
    // 10. Operator profile signals (from static profile if available)
    try {
        var profilePath = path.resolve(__dirname, '..', '..', 'state', 'context', 'operator-profile.json');
        if (fs.existsSync(profilePath)) {
            var profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
            if (profile.communication_style) {
                signals.push({
                    name: 'communication_style',
                    value: profile.communication_style,
                    confidence: 1.0,
                    scope: 'global',
                    sourceEventCount: 1,
                    lastUpdated: new Date().toISOString(),
                    active: true,
                    explanation: "From operator profile: communication_style = ".concat(profile.communication_style),
                });
            }
            if (profile.output_preferences) {
                signals.push({
                    name: 'output_preferences',
                    value: profile.output_preferences,
                    confidence: 1.0,
                    scope: 'global',
                    sourceEventCount: 1,
                    lastUpdated: new Date().toISOString(),
                    active: true,
                    explanation: "From operator profile: stated output preferences",
                });
            }
            if (profile.risk_tolerance) {
                signals.push({
                    name: 'risk_tolerance',
                    value: profile.risk_tolerance,
                    confidence: 1.0,
                    scope: 'global',
                    sourceEventCount: 1,
                    lastUpdated: new Date().toISOString(),
                    active: true,
                    explanation: "From operator profile: risk_tolerance = ".concat(profile.risk_tolerance),
                });
            }
        }
    }
    catch ( /* profile not available */_k) { /* profile not available */ }
    return signals;
}
/**
 * Persist derived signals to disk.
 */
function persistSignals(signals) {
    ensureDir();
    fs.writeFileSync(SIGNALS_FILE, JSON.stringify(signals, null, 2));
}
/**
 * Read persisted signals.
 */
function readSignals() {
    ensureDir();
    if (!fs.existsSync(SIGNALS_FILE))
        return [];
    try {
        return JSON.parse(fs.readFileSync(SIGNALS_FILE, 'utf-8'));
    }
    catch (_a) {
        return [];
    }
}
/**
 * Get execution guidance for a given task context.
 * Only returns guidance from active, high-confidence signals.
 */
function getGuidance(engine) {
    var signals = readSignals();
    var activeSignals = signals.filter(function (s) { return s.active && s.confidence >= MIN_CONFIDENCE_FOR_ACTIVE; });
    var guidance = {
        autoApproveRecommended: false,
        confidenceNote: "Based on ".concat(activeSignals.length, " active signals"),
    };
    // Auto-approve recommendation
    var strictness = activeSignals.find(function (s) { return s.name === 'approval_strictness' && s.scope === 'global'; });
    if (strictness && strictness.value === 'permissive') {
        guidance.autoApproveRecommended = true;
    }
    // Engine-specific provider preference
    if (engine) {
        var provPref = activeSignals.find(function (s) { return s.name === 'preferred_provider' && s.scopeKey === engine; });
        if (provPref)
            guidance.preferredProvider = provPref.value;
        var engineRate = activeSignals.find(function (s) { return s.name === 'engine_approval_rate' && s.scopeKey === engine; });
        if (engineRate && engineRate.value > 0.9) {
            guidance.autoApproveRecommended = true;
        }
    }
    // Output satisfaction → depth hint
    var satisfaction = activeSignals.find(function (s) { return s.name === 'output_satisfaction'; });
    if (satisfaction) {
        if (satisfaction.value === 'low')
            guidance.depthHint = 'deep';
        else if (satisfaction.value === 'high')
            guidance.depthHint = 'standard';
    }
    return guidance;
}
// ─── Scoped Memory Retrieval ───────────────────────────
/**
 * Get context-relevant signals for a specific engine/project/workflow.
 * Applies scope priority: global < engine < project < workflow
 * Returns only active, high-confidence signals.
 */
function getScopedContext(opts) {
    if (opts === void 0) { opts = {}; }
    var signals = readSignals();
    var active = signals.filter(function (s) { return s.active && s.confidence >= MIN_CONFIDENCE_FOR_ACTIVE; });
    var globalSignals = active.filter(function (s) { return s.scope === 'global'; });
    var engineSignals = opts.engine
        ? active.filter(function (s) { return s.scope === 'engine' && s.scopeKey === opts.engine; })
        : [];
    // project/workflow scopes will be populated as those layers are built
    // Build a human-readable summary for prompt injection
    var parts = [];
    // Communication style
    var commStyle = globalSignals.find(function (s) { return s.name === 'communication_style'; });
    if (commStyle)
        parts.push("Operator communication style: ".concat(commStyle.value));
    // Output preferences
    var outPref = globalSignals.find(function (s) { return s.name === 'output_preferences'; });
    if (outPref && typeof outPref.value === 'object') {
        if (outPref.value.style)
            parts.push("Output style: ".concat(outPref.value.style));
        if (outPref.value.avoid)
            parts.push("Avoid: ".concat(outPref.value.avoid));
    }
    // Risk tolerance
    var riskTol = globalSignals.find(function (s) { return s.name === 'risk_tolerance'; });
    if (riskTol)
        parts.push("Risk tolerance: ".concat(riskTol.value));
    // Engine-specific satisfaction
    if (opts.engine) {
        var engSat = engineSignals.find(function (s) { return s.name === 'output_satisfaction'; });
        if (engSat)
            parts.push("Engine ".concat(opts.engine, " satisfaction: ").concat(engSat.value));
        var engVol = engineSignals.find(function (s) { return s.name === 'task_volume'; });
        if (engVol && typeof engVol.value === 'object')
            parts.push("Engine ".concat(opts.engine, " usage: ").concat(engVol.value.count, " tasks (").concat(engVol.value.share, ")"));
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
function logLearning(message) {
    ensureDir();
    var entry = "## ".concat(new Date().toISOString(), "\n").concat(message, "\n\n");
    fs.appendFileSync(LEARNING_LOG_FILE, entry);
}
// ─── Summary / Stats ───────────────────────────────────
function getStats() {
    var events = readEvents();
    var signals = readSignals();
    var eventsByType = {};
    events.forEach(function (e) { eventsByType[e.type] = (eventsByType[e.type] || 0) + 1; });
    return {
        totalEvents: events.length,
        eventsByType: eventsByType,
        signalCount: signals.length,
        activeSignalCount: signals.filter(function (s) { return s.active; }).length,
    };
}
// ─── Exports ───────────────────────────────────────────
module.exports = {
    recordEvent: recordEvent,
    readEvents: readEvents,
    readEventsByType: readEventsByType,
    readEventsByEngine: readEventsByEngine,
    deriveSignals: deriveSignals,
    persistSignals: persistSignals,
    readSignals: readSignals,
    getGuidance: getGuidance,
    getScopedContext: getScopedContext,
    logLearning: logLearning,
    getStats: getStats,
};
