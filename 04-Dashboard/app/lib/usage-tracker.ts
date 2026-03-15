// GPO Usage Tracker — Track feature usage for product analytics

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const USAGE_FILE = path.resolve(__dirname, '..', '..', 'state', 'usage-tracker.json');

export interface UsageEvent {
  feature: string;
  action: string;
  timestamp: number;
}

export interface UsageSummary {
  totalEvents: number;
  topFeatures: Array<{ feature: string; count: number }>;
  dailyActive: number;
  weeklyActive: number;
  recentActions: UsageEvent[];
}

let _events: UsageEvent[] = [];
let _loaded = false;

function load(): void {
  if (_loaded) return;
  try { if (fs.existsSync(USAGE_FILE)) _events = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8')); } catch { _events = []; }
  _loaded = true;
}

function save(): void {
  if (_events.length > 5000) _events = _events.slice(-3000);
  const dir = path.dirname(USAGE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(_events));
}

export function track(feature: string, action: string): void {
  load();
  _events.push({ feature, action, timestamp: Date.now() });
  save();
}

export function getSummary(days: number = 7): UsageSummary {
  load();
  const cutoff = Date.now() - days * 86400000;
  const recent = _events.filter(e => e.timestamp > cutoff);

  const featureCounts: Record<string, number> = {};
  for (const e of recent) {
    featureCounts[e.feature] = (featureCounts[e.feature] || 0) + 1;
  }

  const topFeatures = Object.entries(featureCounts)
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const dailyCutoff = Date.now() - 86400000;
  const weeklyCutoff = Date.now() - 7 * 86400000;

  return {
    totalEvents: recent.length,
    topFeatures,
    dailyActive: _events.filter(e => e.timestamp > dailyCutoff).length,
    weeklyActive: recent.length,
    recentActions: recent.slice(-10).reverse(),
  };
}

module.exports = { track, getSummary };
