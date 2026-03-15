// GPO Startup Optimizer — Fast server startup with lazy module loading

const _loadTimes: Record<string, number> = {};

export function lazyRequire<T>(modulePath: string): T {
  const start = Date.now();
  const mod = require(modulePath);
  _loadTimes[modulePath] = Date.now() - start;
  return mod as T;
}

export function getLoadTimes(): Record<string, number> {
  return { ..._loadTimes };
}

export function getSlowModules(thresholdMs: number = 50): Array<{ module: string; loadTimeMs: number }> {
  return Object.entries(_loadTimes)
    .filter(([, ms]) => ms > thresholdMs)
    .map(([module, loadTimeMs]) => ({ module, loadTimeMs }))
    .sort((a, b) => b.loadTimeMs - a.loadTimeMs);
}

export function getStartupReport(): { totalModules: number; totalLoadMs: number; slowModules: number; avgLoadMs: number } {
  const times = Object.values(_loadTimes);
  return {
    totalModules: times.length,
    totalLoadMs: times.reduce((s, t) => s + t, 0),
    slowModules: times.filter(t => t > 50).length,
    avgLoadMs: times.length > 0 ? Math.round(times.reduce((s, t) => s + t, 0) / times.length) : 0,
  };
}

module.exports = { lazyRequire, getLoadTimes, getSlowModules, getStartupReport };
