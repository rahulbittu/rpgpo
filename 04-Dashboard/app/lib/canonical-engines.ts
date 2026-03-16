/**
 * GPO Canonical Engine Registry
 *
 * Single source of truth for the 15-engine model.
 * All new code should use canonical IDs.
 * Legacy IDs are mapped through toLegacy/toCanonical adapters.
 */

export interface CanonicalEngine {
  id: string;
  displayName: string;
  legacyIds: string[];
  description: string;
}

const ENGINES: CanonicalEngine[] = [
  { id: 'code', displayName: 'Code & Product Engineering', legacyIds: ['startup'], description: 'Architecture, deployment, infrastructure, code implementation' },
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
const _canonicalToLegacy: Record<string, string> = {};
const _legacyToCanonical: Record<string, string> = {};
const _displayNames: Record<string, string> = {};

for (const e of ENGINES) {
  _displayNames[e.id] = e.displayName;
  for (const legacy of e.legacyIds) {
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
function toCanonical(engineId: string): string {
  if (!engineId) return 'general';
  return _legacyToCanonical[engineId] || engineId;
}

/**
 * Convert a canonical ID to its legacy form (for backward compatibility).
 * Returns the input if no legacy mapping exists.
 */
function toLegacy(canonicalId: string): string {
  return _canonicalToLegacy[canonicalId] || canonicalId;
}

/**
 * Get the display name for any engine ID (legacy or canonical).
 */
function getDisplayName(engineId: string): string {
  return _displayNames[engineId] || _displayNames[toCanonical(engineId)] || engineId;
}

/**
 * Check if an ID is a legacy ID that should be migrated.
 */
function isLegacyId(engineId: string): boolean {
  return engineId in _legacyToCanonical;
}

/**
 * Get all canonical engines.
 */
function getAllEngines(): CanonicalEngine[] {
  return [...ENGINES];
}

module.exports = { toCanonical, toLegacy, getDisplayName, isLegacyId, getAllEngines, ENGINES };
