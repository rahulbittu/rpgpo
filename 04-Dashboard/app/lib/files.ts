import type { Mission } from './types';

const fs = require('fs');
const path = require('path');

const RPGPO_ROOT: string = path.resolve(__dirname, '..', '..', '..');

function readFile(relPath: string): string | null {
  try { return fs.readFileSync(path.join(RPGPO_ROOT, relPath), 'utf-8'); } catch { return null; }
}

function readJson(relPath: string): unknown | null {
  const raw = readFile(relPath);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function writeFile(relPath: string, content: string): string {
  const full: string = path.join(RPGPO_ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return relPath;
}

function listFiles(relDir: string): string[] {
  const full: string = path.join(RPGPO_ROOT, relDir);
  try { return fs.readdirSync(full).filter((f: string) => !f.startsWith('.')).sort().reverse(); } catch { return []; }
}

function readAllInDir(relDir: string): Array<{ name: string; content: string }> {
  return listFiles(relDir).map((f: string) => ({
    name: f,
    content: readFile(path.join(relDir, f))
  })).filter((f: { name: string; content: string | null }) => f.content) as Array<{ name: string; content: string }>;
}

function extractField(md: string, field: string): string {
  const re = new RegExp('^## ' + field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n([\\s\\S]*?)(?=\\n## |$)', 'm');
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

function parseMission(md: string | null): Mission | null {
  if (!md) return null;
  return {
    mission: extractField(md, 'Mission'),
    objective: extractField(md, 'Current Objective'),
    status: extractField(md, 'Current Status'),
    metrics: extractField(md, 'Key Metrics'),
    progress: extractField(md, 'Recent Progress'),
    blockers: extractField(md, 'Blockers'),
    risks: extractField(md, 'Risks'),
    nextActions: extractField(md, 'Next Recommended Actions'),
    owner: extractField(md, 'Owner / Domain'),
  };
}

function logAction(action: string, result: string, fileAffected?: string): void {
  const logDir: string = path.join(RPGPO_ROOT, '03-Operations/Logs/Decisions');
  fs.mkdirSync(logDir, { recursive: true });
  const ts: string = new Date().toISOString();
  const dateStr: string = ts.slice(0, 10);
  const logFile: string = path.join(logDir, `${dateStr}-DashboardActions.md`);
  const entry = `\n## ${ts}\n- **Action:** ${action}\n- **Result:** ${result}\n- **File:** ${fileAffected || 'n/a'}\n`;
  if (fs.existsSync(logFile)) {
    fs.appendFileSync(logFile, entry);
  } else {
    fs.writeFileSync(logFile, `# RPGPO Dashboard Action Log\n## Date: ${dateStr}\n${entry}`);
  }
}

module.exports = {
  RPGPO_ROOT, readFile, readJson, writeFile, listFiles, readAllInDir,
  extractField, parseMission, logAction,
};
