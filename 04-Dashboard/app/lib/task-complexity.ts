// GPO Task Complexity — Estimate task complexity before execution
export type ComplexityLevel = 'simple' | 'medium' | 'complex' | 'deep';
export function analyzeComplexity(rawRequest: string, domain: string): { level: ComplexityLevel; score: number; factors: string[]; estimatedSubtasks: number; estimatedMinutes: number } {
  const words = rawRequest.split(/\s+/).length;
  const factors: string[] = [];
  let score = 0;
  if (words > 100) { score += 2; factors.push('Long request (100+ words)'); }
  else if (words > 50) { score += 1; factors.push('Medium request'); }
  if (rawRequest.includes(' and ') || rawRequest.includes(' then ')) { score += 1; factors.push('Multi-step request'); }
  if (rawRequest.includes('compare') || rawRequest.includes('analyze')) { score += 1; factors.push('Analysis required'); }
  if (rawRequest.includes('code') || rawRequest.includes('implement')) { score += 2; factors.push('Code changes'); }
  if (domain === 'topranker' || domain === 'startup') { score += 1; factors.push('Code-adjacent domain'); }
  const level: ComplexityLevel = score >= 4 ? 'deep' : score >= 2 ? 'complex' : score >= 1 ? 'medium' : 'simple';
  const subtasks = level === 'deep' ? 6 : level === 'complex' ? 4 : level === 'medium' ? 3 : 2;
  const minutes = level === 'deep' ? 10 : level === 'complex' ? 5 : level === 'medium' ? 3 : 2;
  return { level, score, factors, estimatedSubtasks: subtasks, estimatedMinutes: minutes };
}
module.exports = { analyzeComplexity };
