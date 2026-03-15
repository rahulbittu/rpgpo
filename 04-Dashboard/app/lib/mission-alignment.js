"use strict";
// GPO Mission Alignment — Check if tasks align with operator mission and priorities
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAlignment = checkAlignment;
const fs = require('fs');
const path = require('path');
function checkAlignment(rawRequest, domain) {
    const lower = rawRequest.toLowerCase();
    const matchedPriorities = [];
    const matchedMissions = [];
    // Load operator profile
    try {
        const profileFile = path.resolve(__dirname, '..', '..', 'state', 'context', 'operator-profile.json');
        if (fs.existsSync(profileFile)) {
            const profile = JSON.parse(fs.readFileSync(profileFile, 'utf-8'));
            for (const priority of (profile.recurring_priorities || [])) {
                const keywords = priority.toLowerCase().split(/[,;:]+/).map((s) => s.trim()).filter((s) => s.length > 3);
                for (const kw of keywords) {
                    if (lower.includes(kw.slice(0, 15))) {
                        matchedPriorities.push(priority);
                        break;
                    }
                }
            }
        }
    }
    catch { /* */ }
    // Load mission statements
    try {
        const msFile = path.resolve(__dirname, '..', '..', 'state', 'mission-statements.json');
        if (fs.existsSync(msFile)) {
            const statements = JSON.parse(fs.readFileSync(msFile, 'utf-8'));
            for (const ms of statements) {
                const msText = (ms.statement || '').toLowerCase();
                const objectives = (ms.objectives || []).map((o) => o.toLowerCase());
                const allText = [msText, ...objectives].join(' ');
                const words = lower.split(/\s+/).filter((w) => w.length > 4);
                const matches = words.filter((w) => allText.includes(w)).length;
                if (matches >= 2)
                    matchedMissions.push(ms.scope_id || ms.id || 'unknown');
            }
        }
    }
    catch { /* */ }
    const score = Math.min(1, (matchedPriorities.length * 0.4 + matchedMissions.length * 0.3) + (domain !== 'general' ? 0.2 : 0));
    let suggestion;
    if (score < 0.3 && matchedPriorities.length === 0) {
        suggestion = 'This task doesn\'t align with any stated priorities. Consider if it\'s the best use of your time.';
    }
    return { aligned: score > 0.3, score, matchedPriorities, matchedMissions, suggestion };
}
module.exports = { checkAlignment };
//# sourceMappingURL=mission-alignment.js.map