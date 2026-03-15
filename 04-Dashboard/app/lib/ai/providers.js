"use strict";
// GPO Provider Structured Call — Maps GPO_StructuredMode to provider-specific options
Object.defineProperty(exports, "__esModule", { value: true });
exports.callProviderStructured = callProviderStructured;
const { callOpenAI, callPerplexity, callGemini } = require('../ai');
/**
 * Call a provider with structured output mode options.
 * Reuses existing provider clients; only adds mode-specific options.
 */
async function callProviderStructured(args) {
    const { provider, envelope, schema } = args;
    const mode = envelope.mode;
    const start = Date.now();
    // Build combined system prompt with instructions
    const systemWithInstructions = envelope.system + '\n\n' + envelope.instructions;
    let result;
    switch (provider) {
        case 'openai': {
            // OpenAI supports response_format: { type: 'json_object' }
            // Since our callOpenAI doesn't support response_format directly,
            // we inject the JSON instruction strongly into the prompt
            result = await callOpenAI(systemWithInstructions, envelope.user, {
                model: args.model || 'gpt-4o',
                maxTokens: 4000,
                temperature: 0.2,
            });
            break;
        }
        case 'gemini':
        case 'google': {
            // Gemini: generationConfig.response_mime_type = 'application/json'
            // Our callGemini merges system+user; JSON mode is prompt-driven here
            result = await callGemini(systemWithInstructions, envelope.user, {
                model: args.model || 'gemini-2.5-flash-lite',
                maxTokens: 4000,
                temperature: 0.2,
            });
            break;
        }
        case 'perplexity': {
            // Perplexity: prompt-sentinel mode, no native JSON support
            result = await callPerplexity(systemWithInstructions, envelope.user, {
                model: args.model || 'sonar',
                maxTokens: 3000,
                temperature: 0.2,
            });
            break;
        }
        default: {
            // Default to OpenAI
            result = await callOpenAI(systemWithInstructions, envelope.user, {
                model: args.model || 'gpt-4o',
                maxTokens: 4000,
                temperature: 0.2,
            });
            break;
        }
    }
    return {
        rawText: result.text,
        tokensIn: result.usage?.inputTokens,
        tokensOut: result.usage?.outputTokens,
        durationMs: Date.now() - start,
        usedMode: mode,
    };
}
module.exports = { callProviderStructured };
//# sourceMappingURL=providers.js.map