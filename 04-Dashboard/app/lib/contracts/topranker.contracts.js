"use strict";
// GPO TopRanker Contracts — Structured output contracts for TopRanker engine
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopRankerContracts = getTopRankerContracts;
exports.validateTopRankerPayload = validateTopRankerPayload;
const CONTRACT_IDS = {
    LEADERBOARD: 'topranker.leaderboard.v1',
    SCORECARD: 'topranker.scorecard.v1',
    REVIEW_AGGREGATION: 'topranker.review-aggregation.v1',
    RELEASE_ARTIFACT: 'topranker.release-artifact.v1',
};
const LEADERBOARD_SCHEMA = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: CONTRACT_IDS.LEADERBOARD,
    title: 'TopRanker Leaderboard',
    type: 'object',
    properties: {
        entries: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    businessId: { type: 'string' }, name: { type: 'string' }, rank: { type: 'number' },
                    score: { type: 'number' }, confidence: { type: 'number' }, city: { type: 'string' },
                    category: { type: 'string' }, verificationStatus: { type: 'string', enum: ['unverified', 'pending', 'verified'] },
                    signals: { type: 'object', properties: { reviews: { type: 'number' }, avgRating: { type: 'number' }, recencyBias: { type: 'number' }, wilsonScore: { type: 'number' }, volumeWeight: { type: 'number' } }, required: ['reviews', 'avgRating'] },
                    rationale: { type: 'string' }, computedAt: { type: 'string' },
                },
                required: ['businessId', 'name', 'rank', 'score', 'rationale'],
            },
        },
        evidence: { type: 'array', items: { type: 'string' } },
    },
    required: ['entries'],
    additionalProperties: false,
};
const SCORECARD_SCHEMA = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: CONTRACT_IDS.SCORECARD,
    title: 'TopRanker Business Scorecard',
    type: 'object',
    properties: {
        scorecards: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    businessId: { type: 'string' }, name: { type: 'string' }, city: { type: 'string' }, category: { type: 'string' },
                    kpis: { type: 'object', properties: { trust: { type: 'number' }, responsiveness: { type: 'number' }, satisfaction: { type: 'number' }, consistency: { type: 'number' } } },
                    riskFlags: { type: 'object', properties: { suspiciousActivity: { type: 'boolean' }, conflictingInfo: { type: 'boolean' }, lowVolume: { type: 'boolean' } } },
                    notes: { type: 'array', items: { type: 'string' } }, computedAt: { type: 'string' },
                },
                required: ['businessId', 'name'],
            },
        },
        evidence: { type: 'array', items: { type: 'string' } },
    },
    required: ['scorecards'],
    additionalProperties: false,
};
const REVIEW_AGG_SCHEMA = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: CONTRACT_IDS.REVIEW_AGGREGATION,
    title: 'TopRanker Review Aggregation',
    type: 'object',
    properties: {
        aggregations: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    businessId: { type: 'string' },
                    period: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, windowDays: { type: 'number' } } },
                    sources: { type: 'array', items: { type: 'object', properties: { source: { type: 'string' }, count: { type: 'number' }, avgRating: { type: 'number' } } } },
                    sentiment: { type: 'object', properties: { positive: { type: 'number' }, neutral: { type: 'number' }, negative: { type: 'number' } } },
                    sampleSnippets: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, sentiment: { type: 'string' }, source: { type: 'string' }, capturedAt: { type: 'string' } } }, maxItems: 5 },
                    aggregationMethod: { type: 'string', enum: ['bayesian', 'wilson', 'hybrid'] },
                    computedAt: { type: 'string' },
                },
                required: ['businessId'],
            },
        },
        evidence: { type: 'array', items: { type: 'string' } },
    },
    required: ['aggregations'],
    additionalProperties: false,
};
const RELEASE_ARTIFACT_SCHEMA = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: CONTRACT_IDS.RELEASE_ARTIFACT,
    title: 'TopRanker Release Artifact',
    type: 'object',
    properties: {
        artifactId: { type: 'string' }, repoPath: { type: 'string' }, commitSha: { type: 'string' },
        buildNumber: { type: 'string' }, platform: { type: 'string', enum: ['server', 'mobile', 'web'] },
        filePath: { type: 'string' }, sizeBytes: { type: 'number' }, checksumSha256: { type: 'string' },
        createdAt: { type: 'string' },
    },
    required: ['artifactId', 'platform', 'filePath', 'checksumSha256'],
    additionalProperties: false,
};
const ALL_CONTRACTS = [
    { id: CONTRACT_IDS.LEADERBOARD, version: 'v1', schema: LEADERBOARD_SCHEMA },
    { id: CONTRACT_IDS.SCORECARD, version: 'v1', schema: SCORECARD_SCHEMA },
    { id: CONTRACT_IDS.REVIEW_AGGREGATION, version: 'v1', schema: REVIEW_AGG_SCHEMA },
    { id: CONTRACT_IDS.RELEASE_ARTIFACT, version: 'v1', schema: RELEASE_ARTIFACT_SCHEMA },
];
function getTopRankerContracts() {
    return ALL_CONTRACTS;
}
function validateTopRankerPayload(contractId, payload) {
    const contract = ALL_CONTRACTS.find(c => c.id === contractId);
    if (!contract)
        return { valid: false, errors: [{ path: '', message: `Unknown contract: ${contractId}` }] };
    const schema = contract.schema;
    const errors = [];
    if (typeof payload !== 'object' || payload === null) {
        return { valid: false, errors: [{ path: '', message: 'Payload must be an object' }] };
    }
    // Check required fields
    for (const field of (schema.required || [])) {
        if (!(field in payload)) {
            errors.push({ path: field, message: `Missing required field: ${field}` });
        }
    }
    // Check array fields contain arrays
    for (const [field, def] of Object.entries(schema.properties || {})) {
        if (def.type === 'array' && field in payload) {
            if (!Array.isArray(payload[field])) {
                errors.push({ path: field, message: `${field} must be an array` });
            }
        }
    }
    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}
module.exports = { CONTRACT_IDS, getTopRankerContracts, validateTopRankerPayload };
//# sourceMappingURL=topranker.contracts.js.map