"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreferences = getPreferences;
exports.setPreference = setPreference;
// GPO Operator Preferences — Persist UI and behavior preferences
const fs = require('fs');
const path = require('path');
const PREFS_FILE = path.resolve(__dirname, '..', '..', 'state', 'operator-preferences.json');
function getPreferences() {
    try {
        if (fs.existsSync(PREFS_FILE))
            return JSON.parse(fs.readFileSync(PREFS_FILE, 'utf-8'));
    }
    catch { /* */ }
    return { theme: 'dark', pollingIntervalMs: 5000, defaultDomain: '', showTutorial: true, sidebarCollapsed: false, favoriteTemplates: [] };
}
function setPreference(key, value) {
    const prefs = getPreferences();
    prefs[key] = value;
    const dir = path.dirname(PREFS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2));
}
module.exports = { getPreferences, setPreference };
