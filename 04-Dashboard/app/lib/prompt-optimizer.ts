// GPO Prompt Optimizer — Analyze and improve prompts based on historical success data

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const PATTERNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'prompt-patterns.json');

export interface PromptPattern {
  id: string;
  engineId: string;
  providerId: string;
  patternHash: string;
  templateSnippet: string;
  usageCount: number;
  successRate: number;
  avgQuality: number;
  avgLatencyMs: number;
  lastUsed: number;
  characteristics: {
    hasExplicitSchema: boolean;
    hasExamples: boolean;
    hasConstraints: boolean;
    hasContext: boolean;
    wordCount: number;
    structuredOutput: boolean;
  };
}

function readPatterns(): PromptPattern[] {
  try { if (fs.existsSync(PATTERNS_FILE)) return JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf-8')); } catch { /* */ }
  return [];
}

function writePatterns(patterns: PromptPattern[]): void {
  if (patterns.length > 200) patterns = patterns.slice(-200);
  const dir = path.dirname(PATTERNS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
}

function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt.toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12);
}

/**
 * Record a prompt execution result for pattern learning.
 */
export function recordPromptResult(engineId: string, providerId: string, prompt: string, success: boolean, quality: number, latencyMs: number): void {
  const patterns = readPatterns();
  const hash = hashPrompt(prompt);
  const existing = patterns.find(p => p.patternHash === hash && p.engineId === engineId);

  if (existing) {
    const alpha = 0.2;
    existing.usageCount++;
    existing.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * existing.successRate;
    existing.avgQuality = alpha * quality + (1 - alpha) * existing.avgQuality;
    existing.avgLatencyMs = alpha * latencyMs + (1 - alpha) * existing.avgLatencyMs;
    existing.lastUsed = Date.now();
  } else {
    patterns.push({
      id: 'pp_' + crypto.randomBytes(3).toString('hex'),
      engineId, providerId, patternHash: hash,
      templateSnippet: prompt.slice(0, 200),
      usageCount: 1,
      successRate: success ? 1 : 0,
      avgQuality: quality,
      avgLatencyMs: latencyMs,
      lastUsed: Date.now(),
      characteristics: analyzePrompt(prompt),
    });
  }

  writePatterns(patterns);
}

/**
 * Get optimization suggestions for a new prompt.
 */
export function getOptimizationSuggestions(engineId: string, prompt: string): string[] {
  const suggestions: string[] = [];
  const chars = analyzePrompt(prompt);
  const patterns = readPatterns().filter(p => p.engineId === engineId && p.successRate > 0.7);

  // Check what high-quality patterns have that this prompt doesn't
  const bestPatterns = patterns.sort((a, b) => b.avgQuality - a.avgQuality).slice(0, 5);
  const bestChars = bestPatterns.reduce((acc, p) => {
    for (const [k, v] of Object.entries(p.characteristics)) {
      if (v === true) (acc as any)[k] = ((acc as any)[k] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (!chars.hasExplicitSchema && (bestChars.hasExplicitSchema || 0) >= 2) {
    suggestions.push('Add explicit output format/schema (e.g., "Return JSON with fields: ...")');
  }
  if (!chars.hasExamples && (bestChars.hasExamples || 0) >= 2) {
    suggestions.push('Include an example of expected output for better results');
  }
  if (!chars.hasConstraints && (bestChars.hasConstraints || 0) >= 2) {
    suggestions.push('Add constraints (e.g., "Include sources", "Maximum 10 items")');
  }
  if (!chars.hasContext && (bestChars.hasContext || 0) >= 2) {
    suggestions.push('Include relevant context about your goals or preferences');
  }
  if (chars.wordCount < 20) {
    suggestions.push('Prompt is very short — add more detail for better results');
  }
  if (chars.wordCount > 500) {
    suggestions.push('Prompt is very long — consider focusing on the core request');
  }

  return suggestions;
}

/**
 * Get best-performing prompt patterns for an engine.
 */
export function getBestPatterns(engineId: string, limit?: number): PromptPattern[] {
  return readPatterns()
    .filter(p => p.engineId === engineId && p.usageCount >= 2)
    .sort((a, b) => b.avgQuality - a.avgQuality)
    .slice(0, limit || 10);
}

export function getAllPatterns(): PromptPattern[] {
  return readPatterns().sort((a, b) => b.lastUsed - a.lastUsed);
}

function analyzePrompt(prompt: string): PromptPattern['characteristics'] {
  const lower = prompt.toLowerCase();
  return {
    hasExplicitSchema: lower.includes('json') || lower.includes('format') || lower.includes('schema') || lower.includes('fields'),
    hasExamples: lower.includes('example') || lower.includes('e.g.') || lower.includes('such as') || lower.includes('for instance'),
    hasConstraints: lower.includes('maximum') || lower.includes('minimum') || lower.includes('must') || lower.includes('include') || lower.includes('do not'),
    hasContext: lower.includes('context') || lower.includes('background') || lower.includes('i am') || lower.includes('my goal'),
    wordCount: prompt.split(/\s+/).length,
    structuredOutput: lower.includes('json') || lower.includes('table') || lower.includes('list') || lower.includes('bullet'),
  };
}

module.exports = { recordPromptResult, getOptimizationSuggestions, getBestPatterns, getAllPatterns };
