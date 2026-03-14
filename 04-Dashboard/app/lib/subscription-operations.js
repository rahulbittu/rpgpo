"use strict";
// GPO Subscription Operations — Entitlements, usage metering, billing events
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscription = getSubscription;
exports.evaluateEntitlements = evaluateEntitlements;
exports.recordUsage = recordUsage;
exports.getUsageMeters = getUsageMeters;
exports.recordBillingEvent = recordBillingEvent;
exports.getBillingEvents = getBillingEvents;
const fs = require('fs');
const path = require('path');
const SUBS_FILE = path.resolve(__dirname, '..', '..', 'state', 'subscriptions.json');
const METERS_FILE = path.resolve(__dirname, '..', '..', 'state', 'usage-meters.json');
const BILLING_FILE = path.resolve(__dirname, '..', '..', 'state', 'billing-events.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
const PLAN_ENTITLEMENTS = {
    personal: ['governance', 'memory_viewer', 'approval_workspace'],
    pro: ['governance', 'audit', 'memory_viewer', 'approval_workspace', 'collaboration', 'release', 'provider_governance', 'pattern_exchange'],
    team: ['governance', 'audit', 'compliance', 'memory_viewer', 'approval_workspace', 'collaboration', 'release', 'provider_governance', 'pattern_exchange', 'tenant_admin'],
    enterprise: ['governance', 'audit', 'compliance', 'memory_viewer', 'approval_workspace', 'collaboration', 'release', 'provider_governance', 'pattern_exchange', 'tenant_admin'],
};
function getSubscription(tenantId) {
    return readJson(SUBS_FILE, []).find(s => s.tenant_id === tenantId) || null;
}
function evaluateEntitlements(tenantId, features) {
    let plan = 'pro';
    try {
        const ta = require('./tenant-admin');
        const t = ta.getTenant(tenantId);
        if (t)
            plan = t.plan;
    }
    catch { /* */ }
    const entitled = PLAN_ENTITLEMENTS[plan] || [];
    return features.map(f => ({ feature: f, entitled: entitled.includes(f) }));
}
function recordUsage(tenantId, meterType, amount) {
    const meters = readJson(METERS_FILE, []);
    const m = { meter_id: uid('um'), tenant_id: tenantId, meter_type: meterType, amount, period: new Date().toISOString().slice(0, 7), created_at: new Date().toISOString() };
    meters.unshift(m);
    if (meters.length > 500)
        meters.length = 500;
    writeJson(METERS_FILE, meters);
    return m;
}
function getUsageMeters(tenantId) {
    return readJson(METERS_FILE, []).filter(m => m.tenant_id === tenantId);
}
function recordBillingEvent(tenantId, eventType, amount, detail) {
    const events = readJson(BILLING_FILE, []);
    const e = { event_id: uid('be'), tenant_id: tenantId, event_type: eventType, amount, detail, created_at: new Date().toISOString() };
    events.unshift(e);
    if (events.length > 500)
        events.length = 500;
    writeJson(BILLING_FILE, events);
    return e;
}
function getBillingEvents(tenantId) {
    return readJson(BILLING_FILE, []).filter(e => e.tenant_id === tenantId);
}
module.exports = { getSubscription, evaluateEntitlements, recordUsage, getUsageMeters, recordBillingEvent, getBillingEvents };
//# sourceMappingURL=subscription-operations.js.map