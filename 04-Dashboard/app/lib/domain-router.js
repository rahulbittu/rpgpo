"use strict";
// GPO Domain Router — Canonical-first engine routing
// All keyword tables use canonical engine IDs.
// Legacy IDs are resolved through the canonical-engines adapter for backward compat only.
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeRequest = routeRequest;
exports.toCanonical = toCanonical;
exports.toLegacy = toLegacy;
exports.resolveAlias = resolveAlias;
// Canonical engine ID → keyword list
var ENGINE_KEYWORDS = {
    news: ['news', 'headline', 'trending', 'current events', 'journalism', 'breaking', 'today\'s news'],
    finance: ['passive income', 'investment', 'wealth', 'money', 'side hustle', 'revenue', 'profit', 'side project', 'income ideas', 'income stream', 'financial plan', 'tax', 'retirement', 'insurance', 'savings', 'portfolio', 'roth ira', '401k', 'estate planning', 'angel investing', 'angel deal', 'capital gains', 'dividend', 'bonds', 'reit', 'hsa', 'net worth', 'budgeting', 'debt payoff', 'wealth building', 'financial independence', 'social security', 'medicare', 'pension', 'annuity', 'minimum distribution', 'rmd', 'fiduciary'],
    career: ['career', 'salary', 'hiring', 'resume', 'interview', 'promotion', 'data engineer', 'job market', 'skill gap', 'professional development', 'job search', 'compensation', 'engineering manager', 'staff engineer', 'principal engineer', 'performance review', 'one-on-one', 'skip-level', 'managing up', 'personal brand', 'linkedin', 'career pivot', 'negotiation', 'imposter syndrome', 'mentoring', 'onboarding new', 'hiring pipeline', 'tech lead', 'engineering ladder', 'technical leadership', 'sprint demo', 'stakeholder trust', 'cross-functional influence', 'retrospective', 'team health', 'executive presence', 'executive communication', 'delegation framework', 'building influence'],
    writing: ['write a guide', 'write a complete', 'draft a', 'memo', 'prd', 'spec', 'sop', 'runbook', 'proposal', 'letter', 'rewrite', 'executive summary', 'summarize this', 'technical writing', 'documentation culture', 'documentation debt', 'rfc', 'design document', 'concept for a', 'treatment for a', 'series bible', 'character bible', 'world-building', 'outline for a', 'pitch deck', 'concept for an'],
    research: ['research the best', 'analyze', 'investigate', 'evaluate', 'assessment', 'deep-dive', 'deep dive', 'market analysis', 'competitive analysis', 'compare', 'latest evidence', 'benchmark', 'best home', 'best budget', 'best portable', 'best smart', 'best wireless', 'best ergonomic', 'best indoor', 'best outdoor', 'best noise', 'under $', 'under five hundred', 'under three hundred', 'under four hundred', 'under two hundred', 'under one hundred'],
    learning: ['teach me', 'explain how', 'explain the', 'tutor', 'study plan', 'quiz me', 'course', 'curriculum', 'how does', 'how do', 'works under the hood', 'works end-to-end', 'works from', 'internals of', 'works in modern', 'works compared to', 'how modern', 'how the linux', 'how container', 'how database', 'how compiler', 'how garbage', 'how virtual', 'how async', 'how tcp', 'how http', 'how dns', 'how tls', 'how web'],
    shopping: ['buy', 'purchase', 'compare products', 'shopping', 'best price', 'product comparison'],
    travel: ['travel', 'trip', 'flight', 'hotel', 'itinerary', 'relocation', 'moving to', 'tour through', 'road trip', 'tour of', 'safari', 'backpacking', 'immersion trip', 'cultural tour', 'food tour', 'wine tour', 'history tour', 'adventure tour'],
    health: ['fitness', 'workout', 'diet', 'health protocol', 'wellness', 'exercise', 'nutrition', 'mobility', 'stretching', 'flexibility', 'injury prevention', 'recovery protocol', 'sleep optimization', 'sleep protocol', 'posture', 'rehabilitation', 'prehab', 'breathing exercise', 'stress management', 'eye strain', 'dental care', 'skincare', 'shoulder mobility', 'knee health', 'back health', 'ankle stability', 'grip strength', 'core strength', 'marathon training', 'strength training', 'training program', 'training plan', 'hip flexor', 'neck tension', 'rotator cuff', 'plantar fascia', 'wrist mobility', 'thoracic spine', 'migraine', 'jaw tension'],
    ops: ['plan my week', 'schedule', 'time block', 'calendar', 'routine', 'habit', 'prioritize', 'morning routine', 'meal prep', 'home organization', 'productivity', 'deep work', 'energy management', 'weekly review', 'annual planning', 'goal setting', 'inbox zero', 'digital minimalism', 'personal accountability'],
    code: ['architecture', 'microservices', 'kubernetes', 'ci/cd', 'pipeline', 'monitoring', 'infrastructure', 'terraform', 'docker', 'serverless', 'scaling', 'deployment', 'api gateway', 'load balancing', 'caching strategy', 'database migration', 'feature flag', 'incident response', 'saas', 'platform engineering'],
    screenwriting: ['screenplay', 'script', 'dialogue', 'scene', 'series concept', 'pilot episode', 'character study', 'narrative game', 'video game concept', 'board game', 'tabletop rpg', 'escape room', 'podcast series', 'documentary', 'animated series', 'comedy series', 'thriller', 'mystery novel', 'graphic novel', 'fiction anthology'],
    music: ['music', 'song', 'composition', 'lyrics', 'melody', 'album', 'audio production', 'musical'],
};
// Canonical → legacy mapping (for backward compat with stored tasks and types.ts)
var CANONICAL_TO_LEGACY = {
    career: 'careeregine',
    finance: 'wealthresearch',
    ops: 'personalops',
    startup: 'topranker', // Note: 'startup' was used as keyword key before, topranker is the original legacy
    news: 'newsroom',
    film: 'founder2founder',
    code: 'startup', // 'code' canonical maps to 'startup' legacy (which was used in old DOMAIN_KEYWORDS)
};
// Legacy → canonical (for reading old data)
var LEGACY_TO_CANONICAL = {
    careeregine: 'career',
    wealthresearch: 'finance',
    personalops: 'ops',
    topranker: 'startup',
    newsroom: 'news',
    founder2founder: 'film',
};
function routeRequest(rawRequest) {
    var lower = rawRequest.toLowerCase();
    var scores = [];
    for (var _i = 0, _a = Object.entries(ENGINE_KEYWORDS); _i < _a.length; _i++) {
        var _b = _a[_i], engine = _b[0], keywords = _b[1];
        var score = 0;
        for (var _c = 0, keywords_1 = keywords; _c < keywords_1.length; _c++) {
            var kw = keywords_1[_c];
            if (lower.includes(kw))
                score += kw.split(' ').length;
        }
        if (score > 0)
            scores.push({ domain: engine, score: score });
    }
    scores.sort(function (a, b) { return b.score - a.score; });
    if (scores.length === 0) {
        return { domain: 'general', legacyDomain: 'general', confidence: 0.3, alternates: [], reason: 'No keyword matches — defaulting to general' };
    }
    var best = scores[0];
    var confidence = Math.min(1, best.score / 3);
    var legacyDomain = CANONICAL_TO_LEGACY[best.domain] || best.domain;
    return {
        domain: best.domain,
        legacyDomain: legacyDomain,
        confidence: confidence,
        alternates: scores.slice(1, 4).map(function (s) { return ({
            domain: s.domain,
            confidence: Math.min(1, s.score / 3),
        }); }),
        reason: "Matched ".concat(best.score, " keywords for ").concat(best.domain),
    };
}
/** Convert legacy domain ID to canonical */
function toCanonical(domain) {
    return LEGACY_TO_CANONICAL[domain] || domain;
}
/** Convert canonical to legacy (backward compat) */
function toLegacy(canonical) {
    return CANONICAL_TO_LEGACY[canonical] || canonical;
}
/** Resolve any alias to the legacy domain ID (for backward compat with current type system) */
function resolveAlias(domain) {
    // If it's a canonical ID, convert to legacy for current type compat
    var legacy = CANONICAL_TO_LEGACY[domain];
    if (legacy)
        return legacy;
    // Common form aliases
    var FORM_ALIASES = {
        career: 'careeregine',
        finance: 'wealthresearch',
        home: 'personalops',
        communications: 'writing',
        chief_of_staff: 'personalops',
    };
    return FORM_ALIASES[domain] || domain;
}
module.exports = { routeRequest: routeRequest, resolveAlias: resolveAlias, toCanonical: toCanonical, toLegacy: toLegacy };
