// GPO Domain Router — Auto-detect the best engine for a task request

export interface RoutingResult {
  domain: string;
  confidence: number;
  alternates: Array<{ domain: string; confidence: number }>;
  reason: string;
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  newsroom: ['news', 'headline', 'trending', 'latest', 'current events', 'journalism', 'breaking'],
  wealthresearch: ['passive income', 'investment', 'wealth', 'money', 'side hustle', 'revenue', 'profit', 'saas'],
  career: ['job', 'career', 'salary', 'hiring', 'resume', 'interview', 'promotion', 'data engineer'],
  careeregine: ['job market', 'skill gap', 'professional development', 'networking'],
  topranker: ['topranker', 'leaderboard', 'ranking', 'business listing', 'community rank'],
  research: ['research', 'analyze', 'study', 'investigate', 'evaluate', 'compare', 'assessment'],
  chief_of_staff: ['plan', 'prioritize', 'strategy', 'roadmap', 'decision', 'brief', 'weekly'],
  finance: ['budget', 'financial', 'cost analysis', 'roi', 'pricing'],
  communications: ['email', 'write', 'draft', 'message', 'letter', 'proposal'],
  startup: ['code', 'implement', 'build', 'fix bug', 'feature', 'deploy', 'api'],
  shopping: ['buy', 'purchase', 'compare products', 'review', 'recommendation'],
  calendar: ['schedule', 'meeting', 'calendar', 'appointment', 'time block'],
  health: ['fitness', 'workout', 'diet', 'health', 'wellness'],
  travel: ['travel', 'trip', 'flight', 'hotel', 'itinerary'],
  screenwriting: ['screenplay', 'script', 'dialogue', 'scene', 'story'],
  music: ['music', 'song', 'composition', 'lyrics', 'melody'],
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

  return {
    domain: best.domain,
    confidence,
    alternates: scores.slice(1, 4).map(s => ({ domain: s.domain, confidence: Math.min(1, s.score / 3) })),
    reason: `Matched ${maxScore} keywords for ${best.domain}`,
  };
}

module.exports = { routeRequest };
