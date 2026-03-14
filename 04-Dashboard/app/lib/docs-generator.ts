// GPO Enterprise Documentation Generator
// Produces and maintains structured docs for the platform.
// ADRs, capability docs, runbooks, release docs.

import type { ArchitectureDecisionRecord, Domain } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DOCS_ROOT = path.resolve(__dirname, '..', '..', 'docs');
const ADR_DIR = path.join(DOCS_ROOT, 'adrs');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 4); }

// ═══════════════════════════════════════════
// ADR — Architecture Decision Records
// ═══════════════════════════════════════════

/** Create an ADR */
export function createADR(
  title: string, context: string, decision: string,
  consequences: string, alternatives: string[], modules: string[]
): ArchitectureDecisionRecord {
  ensureDir(ADR_DIR);

  const adr: ArchitectureDecisionRecord = {
    id: 'adr-' + uid(),
    title, status: 'accepted', context, decision, consequences,
    alternatives, related_modules: modules,
    decided_at: new Date().toISOString(), decided_by: 'operator',
  };

  const filename = `${new Date().toISOString().slice(0, 10)}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.md`;
  const content = `# ADR: ${title}

**Status:** ${adr.status}
**Date:** ${adr.decided_at.slice(0, 10)}
**Modules:** ${modules.join(', ')}

## Context
${context}

## Decision
${decision}

## Consequences
${consequences}

## Alternatives Considered
${alternatives.map(a => `- ${a}`).join('\n')}
`;

  fs.writeFileSync(path.join(ADR_DIR, filename), content);
  return adr;
}

/** List all ADRs */
export function listADRs(): Array<{ filename: string; title: string; date: string }> {
  ensureDir(ADR_DIR);
  try {
    return fs.readdirSync(ADR_DIR)
      .filter((f: string) => f.endsWith('.md'))
      .sort()
      .reverse()
      .map((f: string) => {
        const content = fs.readFileSync(path.join(ADR_DIR, f), 'utf-8');
        const titleMatch = content.match(/^# ADR: (.+)$/m);
        return {
          filename: f,
          title: titleMatch ? titleMatch[1] : f.replace('.md', ''),
          date: f.slice(0, 10),
        };
      });
  } catch { return []; }
}

// ═══════════════════════════════════════════
// Auto-generated docs
// ═══════════════════════════════════════════

/** Generate/update module documentation */
export function generateModuleDocs(): string {
  ensureDir(DOCS_ROOT);

  const modules: Array<{ name: string; lines: number; purpose: string }> = [];
  const libDir = path.resolve(__dirname);

  try {
    const files = fs.readdirSync(libDir).filter((f: string) => f.endsWith('.ts') && !f.endsWith('.d.ts'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(libDir, f), 'utf-8');
      const lines = content.split('\n').length;
      const firstComment = content.match(/^\/\/ (.+)/m);
      modules.push({
        name: f.replace('.ts', ''),
        lines,
        purpose: firstComment ? firstComment[1] : '',
      });
    }
  } catch { /* ignore */ }

  modules.sort((a, b) => a.name.localeCompare(b.name));

  const doc = `# GPO Module Reference

*Auto-generated: ${new Date().toISOString().slice(0, 10)}*

## Modules (${modules.length} total, ${modules.reduce((s, m) => s + m.lines, 0)} lines)

| Module | Lines | Purpose |
|--------|-------|---------|
${modules.map(m => `| \`${m.name}\` | ${m.lines} | ${m.purpose.slice(0, 70)} |`).join('\n')}
`;

  fs.writeFileSync(path.join(DOCS_ROOT, 'modules.md'), doc);
  return doc;
}

/** Generate environment/release documentation */
export function generateReleaseDocs(): string {
  ensureDir(DOCS_ROOT);

  let envData: Array<{ env: string; active: boolean; release_version: string }> = [];
  try {
    const env = require('./environments') as { getAllEnvStatuses(): typeof envData };
    envData = env.getAllEnvStatuses();
  } catch { /* ignore */ }

  let rcData: Array<{ version: string; to_env: string; ready: boolean; created_at: string }> = [];
  try {
    const rel = require('./releases') as { getAllReleaseCandidates(): typeof rcData };
    rcData = rel.getAllReleaseCandidates().slice(0, 10);
  } catch { /* ignore */ }

  const doc = `# GPO Release Status

*Auto-generated: ${new Date().toISOString().slice(0, 10)}*

## Environments

| Lane | Active | Version |
|------|--------|---------|
${envData.map(e => `| ${e.env} | ${e.active ? 'Yes' : 'No'} | ${e.release_version} |`).join('\n')}

## Recent Release Candidates

| Version | Target | Ready | Created |
|---------|--------|-------|---------|
${rcData.map(rc => `| ${rc.version} | ${rc.to_env} | ${rc.ready ? 'Yes' : 'No'} | ${rc.created_at.slice(0, 10)} |`).join('\n')}
`;

  fs.writeFileSync(path.join(DOCS_ROOT, 'releases.md'), doc);
  return doc;
}

/** Generate capability documentation */
export function generateCapabilityDocs(): string {
  ensureDir(DOCS_ROOT);

  let caps: Array<{ id: string; name: string; category: string; description: string; modifies_state: boolean }> = [];
  try {
    const capsMod = require('./capabilities') as { getAllCapabilities(): typeof caps };
    caps = capsMod.getAllCapabilities();
  } catch { /* ignore */ }

  const doc = `# GPO Capabilities

*Auto-generated: ${new Date().toISOString().slice(0, 10)}*

## Registered Capabilities (${caps.length})

| ID | Name | Category | Modifies State |
|----|------|----------|----------------|
${caps.map(c => `| \`${c.id}\` | ${c.name} | ${c.category} | ${c.modifies_state ? 'Yes' : 'No'} |`).join('\n')}
`;

  fs.writeFileSync(path.join(DOCS_ROOT, 'capabilities.md'), doc);
  return doc;
}

/** Generate all docs */
export function generateAllDocs(): string[] {
  const generated: string[] = [];
  try { generateModuleDocs(); generated.push('modules.md'); } catch { /* ignore */ }
  try { generateReleaseDocs(); generated.push('releases.md'); } catch { /* ignore */ }
  try { generateCapabilityDocs(); generated.push('capabilities.md'); } catch { /* ignore */ }

  // Record generation timestamp
  try {
    const healthFile = path.join(DOCS_ROOT, '.docs-health.json');
    const health = getDocsHealth();
    fs.writeFileSync(healthFile, JSON.stringify({
      last_generated_at: new Date().toISOString(),
      generated,
    }, null, 2));
  } catch { /* ignore */ }

  return generated;
}

// ═══════════════════════════════════════════
// Documentation Health
// ═══════════════════════════════════════════

/** Check documentation health — staleness, missing docs, coverage */
export function getDocsHealth(): {
  total_docs: number; auto_generated: number; adrs: number;
  stale_docs: string[]; missing_docs: string[];
  last_generated_at: string | null; refresh_recommended: boolean;
} {
  ensureDir(DOCS_ROOT);
  ensureDir(ADR_DIR);

  const allDocs = fs.readdirSync(DOCS_ROOT).filter((f: string) => f.endsWith('.md'));
  const adrs = fs.existsSync(ADR_DIR) ? fs.readdirSync(ADR_DIR).filter((f: string) => f.endsWith('.md')).length : 0;
  const autoGenerated = ['modules.md', 'releases.md', 'capabilities.md'].filter(f => allDocs.includes(f));

  // Check staleness — docs older than 7 days
  const staleDocs: string[] = [];
  const now = Date.now();
  for (const f of allDocs) {
    try {
      const stat = fs.statSync(path.join(DOCS_ROOT, f));
      if (now - stat.mtimeMs > 7 * 86400000) staleDocs.push(f);
    } catch { /* ignore */ }
  }

  // Check for expected docs that are missing
  const expectedDocs = ['architecture.md', 'operator-guide.md', 'privacy.md', 'board-of-ai.md', 'changelog.md', 'modules.md', 'capabilities.md', 'releases.md'];
  const missingDocs = expectedDocs.filter(d => !allDocs.includes(d));

  // Check last generation time
  let lastGeneratedAt: string | null = null;
  try {
    const healthFile = path.join(DOCS_ROOT, '.docs-health.json');
    if (fs.existsSync(healthFile)) {
      const h = JSON.parse(fs.readFileSync(healthFile, 'utf-8'));
      lastGeneratedAt = h.last_generated_at || null;
    }
  } catch { /* ignore */ }

  const daysSinceGeneration = lastGeneratedAt ? (now - new Date(lastGeneratedAt).getTime()) / 86400000 : 999;

  return {
    total_docs: allDocs.length,
    auto_generated: autoGenerated.length,
    adrs,
    stale_docs: staleDocs,
    missing_docs: missingDocs,
    last_generated_at: lastGeneratedAt,
    refresh_recommended: daysSinceGeneration > 3 || missingDocs.length > 0 || staleDocs.length > 2,
  };
}

/** Get suggested doc refreshes based on recent changes */
export function getSuggestedRefreshes(): Array<{ doc: string; reason: string }> {
  const suggestions: Array<{ doc: string; reason: string }> = [];
  const health = getDocsHealth();

  for (const d of health.missing_docs) {
    suggestions.push({ doc: d, reason: 'Missing — needs initial generation' });
  }

  if (health.stale_docs.length > 0) {
    suggestions.push({ doc: 'modules.md', reason: `${health.stale_docs.length} doc(s) are stale (>7 days)` });
  }

  if (!health.last_generated_at) {
    suggestions.push({ doc: 'all', reason: 'Auto-generated docs have never been created' });
  } else {
    const daysSince = (Date.now() - new Date(health.last_generated_at).getTime()) / 86400000;
    if (daysSince > 3) {
      suggestions.push({ doc: 'all', reason: `Last generation was ${Math.round(daysSince)} days ago` });
    }
  }

  return suggestions;
}

module.exports = {
  createADR, listADRs,
  generateModuleDocs, generateReleaseDocs, generateCapabilityDocs, generateAllDocs,
  getDocsHealth, getSuggestedRefreshes,
};
