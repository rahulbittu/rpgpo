const https = require('https');

import type { AICallResult, TokenUsage, ProviderReadiness, Provider } from './types';

interface ProviderError extends Error {
  providerState?: ProviderReadiness | null;
}

interface CallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  searchRecency?: 'day' | 'week' | 'month';
}

const PROVIDER_STATES: Record<string, ProviderReadiness> = {
  READY: 'ready',
  MISSING: 'missing',
  AUTH_FAILED: 'auth_failed',
  QUOTA_UNAVAILABLE: 'quota_unavailable',
  MODEL_UNAVAILABLE: 'model_unavailable',
};

function validateKey(provider: string, key: string | undefined): { valid: boolean; reason?: string } {
  if (!key) return { valid: false, reason: `${provider} API key not set` };
  if (key === 'your_key_here' || key.startsWith('your_') || key === 'sk-placeholder' || key.length < 10) {
    return { valid: false, reason: `${provider} API key is a placeholder ("${key.slice(0, 8)}...")` };
  }
  return { valid: true };
}

function classifyError(provider: string, statusCode: number | undefined, errorMsg: string | undefined): ProviderReadiness | null {
  const msg = (errorMsg || '').toLowerCase();
  if (msg.includes('api key') || msg.includes('unauthorized') || msg.includes('invalid key') || statusCode === 401 || statusCode === 403) {
    return PROVIDER_STATES.AUTH_FAILED;
  }
  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource exhausted') || msg.includes('too many requests') || statusCode === 429) {
    return PROVIDER_STATES.QUOTA_UNAVAILABLE;
  }
  if (msg.includes('model not found') || msg.includes('not found') || msg.includes('does not exist') || msg.includes('is not available') || statusCode === 404) {
    return PROVIDER_STATES.MODEL_UNAVAILABLE;
  }
  return null;
}

function callOpenAI(systemPrompt: string, userPrompt: string, opts: CallOptions = {}): Promise<AICallResult> {
  return new Promise((resolve, reject) => {
    const key = process.env.OPENAI_API_KEY;
    const keyCheck = validateKey('OpenAI', key);
    if (!keyCheck.valid) {
      const err: ProviderError = new Error(keyCheck.reason);
      err.providerState = PROVIDER_STATES.MISSING;
      return reject(err);
    }
    const model = opts.model || 'gpt-4o';
    const body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: opts.maxTokens || 2000,
      temperature: opts.temperature ?? 0.4,
    });
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
    }, (res: any) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            const err: ProviderError = new Error(parsed.error.message);
            err.providerState = classifyError('openai', res.statusCode, parsed.error.message);
            return reject(err);
          }
          const text: string = parsed.choices[0].message.content;
          const usage = parsed.usage || {};
          resolve({
            text, provider: 'openai' as Provider, model,
            usage: {
              inputTokens: usage.prompt_tokens || 0,
              outputTokens: usage.completion_tokens || 0,
              totalTokens: usage.total_tokens || 0,
            } as TokenUsage,
          });
        } catch (e) {
          reject(new Error('OpenAI parse error: ' + data.slice(0, 300)));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('OpenAI timeout')); });
    req.write(body);
    req.end();
  });
}

function callPerplexity(systemPrompt: string, userPrompt: string, opts: CallOptions = {}): Promise<AICallResult> {
  return new Promise((resolve, reject) => {
    const key = process.env.PERPLEXITY_API_KEY;
    const keyCheck = validateKey('Perplexity', key);
    if (!keyCheck.valid) {
      const err: ProviderError = new Error(keyCheck.reason);
      err.providerState = PROVIDER_STATES.MISSING;
      return reject(err);
    }
    const model = opts.model || 'sonar';
    const body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: opts.maxTokens || 3000,
      temperature: opts.temperature ?? 0.3,
      search_recency_filter: opts.searchRecency || 'week',
    });
    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
    }, (res: any) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            const err: ProviderError = new Error(parsed.error.message || JSON.stringify(parsed.error));
            err.providerState = classifyError('perplexity', res.statusCode, parsed.error.message);
            return reject(err);
          }
          const text: string = parsed.choices[0].message.content;
          const usage = parsed.usage || {};
          resolve({
            text, provider: 'perplexity' as Provider, model,
            usage: {
              inputTokens: usage.prompt_tokens || 0,
              outputTokens: usage.completion_tokens || 0,
              totalTokens: usage.total_tokens || 0,
              cost: usage.cost || null,
            } as TokenUsage,
          });
        } catch (e) {
          reject(new Error('Perplexity parse error: ' + data.slice(0, 300)));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Perplexity timeout')); });
    req.write(body);
    req.end();
  });
}

function callGemini(systemPrompt: string, userPrompt: string, opts: CallOptions = {}): Promise<AICallResult> {
  return new Promise((resolve, reject) => {
    const key = process.env.GEMINI_API_KEY;
    const keyCheck = validateKey('Gemini', key);
    if (!keyCheck.valid) {
      const err: ProviderError = new Error(keyCheck.reason);
      err.providerState = PROVIDER_STATES.MISSING;
      return reject(err);
    }
    const model = opts.model || 'gemini-2.5-flash-lite';
    const body = JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
      ],
      generationConfig: {
        maxOutputTokens: opts.maxTokens || 2000,
        temperature: opts.temperature ?? 0.4,
      }
    });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${key}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res: any) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            const err: ProviderError = new Error(parsed.error.message || JSON.stringify(parsed.error));
            err.providerState = classifyError('gemini', res.statusCode || parsed.error.code, parsed.error.message);
            return reject(err);
          }
          const text: string | undefined = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            const err: ProviderError = new Error('No content in Gemini response: ' + data.slice(0, 200));
            err.providerState = PROVIDER_STATES.MODEL_UNAVAILABLE;
            return reject(err);
          }
          const um = parsed.usageMetadata || {};
          resolve({
            text, provider: 'gemini' as Provider, model,
            usage: {
              inputTokens: um.promptTokenCount || 0,
              outputTokens: um.candidatesTokenCount || 0,
              totalTokens: um.totalTokenCount || 0,
            } as TokenUsage,
          });
        } catch (e) {
          reject(new Error('Gemini parse error: ' + data.slice(0, 300)));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Gemini timeout')); });
    req.write(body);
    req.end();
  });
}

module.exports = { callOpenAI, callPerplexity, callGemini, PROVIDER_STATES, classifyError };
