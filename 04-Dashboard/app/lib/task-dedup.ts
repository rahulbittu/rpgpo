// GPO Task Dedup — Detect and prevent duplicate task submissions

const crypto = require('crypto') as typeof import('crypto');

export interface DedupResult {
  isDuplicate: boolean;
  matchedTaskId?: string;
  similarity?: number;
  suggestion?: string;
}

export function checkDuplicate(rawRequest: string, domain: string): DedupResult {
  try {
    const intake = require('./intake') as { getAllTasks(): any[] };
    const tasks = intake.getAllTasks().filter((t: any) => t.domain === domain);
    const normalized = normalizeText(rawRequest);

    for (const t of tasks.slice(-20)) {
      const taskNorm = normalizeText(t.raw_request || t.title || '');
      const sim = computeSimilarity(normalized, taskNorm);

      if (sim > 0.85) {
        return {
          isDuplicate: true,
          matchedTaskId: t.task_id,
          similarity: sim,
          suggestion: `Very similar to existing task "${(t.title || '').slice(0, 50)}" (${t.status}). Consider viewing existing results instead.`,
        };
      }

      if (sim > 0.6) {
        return {
          isDuplicate: false,
          matchedTaskId: t.task_id,
          similarity: sim,
          suggestion: `Similar to "${(t.title || '').slice(0, 50)}" (${(sim * 100).toFixed(0)}% match). Proceeding with new task.`,
        };
      }
    }

    return { isDuplicate: false };
  } catch { return { isDuplicate: false }; }
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const aWords = new Set(a.split(' '));
  const bWords = new Set(b.split(' '));
  const intersection = new Set([...aWords].filter(w => bWords.has(w)));
  const union = new Set([...aWords, ...bWords]);

  return intersection.size / union.size; // Jaccard similarity
}

module.exports = { checkDuplicate };
