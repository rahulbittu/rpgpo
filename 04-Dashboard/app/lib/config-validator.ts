// GPO Config Validator — Validate all system configuration for correctness

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

export interface ConfigValidation {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAllConfigs(): { results: ConfigValidation[]; allValid: boolean } {
  const results: ConfigValidation[] = [];
  const configDir = path.resolve(__dirname, '..', '..', 'state', 'config');

  // Check ai-io.json
  results.push(validateJsonFile(path.join(configDir, 'ai-io.json'), ['enabled', 'maxParseAttempts', 'providerModes']));

  // Check structured-io.json
  results.push(validateJsonFile(path.join(configDir, 'structured-io.json'), ['metrics', 'providerLearning', 'evidence']));

  // Check feature-flags.json
  results.push(validateJsonFile(path.join(configDir, 'feature-flags.json'), ['autopilot']));

  // Check scheduler config
  results.push(validateJsonFile(path.join(__dirname, '..', '..', 'state', 'scheduler', 'config.json'), ['version', 'featureFlags', 'globalMaxConcurrent']));

  // Check operator profile
  const profileFile = path.resolve(__dirname, '..', '..', 'state', 'context', 'operator-profile.json');
  const profileResult = validateJsonFile(profileFile, ['name', 'recurring_priorities']);
  if (!profileResult.errors.length && fs.existsSync(profileFile)) {
    const profile = JSON.parse(fs.readFileSync(profileFile, 'utf-8'));
    if (!profile.professional_context) profileResult.warnings.push('Missing professional_context — context injection will be limited');
    if (!profile.output_preferences) profileResult.warnings.push('Missing output_preferences — AI output style not customized');
  }
  results.push(profileResult);

  // Check .env
  const envFile = path.resolve(__dirname, '..', '.env');
  const envResult: ConfigValidation = { file: '.env', valid: true, errors: [], warnings: [] };
  if (!fs.existsSync(envFile)) {
    envResult.valid = false;
    envResult.errors.push('.env file not found — API keys not configured');
  } else {
    const env = fs.readFileSync(envFile, 'utf-8');
    if (!env.includes('OPENAI_API_KEY') || env.includes('your_key_here')) envResult.warnings.push('OPENAI_API_KEY may not be configured');
    if (!env.includes('PERPLEXITY_API_KEY')) envResult.warnings.push('PERPLEXITY_API_KEY not set — web search unavailable');
    if (!env.includes('GEMINI_API_KEY')) envResult.warnings.push('GEMINI_API_KEY not set — strategy engine limited');
  }
  results.push(envResult);

  return { results, allValid: results.every(r => r.valid) };
}

function validateJsonFile(filePath: string, requiredKeys: string[]): ConfigValidation {
  const name = path.basename(filePath);
  const result: ConfigValidation = { file: name, valid: true, errors: [], warnings: [] };

  if (!fs.existsSync(filePath)) {
    result.warnings.push(`File not found: ${name} — using defaults`);
    return result;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const key of requiredKeys) {
      if (!(key in data)) result.warnings.push(`Missing key: ${key}`);
    }
  } catch (e) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${(e as Error).message?.slice(0, 80)}`);
  }

  return result;
}

module.exports = { validateAllConfigs };
