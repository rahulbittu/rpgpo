// GPO Domain Router — Auto-detect the best engine for a task request

export interface RoutingResult {
  domain: string;
  confidence: number;
  alternates: Array<{ domain: string; confidence: number }>;
  reason: string;
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  newsroom: ['news', 'headline', 'trending', 'latest', 'current events', 'journalism', 'breaking', 'today\'s'],
  wealthresearch: ['passive income', 'investment', 'wealth', 'money', 'side hustle', 'revenue', 'profit', 'saas', 'side project', 'income ideas', 'income stream'],
  careeregine: ['job', 'career', 'salary', 'hiring', 'resume', 'interview', 'promotion', 'data engineer', 'job market', 'skill gap', 'professional development', 'networking', 'job search', 'compensation', 'job opening'],
  topranker: ['topranker', 'leaderboard', 'ranking', 'business listing', 'community rank'],
  writing: ['email', 'write', 'draft', 'memo', 'prd', 'spec', 'sop', 'runbook', 'document', 'proposal', 'letter', 'rewrite', 'executive summary', 'summarize this'],
  research: ['research', 'analyze', 'study', 'investigate', 'evaluate', 'assessment', 'deep-dive', 'deep dive', 'market analysis', 'competitive analysis'],
  learning: ['teach me', 'explain', 'tutor', 'learn', 'study plan', 'quiz me', 'course', 'curriculum', 'master it'],
  shopping: ['buy', 'purchase', 'compare products', 'shopping', 'best price', 'recommendation'],
  travel: ['travel', 'trip', 'flight', 'hotel', 'itinerary', 'relocation', 'moving to'],
  health: ['fitness', 'workout', 'diet', 'health', 'wellness', 'exercise', 'nutrition'],
  personalops: ['plan my week', 'schedule', 'time block', 'calendar', 'routine', 'habit', 'prioritize'],
  startup: ['code', 'implement', 'build', 'fix bug', 'feature', 'deploy', 'api'],
  screenwriting: ['screenplay', 'script', 'dialogue', 'scene', 'story'],
  music: ['music', 'song', 'composition', 'lyrics', 'melody'],
};

// Map intake form values to canonical domain names
const DOMAIN_ALIASES: Record<string, string> = {
  career: 'careeregine',
  finance: 'wealthresearch',
  home: 'personalops',
  communications: 'writing',
  chief_of_staff: 'personalops',
};

export function routeRequest(rawRequest: string): RoutingResult {
  const lower = rawRequest.toLowerCase();
  const scores: Array<{ domain: string; score: number }> = [];

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length; // multi-word keywords score higher
    }
    if (score > 0) scores.push({ domain, score });
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    return { domain: 'general', confidence: 0.3, alternates: [], reason: 'No keyword matches — defaulting to general' };
  }

  const best = scores[0];
  const maxScore = best.score;
  const confidence = Math.min(1, maxScore / 3);

  const canonicalDomain = DOMAIN_ALIASES[best.domain] || best.domain;
  return {
    domain: canonicalDomain,
    confidence,
    alternates: scores.slice(1, 4).map(s => ({
      domain: DOMAIN_ALIASES[s.domain] || s.domain,
      confidence: Math.min(1, s.score / 3),
    })),
    reason: `Matched ${maxScore} keywords for ${canonicalDomain}`,
  };
}

/** Resolve domain aliases (e.g., 'career' → 'careeregine') */
export function resolveAlias(domain: string): string {
  return DOMAIN_ALIASES[domain] || domain;
}

module.exports = { routeRequest, resolveAlias };
