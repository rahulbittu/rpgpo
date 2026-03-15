// GPO Operator Preferences — Persist UI and behavior preferences
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const PREFS_FILE = path.resolve(__dirname, '..', '..', 'state', 'operator-preferences.json');
export function getPreferences(): Record<string, unknown> {
  try { if (fs.existsSync(PREFS_FILE)) return JSON.parse(fs.readFileSync(PREFS_FILE, 'utf-8')); } catch { /* */ }
  return { theme: 'dark', pollingIntervalMs: 5000, defaultDomain: '', showTutorial: true, sidebarCollapsed: false, favoriteTemplates: [] };
}
export function setPreference(key: string, value: unknown): void {
  const prefs = getPreferences(); prefs[key] = value;
  const dir = path.dirname(PREFS_FILE); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2));
}
module.exports = { getPreferences, setPreference };
