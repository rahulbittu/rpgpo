"use strict";
// GPO Escalation Governance — Rule-based escalation on system events
// Triggers: low confidence, review conflict, handoff quality, privacy risk, etc.
// Actions: notify, require approval, board reopen, pause, downgrade.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRules = getAllRules;
exports.getRulesForDomain = getRulesForDomain;
exports.getRulesForProject = getRulesForProject;
exports.createRule = createRule;
exports.toggleRule = toggleRule;
exports.evaluateEscalation = evaluateEscalation;
exports.getEventsForGraph = getEventsForGraph;
exports.getAllEvents = getAllEvents;
const fs = require('fs');
const path = require('path');
const RULES_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-rules.json');
const EVENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-events.json');
function uid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(file, fallback) {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback;
    }
    catch {
        return fallback;
    }
}
function writeJson(file, data) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
// ═══════════════════════════════════════════
// Default Rules
// ═══════════════════════════════════════════
function defaultRules() {
    return [
        { rule_id: 'er_low_conf', trigger: 'low_confidence', action: 'notify_operator', threshold: 50, scope_level: 'global', scope_id: 'global', enabled: true, description: 'Escalate when confidence drops below 50%', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_review_conflict', trigger: 'review_conflict', action: 'require_second_provider_review', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Require second provider when reviews conflict', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_privacy', trigger: 'privacy_risk', action: 'pause_execution', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Pause execution on privacy risk detection', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_mission', trigger: 'mission_conflict', action: 'notify_operator', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Notify operator when work conflicts with mission', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_doc_gap', trigger: 'documentation_gap', action: 'notify_operator', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Notify when required documentation is missing', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_provider', trigger: 'provider_mismatch', action: 'downgrade_to_advisory', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Downgrade to advisory when provider fit is poor', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_retry', trigger: 'retry_exhaustion', action: 'require_operator_approval', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Require approval when retries exhausted', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_promo', trigger: 'promotion_attempt', action: 'require_operator_approval', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Require approval for promotion attempts', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { rule_id: 'er_handoff', trigger: 'handoff_quality', action: 'notify_operator', threshold: 40, scope_level: 'global', scope_id: 'global', enabled: true, description: 'Notify when handoff confidence is low', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
}
function ensureDefaults() {
    let rules = readJson(RULES_FILE, []);
    if (rules.length === 0) {
        rules = defaultRules();
        writeJson(RULES_FILE, rules);
    }
    return rules;
}
// ═══════════════════════════════════════════
// Rule CRUD
// ═══════════════════════════════════════════
function getAllRules() { return ensureDefaults(); }
function getRulesForDomain(domain) {
    return ensureDefaults().filter(r => (r.scope_level === 'engine' && r.scope_id === domain) || r.scope_level === 'global');
}
function getRulesForProject(projectId) {
    return ensureDefaults().filter(r => (r.scope_level === 'project' && r.scope_id === projectId) || r.scope_level === 'global');
}
function createRule(opts) {
    const rules = ensureDefaults();
    const rule = { ...opts, rule_id: uid('er'), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    rules.unshift(rule);
    writeJson(RULES_FILE, rules);
    return rule;
}
function toggleRule(ruleId) {
    const rules = ensureDefaults();
    const idx = rules.findIndex(r => r.rule_id === ruleId);
    if (idx === -1)
        return null;
    rules[idx].enabled = !rules[idx].enabled;
    rules[idx].updated_at = new Date().toISOString();
    writeJson(RULES_FILE, rules);
    return rules[idx];
}
// ═══════════════════════════════════════════
// Escalation Evaluation
// ═══════════════════════════════════════════
/** Evaluate all escalation rules against a graph's current state */
function evaluateEscalation(graphId, nodeId) {
    const rules = ensureDefaults().filter(r => r.enabled);
    const fired = [];
    // Gather graph state
    let graph = null;
    let nodes = [];
    try {
        const eg = require('./execution-graph');
        graph = eg.getGraph(graphId);
        nodes = eg.getNodesForGraph(graphId);
    }
    catch {
        return [];
    }
    if (!graph)
        return [];
    // Gather dossier
    let dossier = null;
    if (graph.dossier_id) {
        try {
            const pd = require('./promotion-dossiers');
            dossier = pd.getDossier(graph.dossier_id);
        }
        catch { /* */ }
    }
    // Gather handoffs
    let handoffs = [];
    try {
        const cc = require('./collaboration-contracts');
        handoffs = cc.getHandoffsForGraph(graphId);
    }
    catch { /* */ }
    // Gather reviews
    let reviews = [];
    try {
        const rc = require('./review-contracts');
        reviews = rc.getReviewsForGraph(graphId);
    }
    catch { /* */ }
    for (const rule of rules) {
        let shouldFire = false;
        let detail = '';
        switch (rule.trigger) {
            case 'low_confidence':
                if (dossier && dossier.confidence_score < (rule.threshold || 50)) {
                    shouldFire = true;
                    detail = `Dossier confidence ${dossier.confidence_score}% < threshold ${rule.threshold || 50}%`;
                }
                break;
            case 'review_conflict': {
                const verdicts = reviews.filter(r => r.verdict).map(r => r.verdict);
                if (verdicts.includes('pass') && verdicts.includes('fail')) {
                    shouldFire = true;
                    detail = 'Reviews have conflicting pass/fail verdicts';
                }
                break;
            }
            case 'handoff_quality': {
                const lowConf = handoffs.filter(h => h.confidence < (rule.threshold || 40));
                if (lowConf.length > 0) {
                    shouldFire = true;
                    detail = `${lowConf.length} handoff(s) below confidence threshold`;
                }
                break;
            }
            case 'retry_exhaustion': {
                const failedNodes = nodes.filter(n => n.status === 'failed');
                if (failedNodes.length >= 3) {
                    shouldFire = true;
                    detail = `${failedNodes.length} nodes failed — retry budget likely exhausted`;
                }
                break;
            }
            case 'provider_mismatch': {
                // Check if any node uses a deprecated provider fit
                try {
                    const pr = require('./provider-registry');
                    const fits = pr.getAllFits();
                    for (const node of nodes) {
                        const deprecated = fits.find(f => f.state === 'deprecated' && node.assigned_agent.includes(f.provider_id));
                        if (deprecated) {
                            shouldFire = true;
                            detail = `Node "${node.title}" uses deprecated provider fit`;
                            break;
                        }
                    }
                }
                catch { /* */ }
                break;
            }
            case 'documentation_gap': {
                try {
                    const dg = require('./documentation-governance');
                    const check = dg.checkRequirements('execution_graph', graphId, graph.lane);
                    if (!check.met) {
                        shouldFire = true;
                        detail = `Missing docs: ${check.missing.join(', ')}`;
                    }
                }
                catch { /* */ }
                break;
            }
            case 'promotion_attempt':
                if (dossier && dossier.recommendation === 'promote' && !dossier.promoted_at) {
                    shouldFire = true;
                    detail = 'Promotion dossier pending — requires operator approval';
                }
                break;
            default:
                break;
        }
        if (shouldFire) {
            const event = {
                event_id: uid('ee'),
                rule_id: rule.rule_id,
                trigger: rule.trigger,
                action: rule.action,
                graph_id: graphId,
                node_id: nodeId,
                detail,
                resolved: false,
                created_at: new Date().toISOString(),
            };
            fired.push(event);
        }
    }
    // Persist events
    if (fired.length > 0) {
        const events = readJson(EVENTS_FILE, []);
        events.unshift(...fired);
        if (events.length > 500)
            events.length = 500;
        writeJson(EVENTS_FILE, events);
    }
    return fired;
}
function getEventsForGraph(graphId) {
    return readJson(EVENTS_FILE, []).filter(e => e.graph_id === graphId);
}
function getAllEvents() {
    return readJson(EVENTS_FILE, []);
}
module.exports = {
    getAllRules, getRulesForDomain, getRulesForProject,
    createRule, toggleRule,
    evaluateEscalation, getEventsForGraph, getAllEvents,
};
//# sourceMappingURL=escalation-governance.js.map