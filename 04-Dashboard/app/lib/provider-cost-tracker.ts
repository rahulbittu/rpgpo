// GPO Provider Cost Tracker — Per-provider cost breakdown with trends
export function getProviderCostBreakdown(days: number = 7): Record<string, { totalUsd: number; calls: number; avgPerCall: number; trend: string }> {
  const result: Record<string, { totalUsd: number; calls: number; avgPerCall: number; trend: string }> = {};
  try {
    const fs = require('fs'); const path = require('path');
    const costs = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'state', 'costs.json'), 'utf-8') || '[]');
    const cutoff = Date.now() - days * 86400000;
    const midpoint = Date.now() - (days / 2) * 86400000;
    for (const c of costs) {
      const ts = new Date(c.timestamp || c.created_at || '').getTime();
      if (ts < cutoff) continue;
      const p = c.provider || 'unknown';
      if (!result[p]) result[p] = { totalUsd: 0, calls: 0, avgPerCall: 0, trend: 'stable' };
      result[p].totalUsd += c.cost || c.totalCost || 0;
      result[p].calls++;
    }
    for (const [p, data] of Object.entries(result)) {
      data.avgPerCall = data.calls > 0 ? data.totalUsd / data.calls : 0;
      // Simple trend: compare first half vs second half
      const firstHalf = costs.filter((c: any) => { const ts = new Date(c.timestamp || c.created_at || '').getTime(); return ts > cutoff && ts < midpoint && (c.provider || 'unknown') === p; }).reduce((s: number, c: any) => s + (c.cost || 0), 0);
      const secondHalf = costs.filter((c: any) => { const ts = new Date(c.timestamp || c.created_at || '').getTime(); return ts >= midpoint && (c.provider || 'unknown') === p; }).reduce((s: number, c: any) => s + (c.cost || 0), 0);
      data.trend = secondHalf > firstHalf * 1.3 ? 'increasing' : secondHalf < firstHalf * 0.7 ? 'decreasing' : 'stable';
    }
  } catch { /* */ }
  return result;
}
module.exports = { getProviderCostBreakdown };
