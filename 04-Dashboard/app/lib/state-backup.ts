// GPO State Backup — Atomic snapshots, backup, export/import, integrity verification

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');
const zlib = require('zlib') as typeof import('zlib');

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
const BACKUPS_DIR = path.resolve(__dirname, '..', '..', 'backups');
const EXPORTS_DIR = path.resolve(__dirname, '..', '..', 'exports');

function ensureDir(dir: string): void { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

// ── Snapshot ──

export function createSnapshot(): { id: string; path: string; files: number; sizeBytes: number; checksum: string } {
  ensureDir(BACKUPS_DIR);
  const id = 'snap_' + new Date().toISOString().replace(/[:.]/g, '-');
  const snapDir = path.join(BACKUPS_DIR, id);
  ensureDir(snapDir);

  const files = collectStateFiles();
  let totalSize = 0;
  const checksumHash = crypto.createHash('sha256');

  for (const file of files) {
    const relPath = path.relative(STATE_DIR, file.path);
    const destPath = path.join(snapDir, relPath);
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(file.path, destPath);
    const content = fs.readFileSync(file.path);
    checksumHash.update(content);
    totalSize += file.size;
  }

  const checksum = checksumHash.digest('hex').slice(0, 16);

  // Write manifest
  const manifest = {
    id, createdAt: new Date().toISOString(),
    files: files.length, sizeBytes: totalSize, checksum,
    stateDir: STATE_DIR,
  };
  fs.writeFileSync(path.join(snapDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  return { id, path: snapDir, files: files.length, sizeBytes: totalSize, checksum };
}

export function listSnapshots(): Array<{ id: string; createdAt: string; files: number; sizeBytes: number }> {
  ensureDir(BACKUPS_DIR);
  const entries = fs.readdirSync(BACKUPS_DIR).filter((d: string) => d.startsWith('snap_'));
  return entries.map((d: string) => {
    const manifestFile = path.join(BACKUPS_DIR, d, 'manifest.json');
    if (!fs.existsSync(manifestFile)) return { id: d, createdAt: '', files: 0, sizeBytes: 0 };
    try {
      const m = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
      return { id: m.id || d, createdAt: m.createdAt || '', files: m.files || 0, sizeBytes: m.sizeBytes || 0 };
    } catch { return { id: d, createdAt: '', files: 0, sizeBytes: 0 }; }
  }).sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function restoreSnapshot(snapshotId: string): { restored: number; errors: string[] } {
  const snapDir = path.join(BACKUPS_DIR, snapshotId);
  if (!fs.existsSync(snapDir)) throw new Error('Snapshot not found: ' + snapshotId);

  const errors: string[] = [];
  let restored = 0;
  const files = collectFilesRecursive(snapDir).filter(f => !f.endsWith('manifest.json'));

  for (const file of files) {
    const relPath = path.relative(snapDir, file);
    const destPath = path.join(STATE_DIR, relPath);
    try {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(file, destPath);
      restored++;
    } catch (e) {
      errors.push(`Failed to restore ${relPath}: ${(e as Error).message}`);
    }
  }

  return { restored, errors };
}

// ── Export ──

export function exportState(): { id: string; path: string; files: number; sizeBytes: number } {
  ensureDir(EXPORTS_DIR);
  const id = 'export_' + new Date().toISOString().replace(/[:.]/g, '-');
  const exportFile = path.join(EXPORTS_DIR, id + '.json');

  const files = collectStateFiles();
  const data: Record<string, string> = {};
  let totalSize = 0;

  for (const file of files) {
    const relPath = path.relative(STATE_DIR, file.path);
    try {
      data[relPath] = fs.readFileSync(file.path, 'utf-8');
      totalSize += file.size;
    } catch { /* skip */ }
  }

  const exportData = { id, createdAt: new Date().toISOString(), files: Object.keys(data).length, data };
  fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));

  return { id, path: exportFile, files: Object.keys(data).length, sizeBytes: totalSize };
}

export function importState(exportFile: string, dryRun: boolean = true): { files: number; wouldOverwrite: string[]; imported: number } {
  if (!fs.existsSync(exportFile)) throw new Error('Export file not found');
  const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
  const wouldOverwrite: string[] = [];
  let imported = 0;

  for (const [relPath, content] of Object.entries(exportData.data || {})) {
    const destPath = path.join(STATE_DIR, relPath);
    if (fs.existsSync(destPath)) wouldOverwrite.push(relPath);
    if (!dryRun) {
      ensureDir(path.dirname(destPath));
      fs.writeFileSync(destPath, content as string);
      imported++;
    }
  }

  return { files: Object.keys(exportData.data || {}).length, wouldOverwrite, imported };
}

export function listExports(): Array<{ id: string; createdAt: string; files: number }> {
  ensureDir(EXPORTS_DIR);
  return fs.readdirSync(EXPORTS_DIR)
    .filter((f: string) => f.endsWith('.json'))
    .map((f: string) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(EXPORTS_DIR, f), 'utf-8'));
        return { id: data.id || f, createdAt: data.createdAt || '', files: data.files || 0 };
      } catch { return { id: f, createdAt: '', files: 0 }; }
    })
    .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// ── Integrity ──

export function verifyIntegrity(): { ok: boolean; totalFiles: number; totalBytes: number; errors: string[] } {
  const files = collectStateFiles();
  const errors: string[] = [];
  let totalBytes = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.path, 'utf-8');
      if (file.path.endsWith('.json')) JSON.parse(content); // validate JSON
      totalBytes += file.size;
    } catch (e) {
      errors.push(`${path.relative(STATE_DIR, file.path)}: ${(e as Error).message}`);
    }
  }

  return { ok: errors.length === 0, totalFiles: files.length, totalBytes, errors };
}

// ── Helpers ──

function collectStateFiles(): Array<{ path: string; size: number }> {
  return collectFilesRecursive(STATE_DIR).map(f => {
    try { return { path: f, size: fs.statSync(f).size }; } catch { return { path: f, size: 0 }; }
  });
}

function collectFilesRecursive(dir: string): string[] {
  const result: string[] = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectFilesRecursive(full));
    else result.push(full);
  }
  return result;
}

module.exports = { createSnapshot, listSnapshots, restoreSnapshot, exportState, importState, listExports, verifyIntegrity };
