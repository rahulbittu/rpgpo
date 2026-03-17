"use strict";
/**
 * GPO Canonical Engine Registry
 *
 * Single source of truth for the 15-engine model.
 * All new code should use canonical IDs.
 * Legacy IDs are mapped through toLegacy/toCanonical adapters.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var ENGINES = [
    { id: 'code', displayName: 'Code & Product Engineering', legacyIds: [], description: 'Architecture, deployment, infrastructure, code implementation' },
    { id: 'writing', displayName: 'Writing & Documentation', legacyIds: [], description: 'Guides, specs, SOPs, technical writing, creative writing' },
    { id: 'research', displayName: 'Research & Analysis', legacyIds: [], description: 'Product comparisons, market analysis, deep dives' },
    { id: 'learning', displayName: 'Learning & Tutoring', legacyIds: [], description: 'Technical explanations, how things work, tutorials' },
    { id: 'ops', displayName: 'Scheduling & Life Operations', legacyIds: ['personalops'], description: 'Routines, productivity, organization, planning' },
    { id: 'health', displayName: 'Health & Wellness Coach', legacyIds: [], description: 'Fitness, nutrition, mobility, sleep, mental health' },
    { id: 'shopping', displayName: 'Shopping & Buying Advisor', legacyIds: [], description: 'Product research, comparisons, buying decisions' },
    { id: 'travel', displayName: 'Travel & Relocation Planner', legacyIds: [], description: 'Trip planning, itineraries, cultural tours' },
    { id: 'finance', displayName: 'Personal Finance & Investing', legacyIds: ['wealthresearch'], description: 'Tax strategy, retirement, investing, insurance, estate planning' },
    { id: 'startup', displayName: 'Startup & Business Builder', legacyIds: ['topranker'], description: 'Business strategy, product development, entrepreneurship' },
    { id: 'career', displayName: 'Career & Job Search', legacyIds: ['careeregine'], description: 'Job search, negotiation, leadership, career growth' },
    { id: 'screenwriting', displayName: 'Screenwriting & Story Development', legacyIds: [], description: 'Creative concepts, series bibles, game design, narratives' },
    { id: 'film', displayName: 'Filmmaking & Video Production', legacyIds: ['founder2founder'], description: 'Documentary, video essay, film concepts' },
    { id: 'music', displayName: 'Music & Audio Creation', legacyIds: [], description: 'Musical concepts, audio production, composition' },
    { id: 'news', displayName: 'News & Intelligence', legacyIds: ['newsroom'], description: 'News analysis, current events, intelligence' },
];
// Build lookup maps
var _canonicalToLegacy = {};
var _legacyToCanonical = {};
var _displayNames = {};
for (var _i = 0, ENGINES_1 = ENGINES; _i < ENGINES_1.length; _i++) {
    var e = ENGINES_1[_i];
    _displayNames[e.id] = e.displayName;
    for (var _a = 0, _b = e.legacyIds; _a < _b.length; _a++) {
        var legacy = _b[_a];
        _legacyToCanonical[legacy] = e.id;
        _displayNames[legacy] = e.displayName;
    }
    // For canonical→legacy, use first legacy ID if exists, otherwise canonical is also legacy
    if (e.legacyIds.length > 0) {
        _canonicalToLegacy[e.id] = e.legacyIds[0];
    }
}
/**
 * Convert any engine ID (legacy or canonical) to its canonical form.
 * Returns the input if already canonical or unknown.
 */
function toCanonical(engineId) {
    if (!engineId)
        return 'general';
    return _legacyToCanonical[engineId] || engineId;
}
/**
 * Convert a canonical ID to its legacy form (for backward compatibility).
 * Returns the input if no legacy mapping exists.
 */
function toLegacy(canonicalId) {
    return _canonicalToLegacy[canonicalId] || canonicalId;
}
/**
 * Get the display name for any engine ID (legacy or canonical).
 */
function getDisplayName(engineId) {
    return _displayNames[engineId] || _displayNames[toCanonical(engineId)] || engineId;
}
/**
 * Check if an ID is a legacy ID that should be migrated.
 */
function isLegacyId(engineId) {
    return engineId in _legacyToCanonical;
}
/**
 * Get all canonical engines.
 */
function getAllEngines() {
    return __spreadArray([], ENGINES, true);
}
module.exports = { toCanonical: toCanonical, toLegacy: toLegacy, getDisplayName: getDisplayName, isLegacyId: isLegacyId, getAllEngines: getAllEngines, ENGINES: ENGINES };
