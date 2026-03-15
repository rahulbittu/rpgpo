"use strict";
// GPO Orchestrator Telemetry — Metrics for workflow orchestration
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementTransition = incrementTransition;
exports.recordStageDuration = recordStageDuration;
exports.incrementAutoAdvance = incrementAutoAdvance;
exports.incrementAutoRelease = incrementAutoRelease;
exports.incrementError = incrementError;
exports.getMetrics = getMetrics;
exports.reset = reset;
const _counters = {};
const _stageDurations = {};
function incrementTransition(from, to) {
    const key = `transition:${from || 'none'}:${to}`;
    _counters[key] = (_counters[key] || 0) + 1;
    _counters['total_transitions'] = (_counters['total_transitions'] || 0) + 1;
}
function recordStageDuration(stage, durationMs) {
    if (!_stageDurations[stage])
        _stageDurations[stage] = [];
    _stageDurations[stage].push(durationMs);
    if (_stageDurations[stage].length > 1000)
        _stageDurations[stage] = _stageDurations[stage].slice(-500);
}
function incrementAutoAdvance() {
    _counters['auto_advances'] = (_counters['auto_advances'] || 0) + 1;
}
function incrementAutoRelease() {
    _counters['auto_releases'] = (_counters['auto_releases'] || 0) + 1;
}
function incrementError() {
    _counters['errors'] = (_counters['errors'] || 0) + 1;
}
function getMetrics() {
    const durations = {};
    for (const [stage, vals] of Object.entries(_stageDurations)) {
        if (vals.length === 0)
            continue;
        const sorted = [...vals].sort((a, b) => a - b);
        durations[stage] = {
            avg: sorted.reduce((s, v) => s + v, 0) / sorted.length,
            p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
            p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
            count: sorted.length,
        };
    }
    return { counters: { ..._counters }, stageDurations: durations };
}
function reset() {
    for (const key of Object.keys(_counters))
        delete _counters[key];
    for (const key of Object.keys(_stageDurations))
        delete _stageDurations[key];
}
module.exports = { incrementTransition, recordStageDuration, incrementAutoAdvance, incrementAutoRelease, incrementError, getMetrics, reset };
//# sourceMappingURL=orchestrator-telemetry.js.map