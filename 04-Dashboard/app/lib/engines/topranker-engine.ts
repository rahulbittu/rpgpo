// GPO TopRanker Engine — Domain-specific structured output engine

const crypto = require('crypto') as typeof import('crypto');

export const key = 'topranker';
export const name = 'TopRanker Engine';

export function getTemplates(): Array<{ id: string; name: string; input: Record<string, string> }> {
  return [
    { id: 'topranker.weekly-leaderboard', name: 'Weekly Leaderboard', input: { category: 'string', city: 'string', windowDays: 'number', topN: 'number' } },
    { id: 'topranker.scorecards', name: 'Business Scorecards', input: { businessIds: 'string[]', city: 'string', category: 'string' } },
    { id: 'topranker.review-aggregation', name: 'Review Aggregation', input: { businessId: 'string', period: 'object' } },
  ];
}

export function buildPrompt(templateId: string, input: Record<string, any>): { system: string; user: string; schemaId: string } {
  const { CONTRACT_IDS } = require('../contracts/topranker.contracts');

  const domainContext = `You are the TopRanker AI engine. TopRanker is a community-ranked local business leaderboard app.
Stack: Expo/React Native + Express + PostgreSQL.
Ranking algorithms: Bayesian average, Wilson score interval.
Business verification flow: unverified → pending → verified.

GOVERNANCE RULES:
- No scraping external PII
- Rely on provided inputs and allowed datasets
- Return strictly JSON per the provided schema
- Cite rationale per entry
- Never invent reviews
- Record uncertainties in rationale
- Maximum 5 sample snippets per aggregation`;

  switch (templateId) {
    case 'topranker.weekly-leaderboard':
      return {
        system: domainContext,
        user: `Generate a weekly leaderboard for the "${input.category}" category in ${input.city}. Window: ${input.windowDays || 7} days. Top ${input.topN || 25} businesses. Return JSON with entries array and evidence array.`,
        schemaId: CONTRACT_IDS.LEADERBOARD,
      };
    case 'topranker.scorecards':
      return {
        system: domainContext,
        user: `Generate business scorecards for businesses ${JSON.stringify(input.businessIds)} in ${input.city}, category: ${input.category}. Return JSON with scorecards array and evidence array.`,
        schemaId: CONTRACT_IDS.SCORECARD,
      };
    case 'topranker.review-aggregation':
      return {
        system: domainContext,
        user: `Aggregate reviews for business ${input.businessId} from ${input.period?.from || 'last 30 days'} to ${input.period?.to || 'now'}. Return JSON with aggregations array and evidence array.`,
        schemaId: CONTRACT_IDS.REVIEW_AGGREGATION,
      };
    default:
      return { system: domainContext, user: `Execute TopRanker task: ${JSON.stringify(input)}`, schemaId: CONTRACT_IDS.LEADERBOARD };
  }
}

export function merge(existing: any[], incoming: any[]): any[] {
  // De-dup by businessId; on tie, prefer higher confidence then alphabetic name
  const merged = new Map<string, any>();
  for (const item of [...existing, ...incoming]) {
    const key = item.businessId;
    if (!key) continue;
    if (!merged.has(key) ||
        item.confidence > merged.get(key).confidence ||
        (item.confidence === merged.get(key).confidence && item.name < merged.get(key).name)) {
      merged.set(key, item);
    }
  }
  return Array.from(merged.values()).sort((a, b) => (a.rank || 0) - (b.rank || 0));
}

export function computeDeliverableId(templateId: string, input: Record<string, any>): string {
  const canonical = JSON.stringify({ engine: 'topranker', template: templateId, ...input }, Object.keys(input).sort());
  const hash = crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 12);
  return `dlv_topranker_${templateId.split('.').pop()}_${hash}`;
}

module.exports = { key, name, getTemplates, buildPrompt, merge, computeDeliverableId };
