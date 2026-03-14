"use strict";
// GPO Collaboration Contracts — Governed multi-agent handoff patterns
// Defines allowed provider pairs, required handoff fields, escalation triggers.
// Scoped at global / engine / project levels.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllContracts = getAllContracts;
exports.getContract = getContract;
exports.getContractsForDomain = getContractsForDomain;
exports.getContractsForProject = getContractsForProject;
exports.findContract = findContract;
exports.createContract = createContract;
exports.toggleContract = toggleContract;
exports.recordHandoff = recordHandoff;
exports.getHandoffsForGraph = getHandoffsForGraph;
exports.getAllHandoffs = getAllHandoffs;
const fs = require('fs');
const path = require('path');
const CONTRACTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'collaboration-contracts.json');
const HANDOFFS_FILE = path.resolve(__dirname, '..', '..', 'state', 'handoff-records.json');
function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
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
// Built-in Collaboration Contracts
// ═══════════════════════════════════════════
function defaultContracts() {
    return [
        {
            contract_id: 'cc_board_to_builder',
            title: 'Board Reasoner → Code Builder',
            description: 'Handoff from board reasoning (OpenAI) to code execution (Claude)',
            from_role: 'reasoner',
            to_role: 'builder',
            allowed_pairs: [
                { from_provider: 'openai', to_provider: 'claude', preferred: true },
                { from_provider: 'gemini', to_provider: 'claude', preferred: false },
            ],
            required_handoff_fields: ['summary', 'target_files', 'acceptance_criteria'],
            escalation_triggers: ['red_risk', 'privacy_violation', 'scope_change'],
            requires_reviewer: false,
            scope_level: 'global',
            scope_id: 'global',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            contract_id: 'cc_research_to_strategy',
            title: 'Researcher → Strategist',
            description: 'Handoff from research (Perplexity) to strategy synthesis (OpenAI)',
            from_role: 'researcher',
            to_role: 'strategist',
            allowed_pairs: [
                { from_provider: 'perplexity', to_provider: 'openai', preferred: true },
                { from_provider: 'perplexity', to_provider: 'gemini', preferred: false },
            ],
            required_handoff_fields: ['summary', 'sources', 'key_findings'],
            escalation_triggers: ['conflicting_sources', 'no_data_found'],
            requires_reviewer: false,
            scope_level: 'global',
            scope_id: 'global',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            contract_id: 'cc_builder_to_reviewer',
            title: 'Code Builder → Code Reviewer',
            description: 'Handoff from code execution (Claude) to critique (Gemini/OpenAI)',
            from_role: 'builder',
            to_role: 'critic',
            allowed_pairs: [
                { from_provider: 'claude', to_provider: 'gemini', preferred: true },
                { from_provider: 'claude', to_provider: 'openai', preferred: false },
            ],
            required_handoff_fields: ['summary', 'files_changed', 'diff_summary'],
            escalation_triggers: ['red_risk', 'breaking_change', 'security_concern'],
            requires_reviewer: true,
            scope_level: 'global',
            scope_id: 'global',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            contract_id: 'cc_critic_to_strategist',
            title: 'Critic → Strategist',
            description: 'When critique identifies issues, escalate to strategist for replanning',
            from_role: 'critic',
            to_role: 'strategist',
            allowed_pairs: [
                { from_provider: 'gemini', to_provider: 'openai', preferred: true },
            ],
            required_handoff_fields: ['summary', 'issues_found', 'recommended_action'],
            escalation_triggers: ['fundamental_disagreement', 'architecture_concern'],
            requires_reviewer: false,
            scope_level: 'global',
            scope_id: 'global',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];
}
// ═══════════════════════════════════════════
// Contract CRUD
// ═══════════════════════════════════════════
function ensureDefaults() {
    let contracts = readJson(CONTRACTS_FILE, []);
    if (contracts.length === 0) {
        contracts = defaultContracts();
        writeJson(CONTRACTS_FILE, contracts);
    }
    return contracts;
}
function getAllContracts() {
    return ensureDefaults();
}
function getContract(contractId) {
    return getAllContracts().find(c => c.contract_id === contractId) || null;
}
function getContractsForDomain(domain) {
    return getAllContracts().filter(c => (c.scope_level === 'engine' && c.scope_id === domain) ||
        c.scope_level === 'global');
}
function getContractsForProject(projectId) {
    return getAllContracts().filter(c => (c.scope_level === 'project' && c.scope_id === projectId) ||
        c.scope_level === 'global');
}
/** Find matching contract for a role handoff */
function findContract(fromRole, toRole, domain, projectId) {
    const all = getAllContracts().filter(c => c.enabled && c.from_role === fromRole && c.to_role === toRole);
    // Prefer project > engine > global
    if (projectId) {
        const proj = all.find(c => c.scope_level === 'project' && c.scope_id === projectId);
        if (proj)
            return proj;
    }
    if (domain) {
        const eng = all.find(c => c.scope_level === 'engine' && c.scope_id === domain);
        if (eng)
            return eng;
    }
    return all.find(c => c.scope_level === 'global') || null;
}
function createContract(opts) {
    const contracts = getAllContracts();
    const contract = {
        ...opts,
        contract_id: uid('cc'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    contracts.unshift(contract);
    writeJson(CONTRACTS_FILE, contracts);
    return contract;
}
function toggleContract(contractId) {
    const contracts = getAllContracts();
    const idx = contracts.findIndex(c => c.contract_id === contractId);
    if (idx === -1)
        return null;
    contracts[idx].enabled = !contracts[idx].enabled;
    contracts[idx].updated_at = new Date().toISOString();
    writeJson(CONTRACTS_FILE, contracts);
    return contracts[idx];
}
// ═══════════════════════════════════════════
// Handoff Records
// ═══════════════════════════════════════════
function recordHandoff(opts) {
    const handoffs = readJson(HANDOFFS_FILE, []);
    const record = {
        ...opts,
        handoff_id: uid('hf'),
        created_at: new Date().toISOString(),
    };
    handoffs.unshift(record);
    if (handoffs.length > 500)
        handoffs.length = 500;
    writeJson(HANDOFFS_FILE, handoffs);
    return record;
}
function getHandoffsForGraph(graphId) {
    return readJson(HANDOFFS_FILE, []).filter(h => h.graph_id === graphId);
}
function getAllHandoffs() {
    return readJson(HANDOFFS_FILE, []);
}
module.exports = {
    getAllContracts, getContract, getContractsForDomain, getContractsForProject,
    findContract, createContract, toggleContract,
    recordHandoff, getHandoffsForGraph, getAllHandoffs,
};
//# sourceMappingURL=collaboration-contracts.js.map