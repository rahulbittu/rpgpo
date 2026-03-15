"use strict";
// GPO Cache — In-memory caching layer with TTL for read-heavy endpoints
Object.defineProperty(exports, "__esModule", { value: true });
exports.cached = cached;
exports.cachedAsync = cachedAsync;
exports.invalidate = invalidate;
exports.invalidatePrefix = invalidatePrefix;
exports.clearAll = clearAll;
exports.stats = stats;
const _cache = new Map();
const DEFAULT_TTL_MS = 5000; // 5 seconds
/**
 * Get a cached value, or compute it if expired/missing.
 */
function cached(key, compute, ttlMs) {
    const entry = _cache.get(key);
    const now = Date.now();
    if (entry && entry.expiresAt > now) {
        return entry.value;
    }
    const value = compute();
    _cache.set(key, { value, expiresAt: now + (ttlMs || DEFAULT_TTL_MS), setAt: now });
    return value;
}
/**
 * Async version of cached.
 */
async function cachedAsync(key, compute, ttlMs) {
    const entry = _cache.get(key);
    const now = Date.now();
    if (entry && entry.expiresAt > now) {
        return entry.value;
    }
    const value = await compute();
    _cache.set(key, { value, expiresAt: now + (ttlMs || DEFAULT_TTL_MS), setAt: now });
    return value;
}
/**
 * Invalidate a specific cache key.
 */
function invalidate(key) {
    _cache.delete(key);
}
/**
 * Invalidate all keys matching a prefix.
 */
function invalidatePrefix(prefix) {
    for (const key of _cache.keys()) {
        if (key.startsWith(prefix))
            _cache.delete(key);
    }
}
/**
 * Clear entire cache.
 */
function clearAll() {
    _cache.clear();
}
/**
 * Get cache stats.
 */
function stats() {
    let totalSize = 0;
    const now = Date.now();
    let expired = 0;
    for (const [key, entry] of _cache) {
        if (entry.expiresAt < now)
            expired++;
        totalSize += JSON.stringify(entry.value).length;
    }
    // Clean expired entries
    if (expired > _cache.size / 2) {
        for (const [key, entry] of _cache) {
            if (entry.expiresAt < now)
                _cache.delete(key);
        }
    }
    return {
        entries: _cache.size,
        hitRate: 0, // would need tracking for accurate hit rate
        memoryEstimate: totalSize,
    };
}
module.exports = { cached, cachedAsync, invalidate, invalidatePrefix, clearAll, stats };
