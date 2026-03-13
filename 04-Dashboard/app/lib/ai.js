// RPGPO Shared AI API Call Module
// Used by board-runner.js and worker.js for all AI model interactions.
// Safe: no auto-send, no auto-post, no financial execution.

const https = require('https');

function callOpenAI(systemPrompt, userPrompt, opts = {}) {
  return new Promise((resolve, reject) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return reject(new Error('OPENAI_API_KEY not set'));

    const body = JSON.stringify({
      model: opts.model || 'gpt-4o',
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
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.choices[0].message.content);
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

function callPerplexity(systemPrompt, userPrompt, opts = {}) {
  return new Promise((resolve, reject) => {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) return reject(new Error('PERPLEXITY_API_KEY not set'));

    const body = JSON.stringify({
      model: opts.model || 'sonar',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: opts.maxTokens || 1500,
      temperature: opts.temperature ?? 0.3,
    });

    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
          resolve(parsed.choices[0].message.content);
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

function callGemini(systemPrompt, userPrompt, opts = {}) {
  return new Promise((resolve, reject) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return reject(new Error('GEMINI_API_KEY not set. Add it to your environment and restart PM2.'));

    const model = opts.model || 'gemini-2.0-flash';
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
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('No content in Gemini response: ' + data.slice(0, 200)));
          resolve(text);
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

module.exports = { callOpenAI, callPerplexity, callGemini };
