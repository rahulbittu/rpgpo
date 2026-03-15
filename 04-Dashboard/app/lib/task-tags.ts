// GPO Task Tags — Auto-tag tasks for categorization and search
export function autoTag(rawRequest: string, domain: string): string[] {
  const tags: string[] = [domain];
  const lower = rawRequest.toLowerCase();
  const tagMap: Record<string, string[]> = {
    research: ['research', 'study', 'investigate', 'explore'], analysis: ['analyze', 'compare', 'evaluate', 'assess'],
    news: ['news', 'headline', 'trending', 'current'], career: ['job', 'career', 'salary', 'hiring'],
    income: ['income', 'passive', 'revenue', 'profit'], code: ['code', 'implement', 'build', 'fix'],
    strategy: ['strategy', 'plan', 'roadmap', 'priority'], ai: ['ai', 'machine learning', 'llm', 'gpt'],
  };
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(kw => lower.includes(kw))) tags.push(tag);
  }
  return [...new Set(tags)].slice(0, 8);
}
module.exports = { autoTag };
