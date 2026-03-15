// GPO Token Counter — Estimate and track token usage across tasks
export function estimateTokens(text: string): number { return Math.ceil(text.length / 4); }
export function getTokenStats(): { totalInputTokens: number; totalOutputTokens: number; avgPerTask: number } {
  try {
    const fs = require('fs'); const path = require('path');
    const costs = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'state', 'costs.json'), 'utf-8') || '[]');
    const input = costs.reduce((s: number, c: any) => s + (c.inputTokens || 0), 0);
    const output = costs.reduce((s: number, c: any) => s + (c.outputTokens || 0), 0);
    const tasks = new Set(costs.map((c: any) => c.taskId)).size;
    return { totalInputTokens: input, totalOutputTokens: output, avgPerTask: tasks > 0 ? (input + output) / tasks : 0 };
  } catch { return { totalInputTokens: 0, totalOutputTokens: 0, avgPerTask: 0 }; }
}
module.exports = { estimateTokens, getTokenStats };
