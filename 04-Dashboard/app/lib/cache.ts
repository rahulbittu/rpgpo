// GPO Cache — In-memory caching layer with TTL for read-heavy endpoints

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  setAt: number;
}

const _cache: Map<string, CacheEntry> = new Map();
const DEFAULT_TTL_MS = 5000; // 5 seconds

/**
 * Get a cached value, or compute it if expired/missing.
 */
export function cached<T>(key: string, compute: () => T, ttlMs?: number): T {
  const entry = _cache.get(key);
  const now = Date.now();

  if (entry && entry.expiresAt > now) {
    return entry.value as T;
  }

  const value = compute();
  _cache.set(key, { value, expiresAt: now + (ttlMs || DEFAULT_TTL_MS), setAt: now });
  return value;
}

/**
 * Async version of cached.
 */
export async function cachedAsync<T>(key: string, compute: () => Promise<T>, ttlMs?: number): Promise<T> {
  const entry = _cache.get(key);
  const now = Date.now();

  if (entry && entry.expiresAt > now) {
    return entry.value as T;
  }

  const value = await compute();
  _cache.set(key, { value, expiresAt: now + (ttlMs || DEFAULT_TTL_MS), setAt: now });
  return value;
}

/**
 * Invalidate a specific cache key.
 */
export function invalidate(key: string): void {
  _cache.delete(key);
}

/**
 * Invalidate all keys matching a prefix.
 */
export function invalidatePrefix(prefix: string): void {
  for (const key of _cache.keys()) {
    if (key.startsWith(prefix)) _cache.delete(key);
  }
}

/**
 * Clear entire cache.
 */
export function clearAll(): void {
  _cache.clear();
}

/**
 * Get cache stats.
 */
export function stats(): { entries: number; hitRate: number; memoryEstimate: number } {
  let totalSize = 0;
  const now = Date.now();
  let expired = 0;

  for (const [key, entry] of _cache) {
    if (entry.expiresAt < now) expired++;
    totalSize += JSON.stringify(entry.value).length;
  }

  // Clean expired entries
  if (expired > _cache.size / 2) {
    for (const [key, entry] of _cache) {
      if (entry.expiresAt < now) _cache.delete(key);
    }
  }

  return {
    entries: _cache.size,
    hitRate: 0, // would need tracking for accurate hit rate
    memoryEstimate: totalSize,
  };
}

module.exports = { cached, cachedAsync, invalidate, invalidatePrefix, clearAll, stats };
