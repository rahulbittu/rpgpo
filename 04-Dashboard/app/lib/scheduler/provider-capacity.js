"use strict";
// GPO Provider Capacity — Semaphore tracking with dynamic backpressure
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeCapacityWindows = computeCapacityWindows;
exports.tryAcquire = tryAcquire;
exports.release = release;
exports.applyBackpressureSignals = applyBackpressureSignals;
exports.currentWindows = currentWindows;
exports.reset = reset;
const _inUse = new Map();
const _globalInUse = { count: 0 };
const _tenantInUse = new Map();
const _projectInUse = new Map();
let _signals = [];
function computeCapacityWindows(config) {
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
function tryAcquire(item, config) {
    // Global limit
    if (_globalInUse.count >= config.globalMaxConcurrent)
        return false;
    // Provider limit
    const windows = computeCapacityWindows(config);
    const pw = windows.find(w => w.provider === item.provider);
    if (pw && pw.available <= 0)
        return false;
    // Tenant limit
    const tenantLimit = config.perTenantMaxConcurrent[item.tenantId];
    if (tenantLimit !== undefined) {
        const tenantUse = _tenantInUse.get(item.tenantId) || 0;
        if (tenantUse >= tenantLimit)
            return false;
    }
    // Project limit
    const projectLimit = config.perProjectMaxConcurrent[item.projectId];
    if (projectLimit !== undefined) {
        const projectUse = _projectInUse.get(item.projectId) || 0;
        if (projectUse >= projectLimit)
            return false;
    }
    // Acquire
    _globalInUse.count++;
    _inUse.set(item.provider, (_inUse.get(item.provider) || 0) + 1);
    _tenantInUse.set(item.tenantId, (_tenantInUse.get(item.tenantId) || 0) + 1);
    _projectInUse.set(item.projectId, (_projectInUse.get(item.projectId) || 0) + 1);
    return true;
}
function release(item) {
    _globalInUse.count = Math.max(0, _globalInUse.count - 1);
    _inUse.set(item.provider, Math.max(0, (_inUse.get(item.provider) || 0) - 1));
    _tenantInUse.set(item.tenantId, Math.max(0, (_tenantInUse.get(item.tenantId) || 0) - 1));
    _projectInUse.set(item.projectId, Math.max(0, (_projectInUse.get(item.projectId) || 0) - 1));
}
function applyBackpressureSignals(signals) {
    _signals.push(...signals);
}
function currentWindows(config) {
    return computeCapacityWindows(config);
}
function reset() {
    _inUse.clear();
    _globalInUse.count = 0;
    _tenantInUse.clear();
    _projectInUse.clear();
    _signals = [];
}
module.exports = { computeCapacityWindows, tryAcquire, release, applyBackpressureSignals, currentWindows, reset };
//# sourceMappingURL=provider-capacity.js.map