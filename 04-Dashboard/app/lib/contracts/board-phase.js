"use strict";
// GPO Board Phase Schema — JSON Schema for each board lifecycle phase output
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoardPhaseSchema = getBoardPhaseSchema;
exports.getAllBoardPhaseSchemas = getAllBoardPhaseSchemas;
const PHASE_SCHEMAS = {
    interpret: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'interpret' },
            summary: { type: 'string', description: 'Clear interpretation of the task objective' },
            decisions: { type: 'array', items: { type: 'string' }, description: 'Key decisions identified' },
            risks: { type: 'array', items: { type: 'string' }, description: 'Initial risks identified' },
        },
        required: ['phase', 'summary'],
    },
    research: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'research' },
            summary: { type: 'string', description: 'Research findings and verified assumptions' },
            decisions: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' }, description: 'Unknowns requiring investigation' },
        },
        required: ['phase', 'summary'],
    },
    critique: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'critique' },
            summary: { type: 'string', description: 'Strategic critique and alternative approaches' },
            decisions: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' }, description: 'Challenged assumptions and risks' },
        },
        required: ['phase', 'summary'],
    },
    synthesize: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'synthesize' },
            summary: { type: 'string', description: 'Final board recommendation synthesis' },
            decisions: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
            subtasks: { type: 'array', items: { type: 'object' }, description: 'Suggested subtask breakdown' },
            requiredFieldsCovered: { type: 'array', items: { type: 'string' } },
            missingFields: { type: 'array', items: { type: 'string' } },
        },
        required: ['phase', 'summary'],
    },
    decide: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'decide' },
            summary: { type: 'string', description: 'Risk classification and alignment assessment' },
            decisions: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
        },
        required: ['phase', 'summary'],
    },
    review: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'review' },
            summary: { type: 'string', description: 'Technical review of implementation risks' },
            risks: { type: 'array', items: { type: 'string' } },
            contractHints: { type: 'object', description: 'Hints for contract compliance' },
        },
        required: ['phase', 'summary'],
    },
    report: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'report' },
            summary: { type: 'string', description: 'Final packaged board output' },
        },
        required: ['phase', 'summary'],
    },
    handoff: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            phase: { type: 'string', const: 'handoff' },
            summary: { type: 'string' },
        },
        required: ['phase', 'summary'],
    },
};
function getBoardPhaseSchema(phase) {
    return PHASE_SCHEMAS[phase] || PHASE_SCHEMAS.interpret;
}
function getAllBoardPhaseSchemas() {
    return { ...PHASE_SCHEMAS };
}
module.exports = { getBoardPhaseSchema, getAllBoardPhaseSchemas };
//# sourceMappingURL=board-phase.js.map