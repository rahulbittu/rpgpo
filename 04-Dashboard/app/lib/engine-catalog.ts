// GPO Engine Catalog — 15 core engines with output contracts and deliverable definitions

import type { EngineDefinition, OutputContract, EngineCatalogSummary } from './types';

function uid(): string { return 'ec_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** The 15 core GPO engines */
export function getEngines(): EngineDefinition[] {
  return [
    { engine_id: 'newsroom', name: 'Newsroom', description: 'News gathering, ranking, and briefing', capabilities: ['web_search', 'summarization', 'ranking'], default_output: 'ranked_list', approval_model: 'auto', icon: '📰' },
    { engine_id: 'shopping', name: 'Shopping', description: 'Product research, comparison, and purchase path', capabilities: ['web_search', 'comparison', 'pricing'], default_output: 'ranked_list', approval_model: 'explicit_approval', icon: '🛒' },
    { engine_id: 'startup', name: 'Startup', description: 'Code implementation, architecture, and deployment', capabilities: ['code_generation', 'testing', 'deployment'], default_output: 'code_change', approval_model: 'explicit_approval', icon: '🚀' },
    { engine_id: 'legal', name: 'Legal / Document Intelligence', description: 'Document analysis, fact extraction, and drafting', capabilities: ['document_analysis', 'drafting', 'evidence_mapping'], default_output: 'document', approval_model: 'operator_review', icon: '⚖️' },
    { engine_id: 'screenwriting', name: 'Screenwriting / Filmmaking', description: 'Story development, beat sheets, and screenplay drafting', capabilities: ['creative_writing', 'story_structure', 'formatting'], default_output: 'creative_draft', approval_model: 'operator_review', icon: '🎬' },
    { engine_id: 'music', name: 'Music', description: 'Composition, lyrics, arrangement, and production guidance', capabilities: ['creative_writing', 'music_theory', 'production'], default_output: 'creative_draft', approval_model: 'operator_review', icon: '🎵' },
    { engine_id: 'calendar', name: 'Calendar / Scheduling', description: 'Schedule optimization, availability, and calendar management', capabilities: ['scheduling', 'optimization', 'calendar_integration'], default_output: 'schedule', approval_model: 'explicit_approval', icon: '📅' },
    { engine_id: 'chief_of_staff', name: 'Personal Chief of Staff', description: 'Daily operations, briefings, task prioritization', capabilities: ['prioritization', 'briefing', 'operations'], default_output: 'action_plan', approval_model: 'auto', icon: '👔' },
    { engine_id: 'career', name: 'Career / Resume / Job', description: 'Resume crafting, job search, interview prep', capabilities: ['document_generation', 'research', 'coaching'], default_output: 'document', approval_model: 'operator_review', icon: '💼' },
    { engine_id: 'health', name: 'Health / Habit / Fitness', description: 'Health tracking, habit building, fitness planning', capabilities: ['planning', 'tracking', 'recommendation'], default_output: 'action_plan', approval_model: 'auto', icon: '🏃' },
    { engine_id: 'finance', name: 'Finance / Wealth', description: 'Financial analysis, investment research, budgeting', capabilities: ['analysis', 'research', 'modeling'], default_output: 'analysis', approval_model: 'operator_review', icon: '💰' },
    { engine_id: 'travel', name: 'Travel', description: 'Trip planning, itinerary building, booking research', capabilities: ['research', 'planning', 'comparison'], default_output: 'action_plan', approval_model: 'explicit_approval', icon: '✈️' },
    { engine_id: 'research', name: 'Research / Intelligence', description: 'Deep research, competitive analysis, intelligence gathering', capabilities: ['web_search', 'analysis', 'synthesis'], default_output: 'recommendation', approval_model: 'auto', icon: '🔬' },
    { engine_id: 'home', name: 'Home / Interior / Lifestyle', description: 'Home management, interior design, lifestyle optimization', capabilities: ['planning', 'recommendation', 'comparison'], default_output: 'recommendation', approval_model: 'operator_review', icon: '🏠' },
    { engine_id: 'communications', name: 'Communications / Writing', description: 'Email drafting, professional writing, tone variants', capabilities: ['writing', 'editing', 'tone_analysis'], default_output: 'document', approval_model: 'operator_review', icon: '✉️' },
  ];
}

/** Get engine by ID */
export function getEngine(engineId: string): EngineDefinition | null {
  return getEngines().find(e => e.engine_id === engineId) || null;
}

/** Get catalog summary */
export function getCatalogSummary(): EngineCatalogSummary {
  const engines = getEngines();
  let acceptanceCases = 0;
  try {
    const mas = require('./mission-acceptance-suite') as { getCases(): Array<unknown> };
    acceptanceCases = mas.getCases().length;
  } catch { /* */ }

  return {
    engines, total: engines.length,
    with_contracts: engines.length, // all engines have contracts
    acceptance_cases: acceptanceCases,
    created_at: new Date().toISOString(),
  };
}

module.exports = { getEngines, getEngine, getCatalogSummary };
