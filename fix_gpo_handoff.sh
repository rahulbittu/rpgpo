#!/usr/bin/env bash
set -euo pipefail

cd /Users/rpgpo/Projects/RPGPO

mkdir -p .gpo-handoff/from-claude .gpo-handoff/to-claude .gpo-handoff/archive

if [ -f gpo-handoff-relay.mjs ]; then
  cp gpo-handoff-relay.mjs "gpo-handoff-relay.mjs.bak.$(date +%Y%m%d_%H%M%S)"
fi

cat > gpo-handoff-relay.mjs <<'JS'
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment.");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ROOT = path.resolve(__dirname, ".gpo-handoff");
const REQ_DIR = path.join(ROOT, "from-claude");
const RES_DIR = path.join(ROOT, "to-claude");
const ARC_DIR = path.join(ROOT, "archive");
const LOG_FILE = path.join(ROOT, "handoff-log.md");
const PROJECT_CONTEXT = path.join(ROOT, "project-context.md");
const CLAUDE_STATE = path.join(ROOT, "claude-state.md");
const SEEN_FILE = path.join(ROOT, ".seen.json");

for (const dir of [ROOT, REQ_DIR, RES_DIR, ARC_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "# Handoff Log\n\n");
if (!fs.existsSync(PROJECT_CONTEXT)) fs.writeFileSync(PROJECT_CONTEXT, "# Project Context\n\n");
if (!fs.existsSync(CLAUDE_STATE)) fs.writeFileSync(CLAUDE_STATE, "# Claude State\n\n");
if (!fs.existsSync(SEEN_FILE)) fs.writeFileSync(SEEN_FILE, JSON.stringify({ seen: [] }, null, 2));

function readSeen() {
  return JSON.parse(fs.readFileSync(SEEN_FILE, "utf8"));
}
function writeSeen(data) {
  fs.writeFileSync(SEEN_FILE, JSON.stringify(data, null, 2));
}
function log(msg) {
  const line = `- ${new Date().toISOString()} ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  process.stdout.write(line);
}
function buildSystemPrompt() {
  const projectContext = fs.existsSync(PROJECT_CONTEXT) ? fs.readFileSync(PROJECT_CONTEXT, "utf8") : "";
  const claudeState = fs.existsSync(CLAUDE_STATE) ? fs.readFileSync(CLAUDE_STATE, "utf8") : "";
  return `
You are acting as a constrained GPO collaborator.

Your job:
- produce rigorous, implementation-ready guidance
- preserve existing working functionality
- do not drift into generic advice
- be explicit and actionable

===== PROJECT CONTEXT =====
${projectContext}

===== CLAUDE STATE =====
${claudeState}

Output format:
# ChatGPT Response

## Decision
## Recommended Direction
## Required Modules
## APIs
## UI
## Docs
## Acceptance Criteria
## Hardening Notes
`.trim();
}
function isRequestFile(name) {
  return name.endsWith(".request.md") || name.endsWith("-request.md");
}
function requestToResponseName(reqFile) {
  if (reqFile.endsWith(".request.md")) return reqFile.replace(".request.md", ".response.md");
  if (reqFile.endsWith("-request.md")) return reqFile.replace("-request.md", "-response.md");
  return `${reqFile}.response.md`;
}
function listRequestFiles() {
  return fs.readdirSync(REQ_DIR).filter(isRequestFile).sort();
}
function responsePathFor(reqFile) {
  return path.join(RES_DIR, requestToResponseName(reqFile));
}
function archiveFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const base = path.basename(filePath);
  const target = path.join(ARC_DIR, `${Date.now()}-${base}`);
  fs.renameSync(filePath, target);
}
async function processRequest(reqFile) {
  const reqPath = path.join(REQ_DIR, reqFile);
  const resPath = responsePathFor(reqFile);
  const requestBody = fs.readFileSync(reqPath, "utf8");

  log(`Processing ${reqFile}`);

  const response = await client.responses.create({
    model: "gpt-5",
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: buildSystemPrompt() }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: requestBody }],
      },
    ],
  });

  const text = response.output_text?.trim() || "No output returned.";
  const tmpPath = `${resPath}.tmp`;
  fs.writeFileSync(tmpPath, text + "\n");
  fs.renameSync(tmpPath, resPath);

  log(`Wrote response ${path.basename(resPath)} to to-claude`);

  archiveFile(reqPath);
  log(`Archived request ${reqFile}`);
}
async function tick() {
  const state = readSeen();
  const files = listRequestFiles();

  for (const reqFile of files) {
    if (state.seen.includes(reqFile)) continue;
    try {
      await processRequest(reqFile);
      state.seen.push(reqFile);
      writeSeen(state);
    } catch (err) {
      log(`ERROR on ${reqFile}: ${err?.message || String(err)}`);
    }
  }
}

log("Relay started");
log(`ROOT=${ROOT}`);
log(`REQ_DIR=${REQ_DIR}`);
log(`RES_DIR=${RES_DIR}`);
log(`ARC_DIR=${ARC_DIR}`);

tick().catch((err) => log(`Initial tick failure: ${err?.message || String(err)}`));
setInterval(() => {
  tick().catch((err) => log(`Tick failure: ${err?.message || String(err)}`));
}, 3000);
JS

# rename old-style stuck file if present
if [ -f .gpo-handoff/from-claude/validation-review-request.md ]; then
  mv .gpo-handoff/from-claude/validation-review-request.md .gpo-handoff/from-claude/validation-review.request.md
fi

npm install openai

echo
echo "Starting relay..."
echo "Make sure OPENAI_API_KEY is exported in this shell."
echo

node gpo-handoff-relay.mjs
