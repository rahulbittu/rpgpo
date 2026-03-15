"use strict";
// GPO Provider Health Monitor — Real-time provider status and reliability tracking
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordProviderCall = recordProviderCall;
exports.getProviderHealth = getProviderHealth;
exports.getProviderStatus = getProviderStatus;
const fs = require('fs');
const path = require('path');
const HEALTH_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-health.json');
let _healthData = {};
function loadHealth() {
    try {
        if (fs.existsSync(HEALTH_FILE))
            _healthData = JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf-8'));
    }
    catch {
        _healthData = {};
    }
}
function saveHealth() {
    const dir = path.dirname(HEALTH_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HEALTH_FILE, JSON.stringify(_healthData, null, 2));
}
const PROVIDER_NAMES = {
    openai: 'OpenAI GPT-4o', perplexity: 'Perplexity Sonar', gemini: 'Google Gemini', claude: 'Claude (Local)',
};
function recordProviderCall(providerId, success, latencyMs, errorMsg) {
    loadHealth();
    if (!_healthData[providerId]) {
        _healthData[providerId] = {
            providerId, displayName: PROVIDER_NAMES[providerId] || providerId,
            status: 'unknown', lastCheck: 0, lastSuccess: 0, uptime24h: 1,
            successRate1h: 1, avgLatencyMs: 0, totalCalls: 0, recentErrors: [],
        };
    }
    const h = _healthData[providerId];
    h.lastCheck = Date.now();
    h.totalCalls++;
    const alpha = 0.1;
    h.avgLatencyMs = alpha * latencyMs + (1 - alpha) * h.avgLatencyMs;
    h.successRate1h = alpha * (success ? 1 : 0) + (1 - alpha) * h.successRate1h;
    h.uptime24h = 0.01 * (success ? 1 : 0) + 0.99 * h.uptime24h;
    if (success) {
        h.lastSuccess = Date.now();
        h.status = h.successRate1h > 0.9 ? 'healthy' : 'degraded';
    }
    else {
        h.lastError = errorMsg?.slice(0, 200);
        h.recentErrors.push(`${new Date().toISOString()}: ${errorMsg?.slice(0, 100)}`);
        if (h.recentErrors.length > 10)
            h.recentErrors = h.recentErrors.slice(-10);
        h.status = h.successRate1h < 0.5 ? 'down' : 'degraded';
    }
    saveHealth();
}
function getProviderHealth() {
    loadHealth();
    const providers = ['openai', 'perplexity', 'gemini', 'claude'];
    return providers.map(p => _healthData[p] || {
        providerId: p, displayName: PROVIDER_NAMES[p] || p,
        status: 'unknown', lastCheck: 0, lastSuccess: 0,
        uptime24h: 0, successRate1h: 0, avgLatencyMs: 0, totalCalls: 0, recentErrors: [],
    });
}
function getProviderStatus(providerId) {
    loadHealth();
    return _healthData[providerId] || null;
}
module.exports = { recordProviderCall, getProviderHealth, getProviderStatus };
//# sourceMappingURL=provider-health.js.map