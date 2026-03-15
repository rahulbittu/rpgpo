"use strict";
// GPO Feature Flags — Centralized feature toggle management
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnabled = isEnabled;
exports.setFlag = setFlag;
exports.getAllFlags = getAllFlags;
const fs = require('fs');
const path = require('path');
const FLAGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'config', 'feature-flags.json');
const DEFAULTS = [
    { key: 'autopilot', enabled: false, description: 'Auto-advance workflows without operator approval', category: 'workflow', defaultValue: false },
    { key: 'autoDeliberate', enabled: true, description: 'Auto-start deliberation on task submit', category: 'workflow', defaultValue: true },
    { key: 'autoApprove', enabled: true, description: 'Auto-approve research task plans', category: 'workflow', defaultValue: true },
    { key: 'subtaskChaining', enabled: true, description: 'Pass subtask outputs to subsequent subtasks', category: 'execution', defaultValue: true },
    { key: 'contextInjection', enabled: true, description: 'Inject operator + domain context into prompts', category: 'ai', defaultValue: true },
    { key: 'learningStore', enabled: true, description: 'Persistent cross-session learning', category: 'ai', defaultValue: true },
    { key: 'qualityScoring', enabled: true, description: 'Auto-score task output quality', category: 'ai', defaultValue: true },
    { key: 'promptOptimization', enabled: true, description: 'Learn from prompt patterns', category: 'ai', defaultValue: true },
    { key: 'errorTracking', enabled: true, description: 'Centralized error tracking', category: 'ops', defaultValue: true },
    { key: 'costInsights', enabled: true, description: 'Spending analysis and recommendations', category: 'ops', defaultValue: true },
    { key: 'contextEnrichment', enabled: true, description: 'Auto-extract insights from completed tasks', category: 'ai', defaultValue: true },
    { key: 'suggestions', enabled: true, description: 'Smart task suggestions', category: 'ux', defaultValue: true },
    { key: 'webhooks', enabled: false, description: 'External webhook integrations', category: 'enterprise', defaultValue: false },
    { key: 'rbac', enabled: false, description: 'Role-based access control', category: 'enterprise', defaultValue: false },
    { key: 'recurringScheduler', enabled: false, description: 'Cron-like task scheduling', category: 'ops', defaultValue: false },
    { key: 'compoundWorkflows', enabled: true, description: 'Multi-engine workflow orchestration', category: 'workflow', defaultValue: true },
];
function isEnabled(key) {
    const flags = loadFlags();
    const flag = DEFAULTS.find(f => f.key === key);
    return flags[key] ?? flag?.defaultValue ?? false;
}
function setFlag(key, enabled) {
    const flags = loadFlags();
    flags[key] = enabled;
    saveFlags(flags);
}
function getAllFlags() {
    const flags = loadFlags();
    return DEFAULTS.map(f => ({ ...f, enabled: flags[f.key] ?? f.defaultValue }));
}
function loadFlags() {
    try {
        if (fs.existsSync(FLAGS_FILE)) {
            const data = JSON.parse(fs.readFileSync(FLAGS_FILE, 'utf-8'));
            const flat = {};
            for (const [k, v] of Object.entries(data)) {
                if (typeof v === 'boolean')
                    flat[k] = v;
                else if (typeof v === 'object' && v !== null) {
                    for (const [sk, sv] of Object.entries(v)) {
                        if (typeof sv === 'boolean')
                            flat[sk] = sv;
                    }
                }
            }
            return flat;
        }
    }
    catch { /* */ }
    return {};
}
function saveFlags(flags) {
    const dir = path.dirname(FLAGS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FLAGS_FILE, JSON.stringify(flags, null, 2));
}
module.exports = { isEnabled, setFlag, getAllFlags };
