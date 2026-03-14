"use strict";
// GPO Mission Statements — Explicit purpose at every level
// Operator, engine, and project mission statements that drive prioritization,
// board reasoning, and Chief of Staff recommendations.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStatements = getAllStatements;
exports.getOperatorStatement = getOperatorStatement;
exports.getEngineStatement = getEngineStatement;
exports.getProjectStatement = getProjectStatement;
exports.getStatement = getStatement;
exports.setStatement = setStatement;
exports.deleteStatement = deleteStatement;
exports.buildMissionStatementBlock = buildMissionStatementBlock;
exports.checkMissionAlignment = checkMissionAlignment;
const fs = require('fs');
const path = require('path');
const STATEMENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'mission-statements.json');
function uid() {
    return 'ms_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function readStatements() {
    try {
        return fs.existsSync(STATEMENTS_FILE) ? JSON.parse(fs.readFileSync(STATEMENTS_FILE, 'utf-8')) : [];
    }
    catch {
        return [];
    }
}
function writeStatements(statements) {
    const dir = path.dirname(STATEMENTS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATEMENTS_FILE, JSON.stringify(statements, null, 2));
}
// ═══════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════
/** Get all mission statements */
function getAllStatements() {
    return readStatements();
}
/** Get the operator-level mission statement */
function getOperatorStatement() {
    return readStatements().find(s => s.level === 'operator') || null;
}
/** Get engine-level mission statement */
function getEngineStatement(domain) {
    return readStatements().find(s => s.level === 'engine' && s.scope_id === domain) || null;
}
/** Get project-level mission statement */
function getProjectStatement(projectId) {
    return readStatements().find(s => s.level === 'project' && s.scope_id === projectId) || null;
}
/** Get statement by level and scope */
function getStatement(level, scopeId) {
    return readStatements().find(s => s.level === level && s.scope_id === scopeId) || null;
}
/** Set or update a mission statement */
function setStatement(level, scopeId, data) {
    const statements = readStatements();
    const existing = statements.findIndex(s => s.level === level && s.scope_id === scopeId);
    const record = {
        id: existing >= 0 ? statements[existing].id : uid(),
        level,
        scope_id: scopeId,
        statement: data.statement,
        objectives: data.objectives || [],
        values: data.values || [],
        success_criteria: data.success_criteria || [],
        created_at: existing >= 0 ? statements[existing].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    if (existing >= 0) {
        statements[existing] = record;
    }
    else {
        statements.push(record);
    }
    writeStatements(statements);
    return record;
}
/** Delete a mission statement */
function deleteStatement(level, scopeId) {
    const statements = readStatements();
    const idx = statements.findIndex(s => s.level === level && s.scope_id === scopeId);
    if (idx < 0)
        return false;
    statements.splice(idx, 1);
    writeStatements(statements);
    return true;
}
// ═══════════════════════════════════════════
// Context Fusion — build prompt blocks for AI agents
// ═══════════════════════════════════════════
/** Build a compact mission statement block for prompt injection */
function buildMissionStatementBlock(domain, projectId) {
    const sections = [];
    const opStatement = getOperatorStatement();
    if (opStatement) {
        sections.push(`## Operator Mission\n${opStatement.statement}`);
        if (opStatement.objectives.length > 0) {
            sections.push(`Key objectives: ${opStatement.objectives.join('; ')}`);
        }
    }
    if (domain) {
        const engineStatement = getEngineStatement(domain);
        if (engineStatement) {
            sections.push(`## Engine Mission (${domain})\n${engineStatement.statement}`);
            if (engineStatement.objectives.length > 0) {
                sections.push(`Engine objectives: ${engineStatement.objectives.join('; ')}`);
            }
        }
    }
    if (projectId) {
        const projStatement = getProjectStatement(projectId);
        if (projStatement) {
            sections.push(`## Project Mission\n${projStatement.statement}`);
            if (projStatement.success_criteria.length > 0) {
                sections.push(`Success criteria: ${projStatement.success_criteria.join('; ')}`);
            }
        }
    }
    return sections.join('\n\n');
}
/** Check if an action aligns with mission statements */
function checkMissionAlignment(actionDescription, domain, projectId) {
    const opStatement = getOperatorStatement();
    const engineStatement = domain ? getEngineStatement(domain) : null;
    const projStatement = projectId ? getProjectStatement(projectId) : null;
    // Use the most specific available statement
    const statement = projStatement || engineStatement || opStatement;
    if (!statement) {
        return { aligned: true, reason: 'No mission statement defined', statement_snippet: '' };
    }
    // Simple keyword alignment check — real implementation would use AI
    const statementText = [
        statement.statement,
        ...statement.objectives,
        ...statement.values,
        ...statement.success_criteria,
    ].join(' ').toLowerCase();
    const actionWords = actionDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchCount = actionWords.filter(w => statementText.includes(w)).length;
    const alignmentScore = actionWords.length > 0 ? matchCount / actionWords.length : 0;
    return {
        aligned: alignmentScore > 0.1 || !actionDescription,
        reason: alignmentScore > 0.3
            ? 'Directly supports mission objectives'
            : alignmentScore > 0.1
                ? 'Partially aligned with mission'
                : 'May not directly support current mission — review relevance',
        statement_snippet: statement.statement.slice(0, 80),
    };
}
module.exports = {
    getAllStatements,
    getOperatorStatement, getEngineStatement, getProjectStatement, getStatement,
    setStatement, deleteStatement,
    buildMissionStatementBlock, checkMissionAlignment,
};
//# sourceMappingURL=mission-statements.js.map