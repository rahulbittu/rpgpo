// GPO Search Index — Full-text search across tasks, knowledge, reports

export interface SearchResult {
  type: 'task' | 'knowledge' | 'report' | 'template';
  id: string;
  title: string;
  snippet: string;
  score: number;
  meta?: Record<string, string>;
}

export function search(query: string, limit: number = 20): SearchResult[] {
  if (!query || query.length < 2) return [];
  const results: SearchResult[] = [];
  const lower = query.toLowerCase();
  const terms = lower.split(/\s+/).filter(t => t.length > 1);

  // Search tasks
  try {
    const intake = require('./intake') as { getAllTasks(): any[] };
    const tasks = intake.getAllTasks();
    for (const t of tasks) {
      const searchable = [t.title, t.raw_request, t.domain, t.board_deliberation?.interpreted_objective].filter(Boolean).join(' ').toLowerCase();
      const score = computeScore(searchable, terms);
      if (score > 0) {
        results.push({ type: 'task', id: t.task_id, title: (t.title || t.raw_request || '').slice(0, 80), snippet: (t.board_deliberation?.interpreted_objective || '').slice(0, 120), score, meta: { status: t.status, domain: t.domain } });
      }
    }
  } catch { /* */ }

  // Search knowledge
  try {
    const ls = require('./learning-store') as { getAllKnowledge(): any[] };
    for (const e of ls.getAllKnowledge()) {
      const searchable = [e.title, ...e.insights, ...e.domainTags].join(' ').toLowerCase();
      const score = computeScore(searchable, terms);
      if (score > 0) {
        results.push({ type: 'knowledge', id: e.id, title: e.title.slice(0, 80), snippet: (e.insights[0] || '').slice(0, 120), score, meta: { engine: e.engineId } });
      }
    }
  } catch { /* */ }

  // Search templates
  try {
    const ts = require('./template-store') as { listTemplates(): any[] };
    for (const t of ts.listTemplates()) {
      const searchable = [t.name, t.description, t.prompt, ...t.tags].join(' ').toLowerCase();
      const score = computeScore(searchable, terms);
      if (score > 0) {
        results.push({ type: 'template', id: t.id, title: t.name, snippet: t.description.slice(0, 120), score, meta: { domain: t.domain } });
      }
    }
  } catch { /* */ }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

function computeScore(text: string, terms: string[]): number {
  let score = 0;
  for (const term of terms) {
    const idx = text.indexOf(term);
    if (idx >= 0) {
      score += 1;
      // Bonus for match near start
      if (idx < 50) score += 0.5;
      // Bonus for exact word match
      const before = idx > 0 ? text[idx - 1] : ' ';
      const after = idx + term.length < text.length ? text[idx + term.length] : ' ';
      if (/\s/.test(before) && /[\s.,!?]/.test(after)) score += 0.3;
    }
  }
  return score;
}

module.exports = { search };
