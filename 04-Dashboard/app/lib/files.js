// RPGPO shared file operations
const fs = require('fs');
const path = require('path');

const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..');

function readFile(relPath) {
  try { return fs.readFileSync(path.join(RPGPO_ROOT, relPath), 'utf-8'); } catch { return null; }
}

function readJson(relPath) {
  const raw = readFile(relPath);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function writeFile(relPath, content) {
  const full = path.join(RPGPO_ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return relPath;
}

function listFiles(relDir) {
  const full = path.join(RPGPO_ROOT, relDir);
  try { return fs.readdirSync(full).filter(f => !f.startsWith('.')).sort().reverse(); } catch { return []; }
}

function readAllInDir(relDir) {
  return listFiles(relDir).map(f => ({
    name: f,
    content: readFile(path.join(relDir, f))
  })).filter(f => f.content);
}

function extractField(md, field) {
  const re = new RegExp('^## ' + field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n([\\s\\S]*?)(?=\\n## |$)', 'm');
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

function parseMission(md) {
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

function logAction(action, result, fileAffected) {
  const logDir = path.join(RPGPO_ROOT, '03-Operations/Logs/Decisions');
  fs.mkdirSync(logDir, { recursive: true });
  const ts = new Date().toISOString();
  const dateStr = ts.slice(0, 10);
  const logFile = path.join(logDir, `${dateStr}-DashboardActions.md`);
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
