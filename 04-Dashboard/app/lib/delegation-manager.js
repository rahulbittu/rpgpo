"use strict";
// GPO Delegation Manager — Optional human delegation for approvals/escalations
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = createRule;
exports.getAllRules = getAllRules;
exports.toggleRule = toggleRule;
exports.findDelegate = findDelegate;
const fs = require('fs');
const path = require('path');
const RULES_FILE = path.resolve(__dirname, '..', '..', 'state', 'delegation-rules.json');
function uid() { return 'dl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Create a delegation rule */
function createRule(opts) {
    const rules = readJson(RULES_FILE, []);
    const rule = {
        rule_id: uid(),
        approval_type: opts.approval_type,
        scope_level: opts.scope_level,
        scope_id: opts.scope_id,
        lane: opts.lane,
        delegated_to: opts.delegated_to,
        fallback_to: opts.fallback_to || 'operator',
        expires_at: opts.expires_at,
        enabled: true,
        created_at: new Date().toISOString(),
    };
    rules.unshift(rule);
    writeJson(RULES_FILE, rules);
    return rule;
}
function getAllRules() { return readJson(RULES_FILE, []); }
function toggleRule(ruleId) {
    const rules = getAllRules();
    const idx = rules.findIndex(r => r.rule_id === ruleId);
    if (idx === -1)
        return null;
    rules[idx].enabled = !rules[idx].enabled;
    writeJson(RULES_FILE, rules);
    return rules[idx];
}
/** Find a delegation target for an approval type and scope */
function findDelegate(approvalType, scopeLevel, scopeId, lane) {
    const now = new Date().toISOString();
    const rules = getAllRules().filter(r => r.enabled && r.approval_type === approvalType &&
        (r.scope_level === scopeLevel && r.scope_id === scopeId || r.scope_level === 'global') &&
        (!r.lane || r.lane === lane) &&
        (!r.expires_at || r.expires_at > now));
    return rules.length > 0 ? rules[0].delegated_to : null;
}
module.exports = { createRule, getAllRules, toggleRule, findDelegate };
//# sourceMappingURL=delegation-manager.js.map