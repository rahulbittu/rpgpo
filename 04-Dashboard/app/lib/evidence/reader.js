"use strict";
// GPO Evidence Reader — Read structured extraction evidence files
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestEvidence = getLatestEvidence;
exports.getTaskEvidence = getTaskEvidence;
const fs = require('fs');
const path = require('path');
const EVIDENCE_BASE = path.resolve(__dirname, '..', '..', '..', 'state', 'evidence');
function sanitize(s) {
    return s.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}
/** Get latest structured evidence for a deliverable */
function getLatestEvidence(deliverableId) {
    const dir = path.join(EVIDENCE_BASE, sanitize(deliverableId));
    if (!fs.existsSync(dir))
        return null;
    // Scan all task subdirectories
    let latest = null;
    let latestTime = 0;
    try {
        const taskDirs = fs.readdirSync(dir).filter((d) => {
            const full = path.join(dir, d);
            return fs.statSync(full).isDirectory();
        });
        for (const taskDir of taskDirs) {
            const taskPath = path.join(dir, taskDir);
            const files = fs.readdirSync(taskPath).filter((f) => f.startsWith('structured-') && f.endsWith('.json'));
            for (const file of files) {
                try {
                    const content = JSON.parse(fs.readFileSync(path.join(taskPath, file), 'utf-8'));
                    const ts = new Date(content.recorded_at).getTime();
                    if (ts > latestTime) {
                        latestTime = ts;
                        latest = content;
                    }
                }
                catch { /* skip corrupt */ }
            }
        }
    }
    catch { /* */ }
    return latest;
}
/** Get evidence for a specific deliverable + task */
function getTaskEvidence(deliverableId, taskId) {
    const dir = path.join(EVIDENCE_BASE, sanitize(deliverableId), sanitize(taskId));
    if (!fs.existsSync(dir))
        return [];
    const entries = [];
    try {
        const files = fs.readdirSync(dir).filter((f) => f.startsWith('structured-') && f.endsWith('.json'));
        for (const file of files) {
            try {
                entries.push(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')));
            }
            catch { /* skip corrupt */ }
        }
    }
    catch { /* */ }
    return entries.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
}
module.exports = { getLatestEvidence, getTaskEvidence };
//# sourceMappingURL=reader.js.map