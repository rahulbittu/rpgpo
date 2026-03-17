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
const ENGINE_KEYWORDS = {
    news: ['news', 'headline', 'trending', 'current events', 'journalism', 'breaking', 'today\'s news'],
    finance: ['passive income', 'investment', 'wealth', 'money', 'side hustle', 'revenue', 'profit', 'side project', 'income ideas', 'income stream', 'financial plan', 'tax', 'retirement', 'insurance', 'savings', 'portfolio', 'roth ira', '401k', 'estate planning', 'angel investing', 'angel deal', 'capital gains', 'dividend', 'bonds', 'reit', 'hsa', 'net worth', 'budgeting', 'debt payoff', 'wealth building', 'financial independence', 'social security', 'medicare', 'pension', 'annuity', 'minimum distribution', 'rmd', 'fiduciary'],
    career: ['career', 'salary', 'hiring', 'resume', 'interview', 'promotion', 'data engineer', 'job market', 'skill gap', 'professional development', 'job search', 'compensation', 'engineering manager', 'staff engineer', 'principal engineer', 'performance review', 'one-on-one', 'skip-level', 'managing up', 'personal brand', 'linkedin', 'career pivot', 'negotiation', 'imposter syndrome', 'mentoring', 'onboarding new', 'hiring pipeline', 'tech lead', 'engineering ladder', 'technical leadership', 'sprint demo', 'stakeholder trust', 'cross-functional influence', 'retrospective', 'team health', 'executive presence', 'executive communication', 'delegation framework', 'building influence'],
    writing: ['write a guide', 'write a complete', 'draft a', 'memo', 'prd', 'spec', 'sop', 'runbook', 'proposal', 'letter', 'rewrite', 'executive summary', 'summarize this', 'technical writing', 'documentation culture', 'documentation debt', 'rfc', 'design document', 'concept for a', 'treatment for a', 'series bible', 'character bible', 'world-building', 'outline for a', 'pitch deck', 'concept for an'],
    research: ['research the best', 'analyze', 'investigate', 'evaluate', 'assessment', 'deep-dive', 'deep dive', 'market analysis', 'competitive analysis', 'compare', 'latest evidence', 'benchmark', 'best home', 'best budget', 'best portable', 'best smart', 'best wireless', 'best ergonomic', 'best indoor', 'best outdoor', 'best noise', 'under $', 'under five hundred', 'under three hundred', 'under four hundred', 'under two hundred', 'under one hundred', 'what are the best', 'recommend', 'top 10', 'top 5', 'top 3', 'where to find', 'find me', 'suggest', 'best places', 'best restaurants', 'best coffee', 'best bars', 'best tools', 'best apps', 'best software', 'pros and cons', 'which is better', 'alternatives to', 'best food', 'best pizza', 'best tacos', 'best sushi', 'best brunch', 'best bakery', 'best dessert', 'best ice cream', 'best steak', 'best seafood', 'best vegetarian', 'best vegan', 'best biryani', 'best haleem', 'best dosa', 'best chai', 'best street food', 'best fine dining', 'best cheap eats', 'best hidden gem', 'best rated', 'highest rated', 'most popular'],
    learning: ['teach me', 'explain how', 'explain the', 'tutor', 'study plan', 'quiz me', 'course', 'curriculum', 'how does', 'how do', 'works under the hood', 'works end-to-end', 'works from', 'internals of', 'works in modern', 'works compared to', 'how modern', 'how the linux', 'how container', 'how database', 'how compiler', 'how garbage', 'how virtual', 'how async', 'how tcp', 'how http', 'how dns', 'how tls', 'how web'],
    shopping: ['buy', 'purchase', 'compare products', 'shopping', 'best price', 'product comparison'],
    travel: ['travel', 'trip', 'flight', 'hotel', 'itinerary', 'relocation', 'moving to', 'tour through', 'road trip', 'tour of', 'safari', 'backpacking', 'immersion trip', 'cultural tour', 'food tour', 'wine tour', 'history tour', 'adventure tour', 'visit', 'vacation', 'holiday', 'places to see', 'things to do in', 'weekend getaway', 'day trip'],
    health: ['fitness', 'workout', 'diet', 'health protocol', 'wellness', 'exercise', 'nutrition', 'mobility', 'stretching', 'flexibility', 'injury prevention', 'recovery protocol', 'sleep optimization', 'sleep protocol', 'posture', 'rehabilitation', 'prehab', 'breathing exercise', 'stress management', 'eye strain', 'dental care', 'skincare', 'shoulder mobility', 'knee health', 'back health', 'ankle stability', 'grip strength', 'core strength', 'marathon training', 'strength training', 'training program', 'training plan', 'hip flexor', 'neck tension', 'rotator cuff', 'plantar fascia', 'wrist mobility', 'thoracic spine', 'migraine', 'jaw tension', 'meal plan', 'protein', 'supplements', 'weight loss', 'muscle building', 'calorie', 'macros', 'hydration'],
    ops: ['plan my week', 'schedule', 'time block', 'calendar', 'routine', 'habit', 'prioritize', 'morning routine', 'meal prep', 'home organization', 'productivity', 'deep work', 'energy management', 'weekly review', 'annual planning', 'goal setting', 'inbox zero', 'digital minimalism', 'personal accountability'],
    code: ['architecture', 'microservices', 'kubernetes', 'ci/cd', 'pipeline', 'monitoring', 'infrastructure', 'terraform', 'docker', 'serverless', 'scaling', 'deployment', 'api gateway', 'load balancing', 'caching strategy', 'database migration', 'feature flag', 'incident response', 'saas', 'platform engineering'],
    screenwriting: ['screenplay', 'script', 'dialogue', 'scene', 'series concept', 'pilot episode', 'character study', 'narrative game', 'video game concept', 'board game', 'tabletop rpg', 'escape room', 'podcast series', 'documentary', 'animated series', 'comedy series', 'thriller', 'mystery novel', 'graphic novel', 'fiction anthology'],
    music: ['music', 'song', 'composition', 'lyrics', 'melody', 'album', 'audio production', 'musical'],
};
// Canonical → legacy mapping (for backward compat with stored tasks and types.ts)
const CANONICAL_TO_LEGACY = {
    career: 'careeregine',
    finance: 'wealthresearch',
    ops: 'personalops',
    startup: 'topranker',
    news: 'newsroom',
    film: 'founder2founder',
    // 'code' has no legacy equivalent — it's a new canonical ID
};
// Legacy → canonical (for reading old data)
const LEGACY_TO_CANONICAL = {
    careeregine: 'career',
    wealthresearch: 'finance',
    personalops: 'ops',
    topranker: 'startup',
    newsroom: 'news',
    founder2founder: 'film',
};
function routeRequest(rawRequest) {
    const lower = rawRequest.toLowerCase();
    const scores = [];
    for (const [engine, keywords] of Object.entries(ENGINE_KEYWORDS)) {
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw))
                score += kw.split(' ').length;
        }
        if (score > 0)
            scores.push({ domain: engine, score });
    }
    scores.sort((a, b) => b.score - a.score);
    if (scores.length === 0) {
        return { domain: 'general', legacyDomain: 'general', confidence: 0.3, alternates: [], reason: 'No keyword matches — defaulting to general' };
    }
    const best = scores[0];
    const confidence = Math.min(1, best.score / 3);
    const legacyDomain = CANONICAL_TO_LEGACY[best.domain] || best.domain;
    return {
        domain: best.domain,
        legacyDomain,
        confidence,
        alternates: scores.slice(1, 4).map(s => ({
            domain: s.domain,
            confidence: Math.min(1, s.score / 3),
        })),
        reason: `Matched ${best.score} keywords for ${best.domain}`,
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
    const legacy = CANONICAL_TO_LEGACY[domain];
    if (legacy)
        return legacy;
    // Common form aliases
    const FORM_ALIASES = {
        career: 'careeregine',
        finance: 'wealthresearch',
        home: 'personalops',
        communications: 'writing',
        chief_of_staff: 'personalops',
    };
    return FORM_ALIASES[domain] || domain;
}
module.exports = { routeRequest, resolveAlias, toCanonical, toLegacy };
