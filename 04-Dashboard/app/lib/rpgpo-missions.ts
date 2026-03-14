// RPGPO Instance — Rahul Pitta's mission configurations
// This file is instance-specific. It registers Rahul's missions into the GPO framework.
// Other GPO instances would have their own equivalent file.

import type { ApprovalRule } from './types';

const { registerMission, DEFAULT_APPROVAL_RULES } = require('./missions') as {
  registerMission: (ctx: import('./types').MissionContext) => void;
  DEFAULT_APPROVAL_RULES: ApprovalRule[];
};

// ═══════════════════════════════════════════
// RPGPO Missions — Rahul's private office
// ═══════════════════════════════════════════

registerMission({
  domain: 'topranker',
  name: 'TopRanker',
  description: 'Community-ranked local business leaderboard — Expo/RN + Express + PostgreSQL',
  keyFiles: [
    'apps/mobile/app',
    'apps/mobile/components',
    'apps/mobile/hooks',
    'packages/api/src',
    'packages/shared',
  ],
  governedLoop: [
    'Audit current state',
    'Plan changes via Board deliberation',
    'Execute approved subtasks',
    'Builder writes code',
    'Review and approve changes',
    'Commit approved work',
  ],
  specialists: {
    'Mobile UI': 'React Native components and navigation',
    'API': 'Express REST endpoints and middleware',
    'Database': 'PostgreSQL schema, migrations, queries',
    'Search': 'Business search and ranking algorithms',
    'Performance': 'Startup time, memory, bundle size optimization',
  },
  sourceRepo: '02-Projects/TopRanker/source-repo',
  defaultModel: 'claude',
  boardRoles: ['CTO', 'Growth Strategist', 'QA Lead'],
  approvalRules: [
    ...DEFAULT_APPROVAL_RULES,
    { stage: 'implement', riskLevel: 'green', requiresApproval: false, reason: 'Green implementation auto-continues' },
  ],
});

registerMission({
  domain: 'careeregine',
  name: 'CareerEngine',
  description: 'AI-assisted career development and job search platform',
  keyFiles: [],
  governedLoop: ['Research', 'Plan', 'Execute', 'Review'],
  specialists: {
    'Strategy': 'Career strategy and positioning',
    'Content': 'Resume, cover letter, LinkedIn optimization',
  },
  approvalRules: DEFAULT_APPROVAL_RULES,
});

registerMission({
  domain: 'founder2founder',
  name: 'Founder2Founder',
  description: 'Founder community and knowledge sharing platform',
  keyFiles: [],
  governedLoop: ['Research', 'Plan', 'Execute', 'Review'],
  specialists: {
    'Community': 'Community building and engagement',
    'Content': 'Founder stories and insights',
  },
  approvalRules: DEFAULT_APPROVAL_RULES,
});

registerMission({
  domain: 'wealthresearch',
  name: 'WealthResearch',
  description: 'Personal investment research and financial analysis',
  keyFiles: [],
  governedLoop: ['Research', 'Analyze', 'Recommend', 'Review'],
  specialists: {
    'Analysis': 'Financial data analysis and modeling',
    'Research': 'Market research and due diligence',
  },
  approvalRules: [
    ...DEFAULT_APPROVAL_RULES,
    { stage: 'strategy', riskLevel: 'yellow', requiresApproval: true, reason: 'Financial recommendations require approval' },
  ],
});

registerMission({
  domain: 'newsroom',
  name: 'Newsroom',
  description: 'News aggregation, analysis, and editorial pipeline',
  keyFiles: [],
  governedLoop: ['Source', 'Analyze', 'Draft', 'Review', 'Publish'],
  specialists: {
    'Research': 'Source verification and fact-checking',
    'Editorial': 'Content curation and editorial voice',
  },
  approvalRules: DEFAULT_APPROVAL_RULES,
});

registerMission({
  domain: 'screenwriting',
  name: 'Screenwriting',
  description: 'Screenplay development and creative writing pipeline',
  keyFiles: [],
  governedLoop: ['Outline', 'Draft', 'Review', 'Revise'],
  specialists: {
    'Story': 'Story structure and character development',
    'Dialogue': 'Dialogue and scene writing',
  },
  approvalRules: DEFAULT_APPROVAL_RULES,
});

registerMission({
  domain: 'music',
  name: 'Music',
  description: 'Music production, composition, and creative projects',
  keyFiles: [],
  governedLoop: ['Ideate', 'Compose', 'Produce', 'Review'],
  specialists: {
    'Composition': 'Melody, harmony, and arrangement',
    'Production': 'Mixing, mastering, and sound design',
  },
  approvalRules: DEFAULT_APPROVAL_RULES,
});

registerMission({
  domain: 'personalops',
  name: 'PersonalOps',
  description: 'Personal operations, scheduling, and life management',
  keyFiles: [],
  governedLoop: ['Capture', 'Prioritize', 'Execute', 'Review'],
  specialists: {
    'Planning': 'Task prioritization and scheduling',
    'Automation': 'Workflow automation and reminders',
  },
  approvalRules: DEFAULT_APPROVAL_RULES,
});
