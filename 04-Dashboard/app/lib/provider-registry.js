"use strict";
// GPO Provider Capability Registry
// Global profiles + scoped fit scores at operator/engine/project levels.
// Tracks evidence runs, promotes/deprecates provider-role-task fits.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderProfiles = getProviderProfiles;
exports.getProviderProfile = getProviderProfile;
exports.getAllFits = getAllFits;
exports.getFitsForProvider = getFitsForProvider;
exports.getFitsForDomain = getFitsForDomain;
exports.getFitsForProject = getFitsForProject;
exports.getFit = getFit;
exports.selectBestProvider = selectBestProvider;
exports.upsertFit = upsertFit;
exports.recordEvidenceRun = recordEvidenceRun;
exports.promoteFit = promoteFit;
exports.deprecateFit = deprecateFit;
exports.getAllRecipes = getAllRecipes;
exports.getRecipe = getRecipe;
exports.getRecipesForProvider = getRecipesForProvider;
exports.getRecipesForProject = getRecipesForProject;
exports.createRecipe = createRecipe;
exports.promoteRecipe = promoteRecipe;
exports.deprecateRecipe = deprecateRecipe;
const fs = require('fs');
const path = require('path');
const PROFILES_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-profiles.json');
const FITS_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-fits.json');
const RECIPES_FILE = path.resolve(__dirname, '..', '..', 'state', 'prompt-recipes.json');
function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function readJson(file, fallback) {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback;
    }
    catch {
        return fallback;
    }
}
function writeJson(file, data) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
// ═══════════════════════════════════════════
// Built-in Provider Profiles
// ═══════════════════════════════════════════
const BUILT_IN_PROFILES = [
    {
        provider_id: 'claude',
        display_name: 'Claude (Local)',
        strengths: ['Code generation', 'Code review', 'Long context reasoning', 'File manipulation', 'Structured output'],
        weaknesses: ['No real-time data', 'Local execution only'],
        best_roles: ['builder', 'reviewer', 'specialist'],
        best_task_kinds: ['code', 'review', 'analysis'],
        privacy_class: 'local',
        supports_code_execution: true,
        supports_file_access: true,
        max_context_tokens: 200000,
        cost_tier: 'free',
        updated_at: new Date().toISOString(),
    },
    {
        provider_id: 'openai',
        display_name: 'OpenAI (GPT-4o)',
        strengths: ['Reasoning', 'Strategy', 'Planning', 'Synthesis', 'Multi-step analysis'],
        weaknesses: ['No file access', 'External API', 'Cost per call'],
        best_roles: ['reasoner', 'strategist', 'critic'],
        best_task_kinds: ['strategy', 'analysis', 'general'],
        privacy_class: 'api_external',
        supports_code_execution: false,
        supports_file_access: false,
        max_context_tokens: 128000,
        cost_tier: 'medium',
        updated_at: new Date().toISOString(),
    },
    {
        provider_id: 'gemini',
        display_name: 'Gemini (Flash)',
        strengths: ['Fast responses', 'Critique', 'Alternative perspectives', 'Cost-effective'],
        weaknesses: ['Less depth than GPT-4o', 'External API'],
        best_roles: ['critic', 'specialist'],
        best_task_kinds: ['review', 'analysis', 'strategy'],
        privacy_class: 'api_external',
        supports_code_execution: false,
        supports_file_access: false,
        max_context_tokens: 1000000,
        cost_tier: 'low',
        updated_at: new Date().toISOString(),
    },
    {
        provider_id: 'perplexity',
        display_name: 'Perplexity (Sonar)',
        strengths: ['Real-time search', 'Fact verification', 'Current events', 'Source attribution'],
        weaknesses: ['No reasoning depth', 'No code', 'External API'],
        best_roles: ['researcher'],
        best_task_kinds: ['research'],
        privacy_class: 'api_external',
        supports_code_execution: false,
        supports_file_access: false,
        max_context_tokens: 28000,
        cost_tier: 'low',
        updated_at: new Date().toISOString(),
    },
];
// ═══════════════════════════════════════════
// Provider Profiles
// ═══════════════════════════════════════════
function getProviderProfiles() {
    const custom = readJson(PROFILES_FILE, []);
    // Merge: custom overrides built-in
    const map = new Map();
    for (const p of BUILT_IN_PROFILES)
        map.set(p.provider_id, p);
    for (const p of custom)
        map.set(p.provider_id, p);
    return Array.from(map.values());
}
function getProviderProfile(providerId) {
    return getProviderProfiles().find(p => p.provider_id === providerId) || null;
}
// ═══════════════════════════════════════════
// Scoped Provider Fits
// ═══════════════════════════════════════════
function getAllFits() {
    return readJson(FITS_FILE, []);
}
function getFitsForProvider(providerId) {
    return getAllFits().filter(f => f.provider_id === providerId);
}
function getFitsForDomain(domain) {
    return getAllFits().filter(f => f.scope_level === 'engine' && f.scope_id === domain ||
        f.scope_level === 'global');
}
function getFitsForProject(projectId) {
    return getAllFits().filter(f => f.scope_level === 'project' && f.scope_id === projectId ||
        f.scope_level === 'global');
}
function getFit(fitId) {
    return getAllFits().find(f => f.fit_id === fitId) || null;
}
/** Find the best provider for a role+taskKind, scoped by domain/project */
function selectBestProvider(role, taskKind, domain, projectId) {
    const fits = getAllFits().filter(f => f.role === role && f.task_kind === taskKind && f.state !== 'deprecated');
    // Prefer project > engine > global scope
    let best = null;
    let source = 'default';
    if (projectId) {
        const projFit = fits.find(f => f.scope_level === 'project' && f.scope_id === projectId);
        if (projFit) {
            best = projFit;
            source = `project:${projectId}`;
        }
    }
    if (!best && domain) {
        const engFit = fits.find(f => f.scope_level === 'engine' && f.scope_id === domain);
        if (engFit) {
            best = engFit;
            source = `engine:${domain}`;
        }
    }
    if (!best) {
        const globalFit = fits
            .filter(f => f.scope_level === 'global')
            .sort((a, b) => b.fit_score - a.fit_score)[0];
        if (globalFit) {
            best = globalFit;
            source = 'global';
        }
    }
    // Fallback to profile defaults
    if (!best) {
        const profiles = getProviderProfiles();
        const match = profiles.find(p => p.best_roles.includes(role) && p.best_task_kinds.includes(taskKind));
        if (match) {
            return { provider_id: match.provider_id, fit_score: 50, confidence: 20, source: 'profile_default' };
        }
        // Hard fallback: role-based
        const roleMatch = profiles.find(p => p.best_roles.includes(role));
        if (roleMatch) {
            return { provider_id: roleMatch.provider_id, fit_score: 40, confidence: 10, source: 'role_default' };
        }
        return null;
    }
    return { provider_id: best.provider_id, fit_score: best.fit_score, confidence: best.confidence, source };
}
/** Create or update a scoped fit */
function upsertFit(opts) {
    const fits = getAllFits();
    const existing = fits.findIndex(f => f.provider_id === opts.provider_id && f.role === opts.role &&
        f.task_kind === opts.task_kind && f.scope_level === opts.scope_level &&
        f.scope_id === opts.scope_id);
    if (existing >= 0) {
        fits[existing].fit_score = opts.fit_score;
        fits[existing].confidence = Math.min(100, fits[existing].confidence + 5);
        if (opts.notes)
            fits[existing].notes = opts.notes;
        fits[existing].updated_at = new Date().toISOString();
        writeJson(FITS_FILE, fits);
        return fits[existing];
    }
    const fit = {
        fit_id: uid('pf'),
        provider_id: opts.provider_id,
        role: opts.role,
        task_kind: opts.task_kind,
        scope_level: opts.scope_level,
        scope_id: opts.scope_id,
        fit_score: opts.fit_score,
        confidence: 20,
        evidence_runs: 0,
        success_runs: 0,
        failure_runs: 0,
        state: 'experimental',
        notes: opts.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    fits.unshift(fit);
    if (fits.length > 500)
        fits.length = 500;
    writeJson(FITS_FILE, fits);
    return fit;
}
/** Record an evidence run (success/failure) for a fit */
function recordEvidenceRun(fitId, success) {
    const fits = getAllFits();
    const idx = fits.findIndex(f => f.fit_id === fitId);
    if (idx === -1)
        return null;
    fits[idx].evidence_runs++;
    if (success)
        fits[idx].success_runs++;
    else
        fits[idx].failure_runs++;
    // Adjust score based on evidence
    const rate = fits[idx].evidence_runs > 0
        ? fits[idx].success_runs / fits[idx].evidence_runs
        : 0.5;
    fits[idx].fit_score = Math.round(rate * 100);
    fits[idx].confidence = Math.min(100, 20 + fits[idx].evidence_runs * 8);
    fits[idx].updated_at = new Date().toISOString();
    writeJson(FITS_FILE, fits);
    return fits[idx];
}
/** Promote a fit from experimental to promoted */
function promoteFit(fitId) {
    const fits = getAllFits();
    const idx = fits.findIndex(f => f.fit_id === fitId);
    if (idx === -1)
        return null;
    fits[idx].state = 'promoted';
    fits[idx].updated_at = new Date().toISOString();
    writeJson(FITS_FILE, fits);
    return fits[idx];
}
/** Deprecate a fit */
function deprecateFit(fitId) {
    const fits = getAllFits();
    const idx = fits.findIndex(f => f.fit_id === fitId);
    if (idx === -1)
        return null;
    fits[idx].state = 'deprecated';
    fits[idx].updated_at = new Date().toISOString();
    writeJson(FITS_FILE, fits);
    return fits[idx];
}
// ═══════════════════════════════════════════
// Prompt Recipes
// ═══════════════════════════════════════════
function getAllRecipes() {
    return readJson(RECIPES_FILE, []);
}
function getRecipe(recipeId) {
    return getAllRecipes().find(r => r.recipe_id === recipeId) || null;
}
function getRecipesForProvider(providerId) {
    return getAllRecipes().filter(r => r.provider_id === providerId);
}
function getRecipesForProject(projectId) {
    return getAllRecipes().filter(r => r.scope_level === 'project' && r.scope_id === projectId ||
        r.scope_level === 'global');
}
function createRecipe(opts) {
    const recipes = getAllRecipes();
    const recipe = {
        recipe_id: uid('pr'),
        provider_id: opts.provider_id,
        role: opts.role,
        task_kind: opts.task_kind,
        scope_level: opts.scope_level,
        scope_id: opts.scope_id,
        title: opts.title,
        template: opts.template,
        context_keys: opts.context_keys || [],
        success_rate: 0,
        uses: 0,
        state: 'experimental',
        source_graph_id: opts.source_graph_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    recipes.unshift(recipe);
    if (recipes.length > 300)
        recipes.length = 300;
    writeJson(RECIPES_FILE, recipes);
    return recipe;
}
function promoteRecipe(recipeId) {
    const recipes = getAllRecipes();
    const idx = recipes.findIndex(r => r.recipe_id === recipeId);
    if (idx === -1)
        return null;
    recipes[idx].state = 'promoted';
    recipes[idx].updated_at = new Date().toISOString();
    writeJson(RECIPES_FILE, recipes);
    return recipes[idx];
}
function deprecateRecipe(recipeId) {
    const recipes = getAllRecipes();
    const idx = recipes.findIndex(r => r.recipe_id === recipeId);
    if (idx === -1)
        return null;
    recipes[idx].state = 'deprecated';
    recipes[idx].updated_at = new Date().toISOString();
    writeJson(RECIPES_FILE, recipes);
    return recipes[idx];
}
module.exports = {
    getProviderProfiles, getProviderProfile,
    getAllFits, getFitsForProvider, getFitsForDomain, getFitsForProject, getFit,
    selectBestProvider, upsertFit, recordEvidenceRun, promoteFit, deprecateFit,
    getAllRecipes, getRecipe, getRecipesForProvider, getRecipesForProject,
    createRecipe, promoteRecipe, deprecateRecipe,
};
//# sourceMappingURL=provider-registry.js.map