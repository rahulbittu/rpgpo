// GPO API Docs — Auto-generate API documentation from server routes

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

export interface ApiRoute {
  method: string;
  path: string;
  part?: string;
  description?: string;
  category: string;
}

/**
 * Scan server.js and extract all API routes.
 */
export function scanRoutes(): ApiRoute[] {
  const serverFile = path.resolve(__dirname, '..', 'server.js');
  if (!fs.existsSync(serverFile)) return [];

  const code = fs.readFileSync(serverFile, 'utf-8');
  const routes: ApiRoute[] = [];

  // Match patterns like: req.url === '/api/...' && req.method === 'GET'
  const exactPattern = /req\.url\s*===\s*'(\/api\/[^']+)'\s*&&\s*req\.method\s*===\s*'(GET|POST|PUT|DELETE)'/g;
  let match: RegExpExecArray | null;
  while ((match = exactPattern.exec(code)) !== null) {
    routes.push({ method: match[2], path: match[1], category: categorize(match[1]) });
  }

  // Match patterns like: req.url?.match(/^\/api\/.../) && req.method === 'GET'
  const regexPattern = /req\.url\?\.match\(\/\^\\(\/api\/[^)]+)\$\/\)\s*&&\s*req\.method\s*===\s*'(GET|POST|PUT|DELETE)'/g;
  while ((match = regexPattern.exec(code)) !== null) {
    const routePath = match[1].replace(/\\\//g, '/').replace(/\(\[^\/\]\+\)/g, ':id').replace(/\(\?:\.\*\)\?/g, '');
    routes.push({ method: match[2], path: routePath, category: categorize(routePath) });
  }

  // Match patterns like: req.url?.startsWith('/api/...')
  const startsWithPattern = /req\.url\?\.startsWith\('(\/api\/[^']+)'\)/g;
  while ((match = startsWithPattern.exec(code)) !== null) {
    routes.push({ method: 'GET', path: match[1] + '*', category: categorize(match[1]) });
  }

  // Extract part comments for categorization
  const partComments = code.match(/\/\/\s*Part\s+\d+:.*$/gm) || [];
  let currentPart = '';
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const partMatch = lines[i].match(/\/\/\s*(Part\s+\d+:.*)/);
    if (partMatch) currentPart = partMatch[1].trim();
  }

  // Deduplicate
  const seen = new Set<string>();
  return routes.filter(r => {
    const key = `${r.method}:${r.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function categorize(path: string): string {
  if (path.includes('/intake')) return 'Tasks & Intake';
  if (path.includes('/chief-of-staff')) return 'Chief of Staff';
  if (path.includes('/topranker')) return 'TopRanker';
  if (path.includes('/deliverable')) return 'Deliverables';
  if (path.includes('/cost')) return 'Costs';
  if (path.includes('/analytics')) return 'Analytics';
  if (path.includes('/learning')) return 'Learning';
  if (path.includes('/template')) return 'Templates';
  if (path.includes('/schedule')) return 'Schedules';
  if (path.includes('/workflow')) return 'Workflows';
  if (path.includes('/compound')) return 'Compound Workflows';
  if (path.includes('/conversation')) return 'Conversations';
  if (path.includes('/chain')) return 'Task Chaining';
  if (path.includes('/backup')) return 'Backup';
  if (path.includes('/integration')) return 'Integrations';
  if (path.includes('/health') || path.includes('/onboarding')) return 'Health & Setup';
  if (path.includes('/rbac')) return 'Access Control';
  if (path.includes('/notification')) return 'Notifications';
  if (path.includes('/mission-control')) return 'Mission Control';
  if (path.includes('/structured-io')) return 'Structured I/O';
  if (path.includes('/provider')) return 'Providers';
  if (path.includes('/ai-io')) return 'AI I/O';
  if (path.includes('/runtime')) return 'Runtime';
  if (path.includes('/release')) return 'Releases';
  if (path.includes('/governance')) return 'Governance';
  if (path.includes('/audit')) return 'Audit';
  if (path.includes('/report')) return 'Reports';
  return 'General';
}

/**
 * Generate HTML documentation for all routes.
 */
export function generateDocsHtml(): string {
  const routes = scanRoutes();
  const byCategory: Record<string, ApiRoute[]> = {};
  for (const r of routes) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  }

  let html = '<h1>GPO API Documentation</h1>';
  html += `<p>Auto-generated from server.js. ${routes.length} routes across ${Object.keys(byCategory).length} categories.</p>`;

  for (const [cat, catRoutes] of Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b))) {
    html += `<h2>${cat}</h2><table style="width:100%;border-collapse:collapse;font-size:12px">`;
    html += '<tr style="border-bottom:2px solid #333"><th style="text-align:left;padding:4px">Method</th><th style="text-align:left;padding:4px">Path</th></tr>';
    for (const r of catRoutes) {
      const methodColor = r.method === 'GET' ? '#4ade80' : r.method === 'POST' ? '#60a5fa' : r.method === 'PUT' ? '#fbbf24' : '#f87171';
      html += `<tr style="border-bottom:1px solid #222"><td style="padding:4px"><span style="color:${methodColor};font-weight:700;font-family:monospace">${r.method}</span></td><td style="padding:4px;font-family:monospace">${r.path}</td></tr>`;
    }
    html += '</table>';
  }

  return html;
}

module.exports = { scanRoutes, generateDocsHtml };
