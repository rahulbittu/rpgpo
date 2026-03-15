import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment.");
  process.exit(1);
}

const ROOT = path.join(process.cwd(), ".gpo-handoff");
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
function listRequestFiles() {
  return fs
    .readdirSync(REQ_DIR)
    .filter((f) => f.endsWith(".request.md"))
    .sort();
}
function responsePathFor(reqFile) {
  return path.join(RES_DIR, reqFile.replace(".request.md", ".response.md"));
}
function archiveFile(filePath) {
  const base = path.basename(filePath);
  const target = path.join(ARC_DIR, base);
  if (fs.existsSync(filePath)) fs.renameSync(filePath, target);
}
function buildSystemPrompt() {
  const projectContext = fs.readFileSync(PROJECT_CONTEXT, "utf8");
  const claudeState = fs.readFileSync(CLAUDE_STATE, "utf8");

  return `
You are acting as the architecture critic and next-part designer for the GPO project.

Your job:
- produce rigorous, implementation-ready guidance
- preserve existing working functionality
- prefer typed, enterprise-grade, contract-driven designs
- be explicit about modules, APIs, UI, docs, acceptance criteria, and hardening
- do not drift into generic advice

Repository-grounded project context follows.

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
  fs.writeFileSync(resPath, text + "\n");
  log(`Wrote response ${path.basename(resPath)}`);

  archiveFile(reqPath);
  archiveFile(resPath);
  log(`Archived ${reqFile} and response`);
}

async function tick() {
  const state = readSeen();
  const files = listRequestFiles();

  for (const reqFile of files) {
    if (!state.seen.includes(reqFile)) {
      state.seen.push(reqFile);
      writeSeen(state);
      try {
        await processRequest(reqFile);
      } catch (err) {
        log(`ERROR on ${reqFile}: ${err.message}`);
      }
    }
  }
}

log("Relay started. Watching .gpo-handoff/from-claude");
setInterval(() => {
  tick().catch((err) => log(`Tick failure: ${err.message}`));
}, 3000);
