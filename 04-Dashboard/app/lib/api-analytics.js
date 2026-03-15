"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordApiCall = recordApiCall;
exports.getApiAnalytics = getApiAnalytics;
// GPO API Analytics — Track API call patterns for optimization
const _calls = [];
function recordApiCall(route, method, durationMs) { _calls.push({ route, method, timestamp: Date.now(), durationMs }); if (_calls.length > 5000)
    _calls.splice(0, 2000); }
function getApiAnalytics() {
    const cutoff = Date.now() - 3600000;
    const recent = _calls.filter(c => c.timestamp > cutoff);
    const byRoute = {};
    for (const c of recent) {
        if (!byRoute[c.route])
            byRoute[c.route] = { count: 0, totalMs: 0 };
        byRoute[c.route].count++;
        byRoute[c.route].totalMs += c.durationMs;
    }
    const topRoutes = Object.entries(byRoute).map(([route, data]) => ({ route, count: data.count, avgMs: Math.round(data.totalMs / data.count) })).sort((a, b) => b.count - a.count).slice(0, 20);
    return { totalCalls: recent.length, uniqueRoutes: Object.keys(byRoute).length, topRoutes, callsPerMinute: recent.length / 60 };
}
module.exports = { recordApiCall, getApiAnalytics };
//# sourceMappingURL=api-analytics.js.map