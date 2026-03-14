"use strict";
// GPO Alert Routing — Route real alerts to operator-visible destinations
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeAlert = routeAlert;
exports.recordBreach = recordBreach;
exports.runAlertCheck = runAlertCheck;
exports.getRoutingHistory = getRoutingHistory;
exports.getBreaches = getBreaches;
const fs = require('fs');
const path = require('path');
const ROUTING_FILE = path.resolve(__dirname, '..', '..', 'state', 'alert-routing.json');
const BREACHES_FILE = path.resolve(__dirname, '..', '..', 'state', 'slo-breaches.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Route an alert to the appropriate operator destination */
function routeAlert(category, severity, detail) {
    // Determine target
    let target = 'admin_workspace';
    if (category === 'stuck_approval' || category === 'stuck_escalation')
        target = 'escalation_inbox';
    else if (category === 'slo_breach' || category === 'execution_failure')
        target = 'admin_workspace';
    else if (category === 'security_finding')
        target = 'escalation_inbox';
    else if (severity === 'critical')
        target = 'operator_home';
    // Dedupe check
    const existing = readJson(ROUTING_FILE, []);
    const recent = existing.find(a => a.category === category && a.detail === detail && (Date.now() - new Date(a.created_at).getTime()) < 3600000);
    const deduped = !!recent;
    const decision = {
        alert_id: uid('ar'), category, severity, target, detail,
        delivered: !deduped, deduped, created_at: new Date().toISOString(),
    };
    existing.unshift(decision);
    if (existing.length > 200)
        existing.length = 200;
    writeJson(ROUTING_FILE, existing);
    // If not deduped, actually create the target item
    if (!deduped) {
        try {
            if (target === 'escalation_inbox') {
                const ei = require('./escalation-inbox');
                ei.createItem({ source_type: 'alert', source_id: decision.alert_id, title: `Alert: ${category}`, detail, severity });
            }
        }
        catch { /* */ }
    }
    return decision;
}
/** Record an SLO breach */
function recordBreach(sloId, sloName, target, actual, unit) {
    const severity = Math.abs(actual - target) > target * 0.3 ? 'critical' : 'warning';
    const breach = {
        breach_id: uid('sb'), slo_id: sloId, slo_name: sloName,
        target, actual, unit, severity,
        routed_to: 'admin_workspace', created_at: new Date().toISOString(),
    };
    const breaches = readJson(BREACHES_FILE, []);
    breaches.unshift(breach);
    if (breaches.length > 100)
        breaches.length = 100;
    writeJson(BREACHES_FILE, breaches);
    // Route alert
    routeAlert('slo_breach', severity, `${sloName}: ${actual} vs target ${target} ${unit}`);
    return breach;
}
/** Run alert routing check — scan for conditions that need alerts */
function runAlertCheck() {
    const decisions = [];
    // Check SLO breaches
    try {
        const slo = require('./slo-sla');
        for (const s of slo.getStatuses().filter(s => !s.met)) {
            const breach = recordBreach(s.slo_id, s.name, s.target, s.current, s.unit);
            decisions.push(routeAlert('slo_breach', breach.severity, `${s.name} breached`));
        }
    }
    catch { /* */ }
    // Check stuck approvals
    try {
        const aw = require('./approval-workspace');
        const s = aw.getSummary();
        if (s.overdue > 0)
            decisions.push(routeAlert('stuck_approval', 'warning', `${s.overdue} overdue approval(s)`));
    }
    catch { /* */ }
    // Check reliability incidents
    try {
        const rg = require('./reliability-governance');
        const active = rg.getIncidents().filter(i => !i.resolved);
        if (active.length >= 3)
            decisions.push(routeAlert('execution_failure', 'critical', `${active.length} active reliability incidents`));
    }
    catch { /* */ }
    return decisions;
}
function getRoutingHistory() { return readJson(ROUTING_FILE, []); }
function getBreaches() { return readJson(BREACHES_FILE, []); }
module.exports = { routeAlert, recordBreach, runAlertCheck, getRoutingHistory, getBreaches };
//# sourceMappingURL=alert-routing.js.map