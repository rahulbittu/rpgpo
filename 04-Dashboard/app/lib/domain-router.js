"use strict";
// GPO Domain Router — Auto-detect the best engine for a task request
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeRequest = routeRequest;
exports.resolveAlias = resolveAlias;
var DOMAIN_KEYWORDS = {
    newsroom: ['news', 'headline', 'trending', 'current events', 'journalism', 'breaking', 'today\'s news'],
    wealthresearch: ['passive income', 'investment', 'wealth', 'money', 'side hustle', 'revenue', 'profit', 'side project', 'income ideas', 'income stream', 'financial plan', 'tax', 'retirement', 'insurance', 'savings', 'portfolio', 'roth ira', '401k', 'estate planning', 'angel investing', 'angel deal', 'capital gains', 'dividend', 'bonds', 'reit', 'hsa', 'net worth', 'budgeting', 'debt payoff', 'wealth building', 'financial independence', 'social security', 'medicare', 'pension', 'annuity', 'minimum distribution', 'rmd', 'fiduciary'],
    careeregine: ['career', 'salary', 'hiring', 'resume', 'interview', 'promotion', 'data engineer', 'job market', 'skill gap', 'professional development', 'job search', 'compensation', 'engineering manager', 'staff engineer', 'principal engineer', 'performance review', 'one-on-one', 'skip-level', 'managing up', 'personal brand', 'linkedin', 'career pivot', 'negotiation', 'imposter syndrome', 'mentoring', 'onboarding new', 'hiring pipeline', 'tech lead', 'engineering ladder', 'technical leadership', 'sprint demo', 'stakeholder trust', 'cross-functional influence', 'retrospective', 'team health', 'executive presence', 'executive communication', 'delegation framework', 'building influence'],
    topranker: ['topranker', 'leaderboard', 'ranking', 'business listing', 'community rank'],
    writing: ['write a guide', 'write a complete', 'draft a', 'memo', 'prd', 'spec', 'sop', 'runbook', 'proposal', 'letter', 'rewrite', 'executive summary', 'summarize this', 'technical writing', 'documentation culture', 'documentation debt', 'rfc', 'design document', 'concept for a', 'treatment for a', 'series bible', 'character bible', 'world-building', 'outline for a', 'pitch deck', 'concept for an'],
    research: ['research the best', 'analyze', 'investigate', 'evaluate', 'assessment', 'deep-dive', 'deep dive', 'market analysis', 'competitive analysis', 'compare', 'latest evidence', 'benchmark', 'best home', 'best budget', 'best portable', 'best smart', 'best wireless', 'best ergonomic', 'best indoor', 'best outdoor', 'best noise', 'under $', 'under five hundred', 'under three hundred', 'under four hundred', 'under two hundred', 'under one hundred'],
    learning: ['teach me', 'explain how', 'explain the', 'tutor', 'study plan', 'quiz me', 'course', 'curriculum', 'how does', 'how do', 'works under the hood', 'works end-to-end', 'works from', 'internals of', 'works in modern', 'works compared to', 'how modern', 'how the linux', 'how container', 'how database', 'how compiler', 'how garbage', 'how virtual', 'how async', 'how tcp', 'how http', 'how dns', 'how tls', 'how web'],
    shopping: ['buy', 'purchase', 'compare products', 'shopping', 'best price', 'product comparison'],
    travel: ['travel', 'trip', 'flight', 'hotel', 'itinerary', 'relocation', 'moving to', 'tour through', 'road trip', 'tour of', 'safari', 'backpacking', 'immersion trip', 'cultural tour', 'food tour', 'wine tour', 'history tour', 'adventure tour'],
    health: ['fitness', 'workout', 'diet', 'health protocol', 'wellness', 'exercise', 'nutrition', 'mobility', 'stretching', 'flexibility', 'injury prevention', 'recovery protocol', 'sleep optimization', 'sleep protocol', 'posture', 'rehabilitation', 'prehab', 'breathing exercise', 'stress management', 'eye strain', 'dental care', 'skincare', 'shoulder mobility', 'knee health', 'back health', 'ankle stability', 'grip strength', 'core strength', 'marathon training', 'strength training', 'training program', 'training plan', 'hip flexor', 'neck tension', 'rotator cuff', 'plantar fascia', 'wrist mobility', 'thoracic spine', 'migraine', 'jaw tension'],
    personalops: ['plan my week', 'schedule', 'time block', 'calendar', 'routine', 'habit', 'prioritize', 'morning routine', 'meal prep', 'home organization', 'productivity', 'deep work', 'energy management', 'weekly review', 'annual planning', 'goal setting', 'inbox zero', 'digital minimalism', 'personal accountability'],
    startup: ['architecture', 'microservices', 'kubernetes', 'ci/cd', 'pipeline', 'monitoring', 'infrastructure', 'terraform', 'docker', 'serverless', 'scaling', 'deployment', 'api gateway', 'load balancing', 'caching strategy', 'database migration', 'feature flag', 'incident response', 'saas', 'platform engineering'],
    screenwriting: ['screenplay', 'script', 'dialogue', 'scene', 'series concept', 'pilot episode', 'character study', 'narrative game', 'video game concept', 'board game', 'tabletop rpg', 'escape room', 'podcast series', 'documentary', 'animated series', 'comedy series', 'thriller', 'mystery novel', 'graphic novel', 'fiction anthology'],
    music: ['music', 'song', 'composition', 'lyrics', 'melody', 'album', 'audio production', 'musical'],
};
// Map intake form values to canonical domain names
var DOMAIN_ALIASES = {
    career: 'careeregine',
    finance: 'wealthresearch',
    home: 'personalops',
    communications: 'writing',
    chief_of_staff: 'personalops',
};
function routeRequest(rawRequest) {
    var lower = rawRequest.toLowerCase();
    var scores = [];
    for (var _i = 0, _a = Object.entries(DOMAIN_KEYWORDS); _i < _a.length; _i++) {
        var _b = _a[_i], domain = _b[0], keywords = _b[1];
        var score = 0;
        for (var _c = 0, keywords_1 = keywords; _c < keywords_1.length; _c++) {
            var kw = keywords_1[_c];
            if (lower.includes(kw))
                score += kw.split(' ').length; // multi-word keywords score higher
        }
        if (score > 0)
            scores.push({ domain: domain, score: score });
    }
    scores.sort(function (a, b) { return b.score - a.score; });
    if (scores.length === 0) {
        return { domain: 'general', confidence: 0.3, alternates: [], reason: 'No keyword matches — defaulting to general' };
    }
    var best = scores[0];
    var maxScore = best.score;
    var confidence = Math.min(1, maxScore / 3);
    var canonicalDomain = DOMAIN_ALIASES[best.domain] || best.domain;
    return {
        domain: canonicalDomain,
        confidence: confidence,
        alternates: scores.slice(1, 4).map(function (s) { return ({
            domain: DOMAIN_ALIASES[s.domain] || s.domain,
            confidence: Math.min(1, s.score / 3),
        }); }),
        reason: "Matched ".concat(maxScore, " keywords for ").concat(canonicalDomain),
    };
}
/** Resolve domain aliases (e.g., 'career' → 'careeregine') */
function resolveAlias(domain) {
    return DOMAIN_ALIASES[domain] || domain;
}
module.exports = { routeRequest: routeRequest, resolveAlias: resolveAlias };
