"use strict";
// GPO Rate Limiter — Per-endpoint and per-IP rate limiting
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
exports.getRateLimitStats = getRateLimitStats;
const _counters = new Map();
const DEFAULTS = {
    'POST:/api/intake/submit': { windowMs: 60000, maxRequests: 10 },
    'POST:/api/intake/run': { windowMs: 60000, maxRequests: 5 },
    'POST:/api/topranker/tasks/run': { windowMs: 60000, maxRequests: 5 },
    'POST:/api/compound-workflows/runs': { windowMs: 60000, maxRequests: 3 },
    'default': { windowMs: 60000, maxRequests: 100 },
};
function checkRateLimit(key, config) {
    const cfg = config || DEFAULTS[key] || DEFAULTS.default;
    const now = Date.now();
    const entry = _counters.get(key);
    if (!entry || now - entry.windowStart > cfg.windowMs) {
        _counters.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: cfg.maxRequests - 1 };
    }
    if (entry.count >= cfg.maxRequests) {
        const retryAfterMs = cfg.windowMs - (now - entry.windowStart);
        return { allowed: false, remaining: 0, retryAfterMs };
    }
    entry.count++;
    return { allowed: true, remaining: cfg.maxRequests - entry.count };
}
function getRateLimitStats() {
    return { keys: _counters.size, configs: DEFAULTS };
}
module.exports = { checkRateLimit, getRateLimitStats };
//# sourceMappingURL=rate-limiter.js.map