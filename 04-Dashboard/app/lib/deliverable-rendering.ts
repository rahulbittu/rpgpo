// GPO Deliverable Rendering — Transform StructuredDeliverable to RenderModel

import type { StructuredDeliverable, RenderModel, RendererKey, ContractEnforcementResult } from './types';

/** Map engine ID to renderer key */
const ENGINE_RENDERER_MAP: Record<string, RendererKey> = {
  newsroom: 'newsroom_list', shopping: 'shopping_table', startup: 'code_diff',
  legal: 'document_sections', screenwriting: 'creative_view', music: 'creative_view',
  calendar: 'schedule_timeline', chief_of_staff: 'action_plan_steps',
  career: 'document_sections', health: 'action_plan_steps', finance: 'analysis_brief',
  travel: 'action_plan_steps', research: 'recommendation_list',
  home: 'recommendation_list', communications: 'document_sections',
};

/** Get renderer key for an engine */
export function getRendererKey(engineId: string): RendererKey {
  return ENGINE_RENDERER_MAP[engineId] || 'document_sections';
}

/** Check if a deliverable is renderable */
export function isRenderable(engineId: string, d: StructuredDeliverable): boolean {
  const obj = d as unknown as Record<string, unknown>;
  switch (d.kind) {
    case 'newsroom': return Array.isArray(obj.rankedItems) && (obj.rankedItems as unknown[]).length > 0;
    case 'shopping': return Array.isArray(obj.items) && (obj.items as unknown[]).length > 0;
    case 'code_change': return Array.isArray(obj.diffs) && (obj.diffs as unknown[]).length > 0;
    case 'document': return Array.isArray(obj.sections) && (obj.sections as unknown[]).length > 0;
    case 'recommendation': return Array.isArray(obj.recommendations) && (obj.recommendations as unknown[]).length > 0;
    case 'schedule': return Array.isArray(obj.events) && (obj.events as unknown[]).length > 0;
    case 'creative_draft': return Array.isArray(obj.artifacts) && (obj.artifacts as unknown[]).length > 0;
    case 'analysis': return Array.isArray(obj.findings) && (obj.findings as unknown[]).length > 0;
    case 'action_plan': return Array.isArray(obj.steps) && (obj.steps as unknown[]).length > 0;
    default: return false;
  }
}

/** Transform StructuredDeliverable to RenderModel */
export function toRenderModel(engineId: string, d: StructuredDeliverable, enforcement?: ContractEnforcementResult): RenderModel {
  const key = getRendererKey(engineId);
  const badges: string[] = [];

  if (enforcement?.missingFields?.length) {
    for (const f of enforcement.missingFields) badges.push(`Missing: ${f}`);
  }
  if (!isRenderable(engineId, d)) badges.push('Incomplete deliverable');

  const model: RenderModel = { rendererKey: key, title: d.title || `${engineId} result`, badges: badges.length > 0 ? badges : undefined };

  switch (d.kind) {
    case 'newsroom':
      model.items = d.rankedItems.map(item => ({ rank: item.rank, headline: item.headline, summary: item.summary, source_name: item.source.name, source_url: item.source.url, tags: item.tags }));
      break;
    case 'shopping':
      model.table = { columns: ['name', 'price', 'pros', 'cons', ...d.comparisonKeys], rows: d.items.map(item => ({ name: item.name, price: `${item.price.currency} ${item.price.amount}`, pros: item.pros.join(', '), cons: item.cons.join(', '), url: item.url, ...item.specs })) };
      break;
    case 'code_change':
      model.diffs = d.diffs.map(diff => ({ filePath: diff.filePath, changeType: diff.changeType, hunks: diff.hunks }));
      break;
    case 'document':
      model.sections = d.sections.map(s => ({ heading: s.heading, content: s.content }));
      break;
    case 'recommendation':
      model.items = d.recommendations.map(r => ({ label: r.label, rationale: r.rationale, confidence: r.confidence }));
      break;
    case 'schedule':
      model.timeline = d.events.map(e => ({ start: e.start, end: e.end, title: e.title, location: e.location }));
      break;
    case 'creative_draft':
      model.sections = d.artifacts.map(a => ({ heading: a.type, content: a.content }));
      break;
    case 'analysis':
      model.items = d.findings.map(f => ({ label: f.label, detail: f.detail }));
      break;
    case 'action_plan':
      model.steps = d.steps.map(s => ({ id: s.id, description: s.description, status: s.status }));
      break;
  }

  return model;
}

module.exports = { getRendererKey, isRenderable, toRenderModel };
