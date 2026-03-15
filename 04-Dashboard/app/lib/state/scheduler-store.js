"use strict";
// GPO Scheduler Store — Config and state persistence
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.getPaused = getPaused;
exports.setPaused = setPaused;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', '..', 'state', 'scheduler');
const CONFIG_FILE = path.join(STATE_DIR, 'config.json');
const PAUSED_FILE = path.join(STATE_DIR, 'paused.json');
function ensureDir() {
    if (!fs.existsSync(STATE_DIR))
        fs.mkdirSync(STATE_DIR, { recursive: true });
}
function readJson(f, fb) {
    try {
        return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
    }
    catch {
        return fb;
    }
}
function writeJson(f, d) {
    ensureDir();
    fs.writeFileSync(f, JSON.stringify(d, null, 2));
}
const DEFAULT_CONFIG = {
    version: 1,
    featureFlags: { enabled: false, enableFairSharing: true, enableDeadLetter: true, enableDynamicBackpressure: true },
    globalMaxConcurrent: 1,
    defaultTimeoutMs: 180000,
    perProviderMaxConcurrent: { openai: 4, anthropic: 3, google: 3, perplexity: 2 },
    perTenantMaxConcurrent: {},
    perProjectMaxConcurrent: {},
    queueCapacity: 200,
    inFlightLeaseMs: 120000,
    maxAttempts: 4,
    initialRetryDelayMs: 2000,
    maxRetryDelayMs: 45000,
    fairnessWeights: { tenant: {}, project: {} },
};
function loadConfig() {
    const raw = readJson(CONFIG_FILE, {});
    return { ...DEFAULT_CONFIG, ...raw, featureFlags: { ...DEFAULT_CONFIG.featureFlags, ...(raw.featureFlags || {}) }, fairnessWeights: { ...DEFAULT_CONFIG.fairnessWeights, ...(raw.fairnessWeights || {}) } };
}
function saveConfig(cfg) {
    writeJson(CONFIG_FILE, cfg);
}
function getPaused() {
    return readJson(PAUSED_FILE, { paused: false }).paused;
}
function setPaused(paused) {
    writeJson(PAUSED_FILE, { paused, updatedAt: new Date().toISOString() });
}
module.exports = { loadConfig, saveConfig, getPaused, setPaused };
//# sourceMappingURL=scheduler-store.js.map