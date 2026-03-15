"use strict";
// GPO Evidence Lifecycle — TTL cleanup and indexing for structured evidence files
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEvidenceLifecycle = initEvidenceLifecycle;
exports.runEvidenceCleanup = runEvidenceCleanup;
exports.indexEvidence = indexEvidence;
const fs = require('fs');
const path = require('path');
const EVIDENCE_BASE = path.resolve(__dirname, '..', '..', 'state', 'evidence');
const OPS_DIR = path.resolve(__dirname, '..', '..', 'state', 'operations');
let _config = null;
function initEvidenceLifecycle(evidenceConfig) {
    if (evidenceConfig)
        _config = evidenceConfig;
}
function getConfig() {
    if (_config)
        return _config;
    try {
        const { loadConfig } = require('./structured-io-metrics');
        const cfg = loadConfig();
        _config = cfg.evidence;
        return _config;
    }
    catch { /* */ }
    return { ttlDays: 30, cleanupIntervalMinutes: 60, maxBytes: 500000000 };
}
/**
 * Run evidence cleanup: delete files older than TTL, enforce max bytes.
 */
function runEvidenceCleanup(now) {
    const cfg = getConfig();
    const currentTime = now || Date.now();
    const ttlMs = cfg.ttlDays * 86400000;
    const cutoff = currentTime - ttlMs;
    let deletedCount = 0;
    let freedBytes = 0;
    if (!fs.existsSync(EVIDENCE_BASE))
        return { deletedCount: 0, freedBytes: 0 };
    const allFiles = collectFiles(EVIDENCE_BASE);
    // Sort oldest first for TTL cleanup
    allFiles.sort((a, b) => a.mtime - b.mtime);
    // Phase 1: TTL cleanup
    for (const f of allFiles) {
        if (f.mtime < cutoff) {
            try {
                fs.unlinkSync(f.path);
                deletedCount++;
                freedBytes += f.size;
            }
            catch { /* skip */ }
        }
    }
    // Phase 2: Max bytes enforcement (LRU oldest first)
    const remaining = allFiles.filter(f => f.mtime >= cutoff);
    let totalBytes = remaining.reduce((s, f) => s + f.size, 0);
    for (const f of remaining) {
        if (totalBytes <= cfg.maxBytes)
            break;
        try {
            fs.unlinkSync(f.path);
            deletedCount++;
            freedBytes += f.size;
            totalBytes -= f.size;
        }
        catch { /* skip */ }
    }
    // Clean up empty directories
    cleanEmptyDirs(EVIDENCE_BASE);
    // Log operation
    logOperation({ action: 'cleanup', deletedCount, freedBytes, timestamp: new Date().toISOString() });
    return { deletedCount, freedBytes };
}
/**
 * Index evidence files: count, size, age distribution.
 */
function indexEvidence() {
    if (!fs.existsSync(EVIDENCE_BASE))
        return { totalFiles: 0, totalBytes: 0, byAge: {} };
    const allFiles = collectFiles(EVIDENCE_BASE);
    const now = Date.now();
    const byAge = { '0-7d': 0, '7-30d': 0, '30-90d': 0, '90d+': 0 };
    for (const f of allFiles) {
        const ageMs = now - f.mtime;
        if (ageMs < 7 * 86400000)
            byAge['0-7d']++;
        else if (ageMs < 30 * 86400000)
            byAge['7-30d']++;
        else if (ageMs < 90 * 86400000)
            byAge['30-90d']++;
        else
            byAge['90d+']++;
    }
    return {
        totalFiles: allFiles.length,
        totalBytes: allFiles.reduce((s, f) => s + f.size, 0),
        byAge,
    };
}
function collectFiles(dir) {
    const result = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                result.push(...collectFiles(full));
            }
            else if (entry.isFile() && entry.name.endsWith('.json')) {
                try {
                    const stat = fs.statSync(full);
                    result.push({ path: full, mtime: stat.mtimeMs, size: stat.size });
                }
                catch { /* skip */ }
            }
        }
    }
    catch { /* skip */ }
    return result;
}
function cleanEmptyDirs(dir) {
    try {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const full = path.join(dir, entry);
            if (fs.statSync(full).isDirectory()) {
                cleanEmptyDirs(full);
                try {
                    fs.rmdirSync(full);
                }
                catch { /* not empty */ }
            }
        }
    }
    catch { /* */ }
}
function logOperation(entry) {
    try {
        if (!fs.existsSync(OPS_DIR))
            fs.mkdirSync(OPS_DIR, { recursive: true });
        const logFile = path.join(OPS_DIR, 'evidence-cleanup.log');
        fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    }
    catch { /* non-fatal */ }
}
module.exports = { initEvidenceLifecycle, runEvidenceCleanup, indexEvidence };
//# sourceMappingURL=evidence-lifecycle.js.map