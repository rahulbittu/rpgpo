// GPO Task Archive — Archive old completed tasks to reduce active state size

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ARCHIVE_FILE = path.resolve(__dirname, '..', '..', 'state', 'task-archive.json');

export function archiveOldTasks(olderThanDays: number = 30): { archived: number; remaining: number } {
  try {
    const intake = require('./intake') as { getAllTasks(): any[]; removeTask?(id: string): void };
    const tasks = intake.getAllTasks();
    const cutoff = Date.now() - olderThanDays * 86400000;
    const toArchive = tasks.filter((t: any) => ['done', 'failed', 'canceled'].includes(t.status) && new Date(t.updated_at || t.created_at || '').getTime() < cutoff);
    if (toArchive.length === 0) return { archived: 0, remaining: tasks.length };
    const existing = readArchive();
    existing.push(...toArchive.map((t: any) => ({ ...t, archivedAt: new Date().toISOString() })));
    writeArchive(existing);
    return { archived: toArchive.length, remaining: tasks.length - toArchive.length };
  } catch { return { archived: 0, remaining: 0 }; }
}

export function getArchiveStats(): { total: number; oldest?: string; newest?: string } {
  const archive = readArchive();
  if (archive.length === 0) return { total: 0 };
  return { total: archive.length, oldest: archive[0]?.created_at, newest: archive[archive.length - 1]?.created_at };
}

export function searchArchive(query: string): any[] {
  const archive = readArchive();
  const lower = query.toLowerCase();
  return archive.filter((t: any) => {
    const text = [t.title, t.raw_request, t.domain].filter(Boolean).join(' ').toLowerCase();
    return text.includes(lower);
  }).slice(0, 20);
}

function readArchive(): any[] {
  try { if (fs.existsSync(ARCHIVE_FILE)) return JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf-8')); } catch { /* */ }
  return [];
}
function writeArchive(data: any[]): void {
  const dir = path.dirname(ARCHIVE_FILE); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(data, null, 2));
}

module.exports = { archiveOldTasks, getArchiveStats, searchArchive };
