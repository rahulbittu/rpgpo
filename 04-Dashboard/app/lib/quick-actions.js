"use strict";
// GPO Quick Actions — Pre-built one-click actions for common operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuickActions = getQuickActions;
function getQuickActions() {
    return [
        { id: 'qa_morning_digest', label: 'Morning Digest', description: 'Generate today\'s morning briefing', category: 'report', endpoint: '/api/digest/morning', method: 'GET' },
        { id: 'qa_evening_wrap', label: 'Evening Wrap', description: 'Generate evening summary', category: 'report', endpoint: '/api/digest/evening', method: 'GET' },
        { id: 'qa_health_check', label: 'Health Check', description: 'Run system health check', category: 'maintenance', endpoint: '/api/health', method: 'GET' },
        { id: 'qa_auto_repair', label: 'Auto Repair', description: 'Fix common issues automatically', category: 'maintenance', endpoint: '/api/health/repair', method: 'POST' },
        { id: 'qa_backup', label: 'Create Backup', description: 'Snapshot current state', category: 'maintenance', endpoint: '/api/backup/snapshot', method: 'POST' },
        { id: 'qa_enrich', label: 'Enrich Knowledge', description: 'Extract insights from completed tasks', category: 'maintenance', endpoint: '/api/enrichment/run', method: 'POST' },
        { id: 'qa_ai_news', label: 'AI News', description: 'Get today\'s AI news', category: 'research', endpoint: '/api/intake/run', method: 'POST', body: { raw_request: 'Search the web for today\'s most important AI news. Include headlines, sources, and relevance.', domain: 'newsroom', urgency: 'high' } },
        { id: 'qa_job_search', label: 'Job Search', description: 'Find data engineering jobs', category: 'research', endpoint: '/api/intake/run', method: 'POST', body: { raw_request: 'Find the highest-paying remote data engineering jobs right now. Include salary, company, and requirements.', domain: 'career', urgency: 'normal' } },
        { id: 'qa_income_ideas', label: 'Income Ideas', description: 'Research passive income opportunities', category: 'research', endpoint: '/api/intake/run', method: 'POST', body: { raw_request: 'Research the top passive income ideas for data engineers in 2026. Include revenue estimates and first steps.', domain: 'wealthresearch', urgency: 'normal' } },
        { id: 'qa_analytics', label: 'Weekly Analytics', description: 'View 7-day performance', category: 'ops', endpoint: '/api/analytics/summary?days=7', method: 'GET' },
        { id: 'qa_cost_insights', label: 'Cost Insights', description: 'Get spending recommendations', category: 'ops', endpoint: '/api/cost-insights', method: 'GET' },
        { id: 'qa_suggestions', label: 'Smart Suggestions', description: 'Get personalized task suggestions', category: 'ops', endpoint: '/api/suggestions', method: 'GET' },
    ];
}
module.exports = { getQuickActions };
