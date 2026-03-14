"use strict";
// GPO Agent Skill Packs — Reusable governed capability packages
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPack = createPack;
exports.versionPack = versionPack;
exports.bindPack = bindPack;
exports.getPacks = getPacks;
exports.getPack = getPack;
exports.getBindings = getBindings;
exports.getBindingsForScope = getBindingsForScope;
const fs = require('fs');
const path = require('path');
const PACKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'skill-packs.json');
const BINDINGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'skill-pack-bindings.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
function createPack(opts) {
    const packs = readJson(PACKS_FILE, []);
    const pack = {
        pack_id: uid('sp'), name: opts.name, description: opts.description,
        version: 1, state: 'draft',
        capabilities: opts.capabilities || [], constraints: opts.constraints || [],
        dependencies: opts.dependencies || [], scope: (opts.scope || 'global'),
        compatibility: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    packs.unshift(pack);
    if (packs.length > 100)
        packs.length = 100;
    writeJson(PACKS_FILE, packs);
    return pack;
}
function versionPack(packId, changes) {
    const packs = readJson(PACKS_FILE, []);
    const idx = packs.findIndex(p => p.pack_id === packId);
    if (idx === -1)
        return null;
    packs[idx].version++;
    if (changes)
        Object.assign(packs[idx], changes);
    packs[idx].updated_at = new Date().toISOString();
    writeJson(PACKS_FILE, packs);
    return packs[idx];
}
function bindPack(packId, scopeType, scopeId) {
    const bindings = readJson(BINDINGS_FILE, []);
    const binding = { binding_id: uid('sb'), pack_id: packId, scope_type: scopeType, scope_id: scopeId, active: true, created_at: new Date().toISOString() };
    bindings.unshift(binding);
    if (bindings.length > 200)
        bindings.length = 200;
    writeJson(BINDINGS_FILE, bindings);
    return binding;
}
function getPacks() { return readJson(PACKS_FILE, []); }
function getPack(packId) { return getPacks().find(p => p.pack_id === packId) || null; }
function getBindings() { return readJson(BINDINGS_FILE, []); }
function getBindingsForScope(scopeType, scopeId) {
    return getBindings().filter(b => b.scope_type === scopeType && b.scope_id === scopeId && b.active);
}
module.exports = { createPack, versionPack, bindPack, getPacks, getPack, getBindings, getBindingsForScope };
//# sourceMappingURL=skill-packs.js.map