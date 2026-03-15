"use strict";
// GPO Suggestions Engine — Proactive task suggestions based on patterns and priorities
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuggestions = getSuggestions;
/**
 * Generate smart suggestions based on current context.
 */
function getSuggestions(limit = 5) {
    const suggestions = [];
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    // Time-based suggestions
    if (hour >= 6 && hour <= 9) {
        suggestions.push({
            id: 'sug_morning_news', title: 'Morning News Brief',
            description: 'Start the day with current AI and tech news',
            prompt: 'Search the web for the most important AI and technology news from the last 24 hours. Include specific headlines, sources, and why each matters.',
            domain: 'newsroom', urgency: 'high', confidence: 0.9, source: 'time_of_day',
        });
        suggestions.push({
            id: 'sug_morning_plan', title: 'Daily Plan',
            description: 'Plan today\'s priorities and time blocks',
            prompt: 'Help me plan today. Consider my priorities: TopRanker MVP shipping, passive income research, data engineering career growth. Create specific time blocks.',
            domain: 'chief_of_staff', urgency: 'normal', confidence: 0.85, source: 'time_of_day',
        });
    }
    if (hour >= 17 && hour <= 21) {
        suggestions.push({
            id: 'sug_evening_wrap', title: 'Evening Wrap-Up',
            description: 'Summarize what was accomplished today',
            prompt: 'Summarize today\'s accomplishments, decisions made, and items to carry over to tomorrow. Highlight any blockers or pending approvals.',
            domain: 'chief_of_staff', urgency: 'normal', confidence: 0.85, source: 'time_of_day',
        });
    }
    // Weekly suggestions
    if (dayOfWeek === 1) { // Monday
        suggestions.push({
            id: 'sug_weekly_review', title: 'Weekly Priority Review',
            description: 'Review and update priorities for the week',
            prompt: 'Review last week\'s progress on all missions and set priorities for this week. Focus on TopRanker, income research, and career growth.',
            domain: 'chief_of_staff', urgency: 'normal', confidence: 0.8, source: 'recurring',
        });
    }
    if (dayOfWeek === 5) { // Friday
        suggestions.push({
            id: 'sug_weekly_wrap', title: 'Weekly Summary',
            description: 'Compile weekly achievements and learnings',
            prompt: 'Compile a summary of this week\'s work across all missions. Highlight wins, learnings, and items for next week.',
            domain: 'chief_of_staff', urgency: 'normal', confidence: 0.75, source: 'recurring',
        });
    }
    // Priority-based suggestions (always available)
    suggestions.push({
        id: 'sug_income_research', title: 'Passive Income Research',
        description: 'Research new passive income opportunities',
        prompt: 'Research the latest passive income opportunities for data engineers in 2026. Focus on SaaS, APIs, and digital products with specific revenue estimates.',
        domain: 'wealthresearch', urgency: 'normal', confidence: 0.7, source: 'priority',
    });
    suggestions.push({
        id: 'sug_job_market', title: 'Job Market Update',
        description: 'Current data engineering job market analysis',
        prompt: 'What are the highest-paying remote data engineering jobs right now? Include salary ranges, companies, and required skills.',
        domain: 'careeregine', urgency: 'normal', confidence: 0.65, source: 'priority',
    });
    suggestions.push({
        id: 'sug_topranker_next', title: 'TopRanker Next Step',
        description: 'Identify the next most impactful TopRanker task',
        prompt: 'What is the single most impactful thing to do next for TopRanker? Consider: MVP features needed, user growth, ranking algorithm, business verification flow.',
        domain: 'topranker', urgency: 'normal', confidence: 0.6, source: 'priority',
    });
    // Check recent completed tasks for follow-up suggestions
    try {
        const intake = require('./intake');
        const recentDone = intake.getAllTasks().filter((t) => t.status === 'done')
            .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
            .slice(0, 3);
        for (const task of recentDone) {
            if (task.domain === 'newsroom') {
                suggestions.push({
                    id: 'sug_followup_' + task.task_id, title: 'Follow Up: Deep Dive',
                    description: `Deep dive into key findings from "${(task.title || '').slice(0, 40)}"`,
                    prompt: `Based on the research from "${task.title}", identify the most important finding and do a detailed analysis with specific recommendations.`,
                    domain: task.domain, urgency: 'normal', confidence: 0.55, source: 'follow_up',
                });
            }
        }
    }
    catch { /* non-fatal */ }
    // Sort by confidence and return top N
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}
module.exports = { getSuggestions };
//# sourceMappingURL=suggestions-engine.js.map