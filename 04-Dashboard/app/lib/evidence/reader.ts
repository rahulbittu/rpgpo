// GPO Evidence Reader — Read structured extraction evidence files

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EVIDENCE_BASE = path.resolve(__dirname, '..', '..', '..', 'state', 'evidence');

function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

export interface StructuredEvidenceEntry {
  recorded_at: string;
  deliverableId: string;
  taskId: string;
  schema: { contractId: string; version: string; schemaHash: string; schemaSummary: string };
  prompt: { promptId: string; mode: string };
  extraction: { ok: boolean; usedMode: string; attempts: number; errors?: string[]; valueKeys: string[]; rawLength: number; tokensIn?: number; tokensOut?: number; durationMs?: number };
  mapping: { updatedFields: string[]; skippedFields: string[]; rejectedFields: string[]; diffCount: number } | null;
}

/** Get latest structured evidence for a deliverable */
export function getLatestEvidence(deliverableId: string): StructuredEvidenceEntry | null {
  const dir = path.join(EVIDENCE_BASE, sanitize(deliverableId));
  if (!fs.existsSync(dir)) return null;

  // Scan all task subdirectories
  let latest: StructuredEvidenceEntry | null = null;
  let latestTime = 0;

  try {
    const taskDirs = fs.readdirSync(dir).filter((d: string) => {
      const full = path.join(dir, d);
      return fs.statSync(full).isDirectory();
    });

    for (const taskDir of taskDirs) {
      const taskPath = path.join(dir, taskDir);
      const files = fs.readdirSync(taskPath).filter((f: string) => f.startsWith('structured-') && f.endsWith('.json'));

      for (const file of files) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(taskPath, file), 'utf-8'));
          const ts = new Date(content.recorded_at).getTime();
          if (ts > latestTime) {
            latestTime = ts;
            latest = content;
          }
        } catch { /* skip corrupt */ }
      }
    }
  } catch { /* */ }

  return latest;
}

/** Get evidence for a specific deliverable + task */
export function getTaskEvidence(deliverableId: string, taskId: string): StructuredEvidenceEntry[] {
  const dir = path.join(EVIDENCE_BASE, sanitize(deliverableId), sanitize(taskId));
  if (!fs.existsSync(dir)) return [];

  const entries: StructuredEvidenceEntry[] = [];
  try {
    const files = fs.readdirSync(dir).filter((f: string) => f.startsWith('structured-') && f.endsWith('.json'));
    for (const file of files) {
      try {
        entries.push(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')));
      } catch { /* skip corrupt */ }
    }
  } catch { /* */ }

  return entries.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
}

module.exports = { getLatestEvidence, getTaskEvidence };
