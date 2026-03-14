"use strict";
// GPO Extension Framework — Governed installable extension packages
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackage = createPackage;
exports.versionPackage = versionPackage;
exports.evaluateInstall = evaluateInstall;
exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;
exports.getPackages = getPackages;
exports.getPackage = getPackage;
exports.getInstalls = getInstalls;
const fs = require('fs');
const path = require('path');
const PACKAGES_FILE = path.resolve(__dirname, '..', '..', 'state', 'extension-packages.json');
const INSTALLS_FILE = path.resolve(__dirname, '..', '..', 'state', 'extension-installs.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
function createPackage(opts) {
    const pkgs = readJson(PACKAGES_FILE, []);
    const pkg = {
        extension_id: uid('ext'), name: opts.name, description: opts.description,
        version: 1, trust_level: opts.trust_level || 'community',
        permissions: opts.permissions || [], provides: opts.provides || [],
        dependencies: [], sandbox_policy: (opts.sandbox_policy || 'standard'),
        state: 'draft', tenant_compatibility: ['*'],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    pkgs.unshift(pkg);
    if (pkgs.length > 100)
        pkgs.length = 100;
    writeJson(PACKAGES_FILE, pkgs);
    return pkg;
}
function versionPackage(extId) {
    const pkgs = readJson(PACKAGES_FILE, []);
    const idx = pkgs.findIndex(p => p.extension_id === extId);
    if (idx === -1)
        return null;
    pkgs[idx].version++;
    pkgs[idx].updated_at = new Date().toISOString();
    writeJson(PACKAGES_FILE, pkgs);
    return pkgs[idx];
}
function evaluateInstall(extId, tenantId) {
    const pkg = getPackage(extId);
    if (!pkg)
        return { allowed: false, reasons: ['Package not found'] };
    const reasons = [];
    if (pkg.state === 'deprecated')
        reasons.push('Package is deprecated');
    if (pkg.trust_level === 'untrusted')
        reasons.push('Untrusted package');
    if (pkg.permissions.includes('access_secrets'))
        reasons.push('Requires secret access — review carefully');
    if (pkg.permissions.includes('modify_governance'))
        reasons.push('Can modify governance — elevated risk');
    return { allowed: reasons.length === 0 || !reasons.some(r => r.includes('deprecated') || r.includes('Untrusted')), reasons };
}
function installPackage(extId, tenantId, scopeType = 'tenant', scopeId) {
    const check = evaluateInstall(extId, tenantId);
    if (!check.allowed)
        return null;
    const installs = readJson(INSTALLS_FILE, []);
    const record = { install_id: uid('ei'), extension_id: extId, tenant_id: tenantId, scope_type: scopeType, scope_id: scopeId || tenantId, installed_at: new Date().toISOString() };
    installs.unshift(record);
    if (installs.length > 200)
        installs.length = 200;
    writeJson(INSTALLS_FILE, installs);
    // Update package state
    const pkgs = readJson(PACKAGES_FILE, []);
    const idx = pkgs.findIndex(p => p.extension_id === extId);
    if (idx >= 0) {
        pkgs[idx].state = 'installed';
        writeJson(PACKAGES_FILE, pkgs);
    }
    return record;
}
function uninstallPackage(extId, tenantId) {
    const installs = readJson(INSTALLS_FILE, []);
    const idx = installs.findIndex(i => i.extension_id === extId && i.tenant_id === tenantId && !i.uninstalled_at);
    if (idx === -1)
        return false;
    installs[idx].uninstalled_at = new Date().toISOString();
    writeJson(INSTALLS_FILE, installs);
    return true;
}
function getPackages() { return readJson(PACKAGES_FILE, []); }
function getPackage(extId) { return getPackages().find(p => p.extension_id === extId) || null; }
function getInstalls(tenantId) {
    const all = readJson(INSTALLS_FILE, []);
    return tenantId ? all.filter(i => i.tenant_id === tenantId && !i.uninstalled_at) : all;
}
module.exports = { createPackage, versionPackage, evaluateInstall, installPackage, uninstallPackage, getPackages, getPackage, getInstalls };
//# sourceMappingURL=extension-framework.js.map