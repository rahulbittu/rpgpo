"use strict";
// GPO Startup Optimizer — Fast server startup with lazy module loading
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyRequire = lazyRequire;
exports.getLoadTimes = getLoadTimes;
exports.getSlowModules = getSlowModules;
exports.getStartupReport = getStartupReport;
const _loadTimes = {};
function lazyRequire(modulePath) {
    const start = Date.now();
    const mod = require(modulePath);
    _loadTimes[modulePath] = Date.now() - start;
    return mod;
}
function getLoadTimes() {
    return { ..._loadTimes };
}
function getSlowModules(thresholdMs = 50) {
    return Object.entries(_loadTimes)
        .filter(([, ms]) => ms > thresholdMs)
        .map(([module, loadTimeMs]) => ({ module, loadTimeMs }))
        .sort((a, b) => b.loadTimeMs - a.loadTimeMs);
}
function getStartupReport() {
    const times = Object.values(_loadTimes);
    return {
        totalModules: times.length,
        totalLoadMs: times.reduce((s, t) => s + t, 0),
        slowModules: times.filter(t => t > 50).length,
        avgLoadMs: times.length > 0 ? Math.round(times.reduce((s, t) => s + t, 0) / times.length) : 0,
    };
}
module.exports = { lazyRequire, getLoadTimes, getSlowModules, getStartupReport };
