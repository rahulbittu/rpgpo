"use strict";
// GPO Template Discovery — Auto-discover and suggest new templates from task patterns
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverPatterns = discoverPatterns;
exports.createTemplateFromPattern = createTemplateFromPattern;
function discoverPatterns(minFrequency = 2) {
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks().filter((t) => t.status === 'done');
        // Group similar tasks by domain + prompt similarity
        const groups = new Map();
        for (const t of tasks) {
            const key = `${t.domain}:${normalizePrompt(t.raw_request || '')}`;
            if (!groups.has(key))
                groups.set(key, { tasks: [], domain: t.domain || 'general' });
            groups.get(key).tasks.push(t);
        }
        const patterns = [];
        for (const [key, group] of groups) {
            if (group.tasks.length < minFrequency)
                continue;
            const representative = group.tasks[0];
            const prompt = representative.raw_request || '';
            // Check if a template already exists for this
            let alreadyTemplated = false;
            try {
                const ts = require('./template-store');
                alreadyTemplated = ts.listTemplates().some((t) => normalizePrompt(t.prompt) === normalizePrompt(prompt));
            }
            catch { /* */ }
            if (alreadyTemplated)
                continue;
            patterns.push({
                id: 'disc_' + key.slice(0, 12).replace(/[^a-zA-Z0-9]/g, '_'),
                domain: group.domain,
                prompt: prompt.slice(0, 200),
                frequency: group.tasks.length,
                avgQuality: 0.8,
                suggestedName: generateName(prompt, group.domain),
                suggestedDescription: `Auto-discovered from ${group.tasks.length} similar tasks`,
                confidence: Math.min(1, group.tasks.length / 5),
            });
        }
        return patterns.sort((a, b) => b.frequency - a.frequency);
    }
    catch {
        return [];
    }
}
function normalizePrompt(prompt) {
    return prompt.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim().slice(0, 50);
}
function generateName(prompt, domain) {
    const words = prompt.split(/\s+/).slice(0, 5).join(' ');
    const domainLabel = {
        topranker: 'TopRanker', newsroom: 'News', wealthresearch: 'Income',
        career: 'Career', careeregine: 'Career', research: 'Research',
        chief_of_staff: 'Planning',
    };
    return `${domainLabel[domain] || domain}: ${words}`;
}
/**
 * Auto-create a template from a discovered pattern.
 */
function createTemplateFromPattern(patternId) {
    const patterns = discoverPatterns(1);
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern)
        return { created: false };
    try {
        const ts = require('./template-store');
        const template = ts.createTemplate({
            name: pattern.suggestedName,
            description: pattern.suggestedDescription,
            domain: pattern.domain,
            prompt: pattern.prompt,
            tags: ['auto-discovered'],
        });
        return { created: true, templateId: template.id };
    }
    catch {
        return { created: false };
    }
}
module.exports = { discoverPatterns, createTemplateFromPattern };
//# sourceMappingURL=template-discovery.js.map