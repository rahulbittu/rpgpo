"use strict";
// GPO Contract-Aware AI I/O Config — Loader and validator
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContractAwareConfig = loadContractAwareConfig;
exports.clearConfigCache = clearConfigCache;
const fs = require('fs');
const path = require('path');
const CONFIG_FILE = path.resolve(__dirname, '..', '..', '..', 'state', 'config', 'ai-io.json');
const DEFAULTS = {
    enabled: true,
    acceptNonStrict: true,
    maxParseAttempts: 3,
    maxResponseBytes: 400000,
    providerModes: {
        openai: 'native-json',
        anthropic: 'native-json',
        perplexity: 'prompt-sentinel',
        gemini: 'mime-json',
    },
    sentinel: { start: '<gpo_json>', end: '</gpo_json>' },
    boardStructuredEnabled: true,
    workerStructuredEnabled: true,
    providerRouting: 'capability-preferred',
    backoffMs: 250,
    backoffMultiplier: 1.7,
    backoffJitter: 0.2,
    exposeStatusToOperator: true,
    allowManualRetry: false,
};
let _cached = null;
function loadContractAwareConfig() {
    if (_cached)
        return _cached;
    let raw = {};
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        }
    }
    catch { /* use defaults */ }
    const cfg = {
        enabled: raw.enabled ?? DEFAULTS.enabled,
        acceptNonStrict: raw.acceptNonStrict ?? DEFAULTS.acceptNonStrict,
        maxParseAttempts: raw.maxParseAttempts ?? DEFAULTS.maxParseAttempts,
        maxResponseBytes: raw.maxResponseBytes ?? DEFAULTS.maxResponseBytes,
        providerModes: { ...DEFAULTS.providerModes, ...(raw.providerModes || {}) },
        sentinel: { ...DEFAULTS.sentinel, ...(raw.sentinel || {}) },
        boardStructuredEnabled: raw.boardStructuredEnabled ?? DEFAULTS.boardStructuredEnabled,
        workerStructuredEnabled: raw.workerStructuredEnabled ?? DEFAULTS.workerStructuredEnabled,
        providerRouting: raw.providerRouting ?? DEFAULTS.providerRouting,
        backoffMs: raw.backoffMs ?? DEFAULTS.backoffMs,
        backoffMultiplier: raw.backoffMultiplier ?? DEFAULTS.backoffMultiplier,
        backoffJitter: raw.backoffJitter ?? DEFAULTS.backoffJitter,
        exposeStatusToOperator: raw.exposeStatusToOperator ?? DEFAULTS.exposeStatusToOperator,
        allowManualRetry: raw.allowManualRetry ?? DEFAULTS.allowManualRetry,
    };
    _cached = Object.freeze(cfg);
    return _cached;
}
function clearConfigCache() {
    _cached = null;
}
module.exports = { loadContractAwareConfig, clearConfigCache };
//# sourceMappingURL=ai-io.js.map