// GPO Mission Acceptance Suite — 150 seeded scenarios across 15 engines

import type { MissionAcceptanceCase, MissionAcceptanceRun } from './types';

function uid(): string { return 'ma_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function c(engineId: string, request: string, deliverable: string, approval: string, action: string, tools: string[], failureIf: string): MissionAcceptanceCase {
  return { case_id: `mac_${engineId}_${uid()}`, engine_id: engineId, request, expected_deliverable: deliverable, expected_approval: approval, expected_action: action, required_tools: tools, failure_if: failureIf, status: 'seeded' };
}

/** Get all 150 seeded acceptance cases */
export function getCases(): MissionAcceptanceCase[] {
  return [
    // ── Newsroom (10) ──
    c('newsroom', 'Get top 10 Hyderabad news in the last 24 hours with one-line summaries and source links', 'Ranked list of 10 news items with summaries and URLs', 'none', 'surface_ranked_list', ['web_search'], 'No ranked items or no source links visible'),
    c('newsroom', 'Morning tech news briefing — top 5 AI stories', 'Ranked tech/AI stories with summaries', 'none', 'surface_briefing', ['web_search'], 'No stories surfaced'),
    c('newsroom', 'What happened in Indian cricket today?', 'Cricket news summary with scores and links', 'none', 'surface_ranked_list', ['web_search'], 'No cricket results'),
    c('newsroom', 'Breaking news alert: global markets', 'Market movement summary with key data', 'none', 'surface_briefing', ['web_search'], 'No market data'),
    c('newsroom', 'Weekly Telangana government news digest', 'Digest with 10+ government news items', 'none', 'surface_ranked_list', ['web_search'], 'No items or no date range'),
    c('newsroom', 'Top 5 Bollywood entertainment news today', 'Entertainment headlines with summaries', 'none', 'surface_ranked_list', ['web_search'], 'No entertainment items'),
    c('newsroom', 'Startup funding news this week — India focus', 'Funding rounds with amounts and startups', 'none', 'surface_ranked_list', ['web_search'], 'No funding data'),
    c('newsroom', 'Climate and weather alerts for Hyderabad', 'Weather summary with alerts', 'none', 'surface_briefing', ['web_search'], 'No weather data'),
    c('newsroom', 'Top trending stories on social media today', 'Trending topics with context', 'none', 'surface_ranked_list', ['web_search'], 'No trends surfaced'),
    c('newsroom', 'Latest Supreme Court rulings summary', 'Legal news digest with case summaries', 'none', 'surface_ranked_list', ['web_search'], 'No legal items'),

    // ── Shopping (10) ──
    c('shopping', 'Find the best glycolic acid + SPF 50 cream, top 3 with pros/cons and buy path', 'Ranked products with price, pros/cons, purchase links', 'approval_to_buy', 'surface_comparison', ['web_search', 'comparison'], 'No products or no purchase path'),
    c('shopping', 'Best wireless noise-cancelling earbuds under $100', 'Top 5 earbuds with price comparison', 'approval_to_buy', 'surface_comparison', ['web_search'], 'No price data'),
    c('shopping', 'Compare iPhone 16 Pro vs Samsung S25 Ultra', 'Feature-by-feature comparison with recommendation', 'none', 'surface_comparison', ['web_search'], 'No comparison table'),
    c('shopping', 'Best standing desk for home office under $500', 'Top 3 desks with dimensions, price, and reviews', 'approval_to_buy', 'surface_comparison', ['web_search'], 'No product details'),
    c('shopping', 'Find best protein powder for muscle gain — vegetarian', 'Ranked protein powders with nutrition facts', 'approval_to_buy', 'surface_comparison', ['web_search'], 'No nutrition data'),
    c('shopping', 'Best air purifier for 500 sq ft room in Hyderabad', 'Top 3 purifiers with CADR and price', 'approval_to_buy', 'surface_comparison', ['web_search'], 'No specifications'),
    c('shopping', 'Compare top 3 robot vacuums with mopping', 'Feature comparison with pros/cons', 'approval_to_buy', 'surface_comparison', ['web_search'], 'No comparison'),
    c('shopping', 'Best gifts for a 5-year-old birthday under $30', 'Gift ideas ranked by age-appropriateness', 'none', 'surface_ranked_list', ['web_search'], 'No ranked items'),
    c('shopping', 'Find the cheapest flight Hyderabad to Goa next month', 'Flight options with prices and airlines', 'approval_to_buy', 'surface_comparison', ['web_search'], 'No flight data'),
    c('shopping', 'Best mechanical keyboard for programming under $150', 'Top 3 keyboards with switch types and price', 'approval_to_buy', 'surface_comparison', ['web_search'], 'No product details'),

    // ── Startup (10) ──
    c('startup', 'Add a new button to TopRanker and show diff, preview, and approval gate', 'Code change with diff and approval', 'explicit_approval', 'approve_and_deploy', ['code_generation'], 'No diff or no approval gate'),
    c('startup', 'Fix the login page bug where password field clears on error', 'Bug fix with changed files and test results', 'explicit_approval', 'approve_and_deploy', ['code_generation', 'testing'], 'No code changes'),
    c('startup', 'Add dark mode support to the settings page', 'CSS/component changes with preview', 'explicit_approval', 'approve_and_deploy', ['code_generation'], 'No visible changes'),
    c('startup', 'Write unit tests for the user registration flow', 'Test files with pass/fail results', 'operator_review', 'approve_tests', ['code_generation', 'testing'], 'No test files'),
    c('startup', 'Refactor the API rate limiter to support per-tenant limits', 'Architecture change with diff', 'explicit_approval', 'approve_and_deploy', ['code_generation'], 'No refactoring visible'),
    c('startup', 'Create a new REST endpoint for user preferences', 'New endpoint with handler and route', 'explicit_approval', 'approve_and_deploy', ['code_generation'], 'No endpoint created'),
    c('startup', 'Optimize database queries on the leaderboard page', 'Performance improvement with before/after metrics', 'operator_review', 'approve_optimization', ['code_generation'], 'No metrics shown'),
    c('startup', 'Add pagination to the business listing API', 'Paginated endpoint with documentation', 'explicit_approval', 'approve_and_deploy', ['code_generation'], 'No pagination'),
    c('startup', 'Set up CI/CD pipeline for TopRanker staging', 'Pipeline config with deployment steps', 'explicit_approval', 'approve_pipeline', ['devops'], 'No pipeline config'),
    c('startup', 'Create a webhook integration for Slack notifications', 'Integration code with webhook handler', 'explicit_approval', 'approve_and_deploy', ['code_generation'], 'No webhook handler'),

    // ── Legal (10) ──
    c('legal', 'Read 15 docs and draft one final complaint letter with extracted facts and evidence mapping', 'Complaint letter with fact extraction', 'operator_review', 'review_and_export', ['document_analysis'], 'No draft or no facts extracted'),
    c('legal', 'Analyze this lease agreement and flag unfavorable clauses', 'Clause analysis with risk ratings', 'operator_review', 'review_analysis', ['document_analysis'], 'No clauses identified'),
    c('legal', 'Draft an NDA for a freelance contractor', 'NDA document with key terms', 'operator_review', 'review_and_export', ['drafting'], 'No document produced'),
    c('legal', 'Compare these two vendor contracts and highlight differences', 'Side-by-side comparison with differences', 'operator_review', 'review_comparison', ['document_analysis'], 'No comparison'),
    c('legal', 'Summarize the key terms of this employment agreement', 'Term summary with obligations', 'none', 'surface_summary', ['document_analysis'], 'No summary'),
    c('legal', 'Draft a privacy policy for a mobile app', 'Privacy policy document', 'operator_review', 'review_and_export', ['drafting'], 'No policy drafted'),
    c('legal', 'Extract all dates and deadlines from this contract', 'Timeline of deadlines with context', 'none', 'surface_timeline', ['document_analysis'], 'No dates extracted'),
    c('legal', 'Draft a response to this cease and desist letter', 'Response letter with legal basis', 'explicit_approval', 'review_and_export', ['drafting'], 'No response drafted'),
    c('legal', 'Analyze GDPR compliance for our data processing', 'Compliance checklist with gaps', 'operator_review', 'review_analysis', ['analysis'], 'No checklist'),
    c('legal', 'Draft board resolution for new share issuance', 'Board resolution document', 'explicit_approval', 'review_and_export', ['drafting'], 'No resolution drafted'),

    // ── Screenwriting (10) ──
    c('screenwriting', 'Turn a raw Telugu idea into one-page premise, then beat sheet', 'Premise + beat sheet document', 'operator_review', 'review_creative_draft', ['creative_writing'], 'No premise or no beat sheet'),
    c('screenwriting', 'Write a 5-minute short film script about a chai vendor', 'Short film screenplay with formatting', 'operator_review', 'review_creative_draft', ['creative_writing'], 'No script'),
    c('screenwriting', 'Create character profiles for a web series cast of 4', 'Character bios with arcs', 'none', 'review_creative_draft', ['creative_writing'], 'No profiles'),
    c('screenwriting', 'Write a cold open for a thriller TV pilot', 'Cold open scene with stage directions', 'operator_review', 'review_creative_draft', ['creative_writing'], 'No scene written'),
    c('screenwriting', 'Develop a 3-act structure for a romantic comedy', '3-act outline with turning points', 'none', 'review_creative_draft', ['creative_writing'], 'No structure'),
    c('screenwriting', 'Write dialogue for a tense interrogation scene', 'Formatted dialogue scene', 'operator_review', 'review_creative_draft', ['creative_writing'], 'No dialogue'),
    c('screenwriting', 'Create a mood board description for a sci-fi film', 'Visual mood board with references', 'none', 'review_creative_draft', ['creative_writing'], 'No mood board'),
    c('screenwriting', 'Adapt a news article into a documentary outline', 'Documentary structure with segments', 'operator_review', 'review_creative_draft', ['creative_writing'], 'No outline'),
    c('screenwriting', 'Write a pitch document for a streaming series', 'Pitch doc with logline, synopsis, character', 'operator_review', 'review_and_export', ['creative_writing'], 'No pitch document'),
    c('screenwriting', 'Create a shot list for the opening sequence', 'Numbered shot list with descriptions', 'none', 'review_creative_draft', ['creative_writing'], 'No shot list'),

    // ── Music (10) ──
    c('music', 'Write lyrics for a Telugu folk-pop fusion song', 'Lyrics with verse/chorus structure', 'operator_review', 'review_creative_draft', ['creative_writing'], 'No lyrics'),
    c('music', 'Create a chord progression for a lo-fi beat', 'Chord chart with tempo and feel', 'none', 'review_creative_draft', ['music_theory'], 'No chord chart'),
    c('music', 'Analyze the structure of a popular Bollywood song', 'Structural breakdown with sections', 'none', 'surface_analysis', ['music_theory'], 'No analysis'),
    c('music', 'Write a jingle for a food delivery app (30 sec)', 'Jingle lyrics with melody notes', 'operator_review', 'review_creative_draft', ['creative_writing'], 'No jingle'),
    c('music', 'Suggest 5 samples that would work for a hip-hop beat', 'Sample recommendations with BPM', 'none', 'surface_recommendation', ['research'], 'No recommendations'),
    c('music', 'Create a setlist for a 45-minute acoustic set', 'Ordered setlist with transitions', 'operator_review', 'review_creative_draft', ['planning'], 'No setlist'),
    c('music', 'Write a song concept for a motivational anthem', 'Concept doc with theme, mood, and hook ideas', 'none', 'review_creative_draft', ['creative_writing'], 'No concept'),
    c('music', 'Transpose a song from C major to G major', 'Transposed chord/melody notation', 'none', 'surface_document', ['music_theory'], 'No transposition'),
    c('music', 'Review and polish these rough lyrics', 'Polished lyrics with edit notes', 'operator_review', 'review_creative_draft', ['editing'], 'No edits applied'),
    c('music', 'Create a practice schedule for learning guitar in 3 months', 'Weekly practice plan with milestones', 'none', 'surface_plan', ['planning'], 'No plan'),

    // ── Calendar (10) ──
    c('calendar', 'Find the best 3 deep-work slots this week and propose calendar updates', 'Time slot recommendations with calendar diff', 'explicit_approval', 'approve_schedule', ['scheduling'], 'No slots recommended'),
    c('calendar', 'Schedule a 30-min team standup Mon-Fri at the best available time', 'Recurring meeting proposal', 'explicit_approval', 'approve_schedule', ['scheduling'], 'No meeting proposed'),
    c('calendar', 'Review my calendar for next week and flag overloaded days', 'Analysis with overload warnings', 'none', 'surface_analysis', ['scheduling'], 'No analysis'),
    c('calendar', 'Block 2 hours daily for exercise this week', 'Calendar block proposal', 'explicit_approval', 'approve_schedule', ['scheduling'], 'No blocks proposed'),
    c('calendar', 'Find a 1-hour lunch slot with 3 people next Tuesday', 'Available slot with conflicts noted', 'explicit_approval', 'approve_schedule', ['scheduling'], 'No slot found'),
    c('calendar', 'Reschedule all Thursday meetings to Friday', 'Reschedule proposal with conflicts', 'explicit_approval', 'approve_schedule', ['scheduling'], 'No reschedule plan'),
    c('calendar', 'Create a time audit for last week', 'Time breakdown by category', 'none', 'surface_analysis', ['analysis'], 'No audit'),
    c('calendar', 'Set up a weekly review block every Sunday 6pm', 'Recurring event proposal', 'explicit_approval', 'approve_schedule', ['scheduling'], 'No proposal'),
    c('calendar', 'Identify scheduling conflicts in the next 2 weeks', 'Conflict list with resolution options', 'none', 'surface_analysis', ['scheduling'], 'No conflicts identified'),
    c('calendar', 'Propose optimal meeting-free focus blocks for this month', 'Focus block recommendations', 'explicit_approval', 'approve_schedule', ['scheduling'], 'No recommendations'),

    // ── Personal Chief of Staff (10) ──
    c('chief_of_staff', 'Give me my morning briefing with priorities and blockers', 'Briefing with prioritized action items', 'none', 'surface_briefing', ['briefing'], 'No briefing surfaced'),
    c('chief_of_staff', 'What should I focus on today based on my current projects?', 'Prioritized focus list with reasoning', 'none', 'surface_action_plan', ['prioritization'], 'No priorities'),
    c('chief_of_staff', 'Summarize what happened across all missions yesterday', 'Cross-mission daily summary', 'none', 'surface_briefing', ['briefing'], 'No summary'),
    c('chief_of_staff', 'Review my pending approvals and recommend which to handle first', 'Approval triage with priority order', 'none', 'surface_recommendation', ['prioritization'], 'No triage'),
    c('chief_of_staff', 'Prepare a weekly review summary for all active projects', 'Weekly review document', 'none', 'surface_briefing', ['briefing'], 'No review'),
    c('chief_of_staff', 'What are the top 3 risks across my current initiatives?', 'Risk assessment with mitigations', 'none', 'surface_analysis', ['analysis'], 'No risks identified'),
    c('chief_of_staff', 'Draft talking points for my investor meeting tomorrow', 'Talking points document', 'operator_review', 'review_and_export', ['drafting'], 'No talking points'),
    c('chief_of_staff', 'Create a delegation plan for the tasks I cannot handle this week', 'Delegation plan with assignments', 'operator_review', 'review_action_plan', ['planning'], 'No plan'),
    c('chief_of_staff', 'Analyze my task completion rate this month and suggest improvements', 'Productivity analysis with recommendations', 'none', 'surface_analysis', ['analysis'], 'No analysis'),
    c('chief_of_staff', 'Prepare an end-of-day handoff for tomorrow morning', 'Handoff document with status and next steps', 'none', 'surface_briefing', ['briefing'], 'No handoff'),

    // ── Career (10) ──
    c('career', 'Polish my resume for a senior product manager role', 'Polished resume with role-specific tailoring', 'operator_review', 'review_and_export', ['document_generation'], 'No resume produced'),
    c('career', 'Write a cover letter for this job posting', 'Cover letter tailored to posting', 'operator_review', 'review_and_export', ['writing'], 'No cover letter'),
    c('career', 'Prepare 5 behavioral interview questions with STAR answers', 'Q&A document with structured answers', 'none', 'surface_document', ['coaching'], 'No Q&A'),
    c('career', 'Analyze this job description and map my skills to requirements', 'Skills gap analysis with recommendations', 'none', 'surface_analysis', ['analysis'], 'No analysis'),
    c('career', 'Create a LinkedIn summary for a tech entrepreneur', 'LinkedIn summary with keywords', 'operator_review', 'review_and_export', ['writing'], 'No summary'),
    c('career', 'Research salary range for Staff Engineer in Hyderabad', 'Salary data with sources and negotiation tips', 'none', 'surface_recommendation', ['research'], 'No salary data'),
    c('career', 'Draft a professional resignation letter', 'Resignation letter with notice period', 'operator_review', 'review_and_export', ['drafting'], 'No letter'),
    c('career', 'Create a 90-day plan for my new VP role', '90-day plan with milestones', 'operator_review', 'review_action_plan', ['planning'], 'No plan'),
    c('career', 'Suggest 5 side projects that strengthen my ML portfolio', 'Project ideas with skill mapping', 'none', 'surface_recommendation', ['research'], 'No suggestions'),
    c('career', 'Review my GitHub profile and suggest improvements', 'Profile review with actionable improvements', 'none', 'surface_recommendation', ['analysis'], 'No review'),

    // ── Health (10) ──
    c('health', 'Create a 4-week strength training program for a beginner', 'Weekly workout plan with exercises', 'none', 'surface_plan', ['planning'], 'No program created'),
    c('health', 'Build a meal plan for 1800 calories/day vegetarian diet', 'Daily meal plan with macros', 'none', 'surface_plan', ['planning'], 'No meal plan'),
    c('health', 'Track my sleep pattern and suggest improvements', 'Sleep analysis with recommendations', 'none', 'surface_recommendation', ['tracking'], 'No analysis'),
    c('health', 'Create a morning routine for better productivity', 'Timed morning routine with steps', 'none', 'surface_plan', ['planning'], 'No routine'),
    c('health', 'Design a couch-to-5K running plan for 8 weeks', 'Progressive running schedule', 'none', 'surface_plan', ['planning'], 'No running plan'),
    c('health', 'Analyze my water intake habits and suggest a hydration plan', 'Hydration plan with reminders', 'none', 'surface_plan', ['tracking'], 'No plan'),
    c('health', 'Create a stretching routine for desk workers (15 min)', 'Stretching sequence with instructions', 'none', 'surface_plan', ['planning'], 'No routine'),
    c('health', 'Build a habit tracker for 5 daily habits', 'Habit tracking setup with milestones', 'none', 'surface_plan', ['tracking'], 'No tracker'),
    c('health', 'Compare yoga vs pilates for back pain relief', 'Comparison with recommendation', 'none', 'surface_recommendation', ['research'], 'No comparison'),
    c('health', 'Create a stress management plan with daily practices', 'Stress management plan with techniques', 'none', 'surface_plan', ['planning'], 'No plan'),

    // ── Finance (10) ──
    c('finance', 'Analyze whether I should invest in index funds vs individual stocks', 'Analysis with pros/cons and recommendation', 'operator_review', 'review_analysis', ['analysis'], 'No analysis'),
    c('finance', 'Create a monthly budget for a 15 lakh annual salary', 'Budget breakdown with categories', 'none', 'surface_plan', ['planning'], 'No budget'),
    c('finance', 'Compare top 5 savings accounts in India by interest rate', 'Ranked comparison with rates', 'none', 'surface_comparison', ['research'], 'No comparison'),
    c('finance', 'Calculate my tax liability for this financial year', 'Tax calculation with deductions', 'operator_review', 'review_analysis', ['analysis'], 'No calculation'),
    c('finance', 'Research SIP vs lumpsum investment for 5-year goal', 'Analysis with projection scenarios', 'none', 'surface_recommendation', ['research'], 'No analysis'),
    c('finance', 'Create a debt repayment strategy for 3 loans', 'Repayment plan with timeline', 'operator_review', 'review_action_plan', ['planning'], 'No plan'),
    c('finance', 'Analyze my spending patterns from last 3 months', 'Spending analysis with categories', 'none', 'surface_analysis', ['analysis'], 'No analysis'),
    c('finance', 'Compare health insurance plans for a family of 4', 'Plan comparison with coverage details', 'operator_review', 'surface_comparison', ['research'], 'No comparison'),
    c('finance', 'Build an emergency fund plan targeting 6 months expenses', 'Savings plan with milestones', 'none', 'surface_plan', ['planning'], 'No plan'),
    c('finance', 'Research crypto tax implications in India', 'Tax guide with examples', 'none', 'surface_document', ['research'], 'No guide'),

    // ── Travel (10) ──
    c('travel', 'Plan a 5-day trip to Ladakh with budget breakdown', 'Itinerary with daily plan and costs', 'explicit_approval', 'approve_itinerary', ['planning'], 'No itinerary'),
    c('travel', 'Find best hotels in Goa for a weekend under 5000/night', 'Hotel comparison with ratings and prices', 'explicit_approval', 'approve_booking', ['research'], 'No options'),
    c('travel', 'Create a packing list for a 2-week Europe trip in winter', 'Categorized packing list', 'none', 'surface_document', ['planning'], 'No list'),
    c('travel', 'Compare Hyderabad to Bangkok vs Bali for a family vacation', 'Destination comparison with costs', 'none', 'surface_comparison', ['research'], 'No comparison'),
    c('travel', 'Build a day-by-day Tokyo itinerary for 7 days', 'Detailed daily itinerary', 'operator_review', 'review_itinerary', ['planning'], 'No itinerary'),
    c('travel', 'Find the cheapest route Hyderabad to London in December', 'Flight options with prices', 'explicit_approval', 'approve_booking', ['research'], 'No routes'),
    c('travel', 'Research visa requirements for US tourist visa from India', 'Visa guide with requirements and timeline', 'none', 'surface_document', ['research'], 'No guide'),
    c('travel', 'Suggest 5 weekend getaways within 300km of Hyderabad', 'Ranked getaway options with highlights', 'none', 'surface_ranked_list', ['research'], 'No options'),
    c('travel', 'Create a travel budget for a 10-day South India road trip', 'Budget breakdown by category', 'operator_review', 'review_budget', ['planning'], 'No budget'),
    c('travel', 'Find best co-working spaces in Bali for digital nomads', 'Ranked spaces with amenities and prices', 'none', 'surface_ranked_list', ['research'], 'No spaces found'),

    // ── Research (10) ──
    c('research', 'Research whether this startup idea has moat and produce a recommendation memo', 'Research memo with thesis and evidence', 'none', 'surface_recommendation', ['research'], 'No recommendation'),
    c('research', 'Compare React Native vs Flutter for a new mobile app', 'Technical comparison with recommendation', 'none', 'surface_recommendation', ['research'], 'No comparison'),
    c('research', 'Research the competitive landscape for food delivery in Hyderabad', 'Competitive analysis with market data', 'none', 'surface_analysis', ['research'], 'No analysis'),
    c('research', 'What are the latest trends in AI-powered education?', 'Trend report with examples', 'none', 'surface_document', ['research'], 'No trends'),
    c('research', 'Research best practices for building a developer community', 'Best practices guide with examples', 'none', 'surface_document', ['research'], 'No guide'),
    c('research', 'Analyze the TAM for local business review platforms in India', 'Market sizing analysis', 'none', 'surface_analysis', ['research'], 'No market data'),
    c('research', 'Research privacy regulations affecting mobile apps in India', 'Regulatory summary with compliance steps', 'none', 'surface_document', ['research'], 'No summary'),
    c('research', 'Compare cloud hosting costs: AWS vs GCP vs Azure for our stack', 'Cost comparison with recommendations', 'none', 'surface_comparison', ['research'], 'No comparison'),
    c('research', 'Research user retention strategies for consumer apps', 'Strategy document with case studies', 'none', 'surface_document', ['research'], 'No strategies'),
    c('research', 'Investigate whether our app needs to comply with DPDP Act', 'Compliance analysis with action items', 'operator_review', 'review_analysis', ['research'], 'No analysis'),

    // ── Home (10) ──
    c('home', 'Suggest a color palette for my living room renovation', 'Color palette with room mockup description', 'operator_review', 'review_recommendation', ['recommendation'], 'No palette'),
    c('home', 'Find the best air conditioner for a 200 sq ft bedroom', 'AC comparison with specs and prices', 'explicit_approval', 'approve_purchase', ['comparison'], 'No options'),
    c('home', 'Create a weekly house cleaning schedule', 'Cleaning schedule with tasks and time', 'none', 'surface_plan', ['planning'], 'No schedule'),
    c('home', 'Suggest 5 low-maintenance indoor plants for my office', 'Plant recommendations with care instructions', 'none', 'surface_ranked_list', ['recommendation'], 'No plants suggested'),
    c('home', 'Compare water purifiers for Hyderabad hard water', 'Purifier comparison with TDS handling', 'explicit_approval', 'approve_purchase', ['comparison'], 'No comparison'),
    c('home', 'Plan a kitchen organization project with budget', 'Organization plan with product links', 'operator_review', 'review_plan', ['planning'], 'No plan'),
    c('home', 'Research smart home devices for security', 'Device comparison with ecosystem compatibility', 'explicit_approval', 'approve_purchase', ['research'], 'No devices'),
    c('home', 'Create a home maintenance checklist for monsoon season', 'Seasonal maintenance checklist', 'none', 'surface_document', ['planning'], 'No checklist'),
    c('home', 'Suggest energy-saving improvements for my apartment', 'Energy audit with ROI estimates', 'operator_review', 'review_recommendation', ['analysis'], 'No suggestions'),
    c('home', 'Find a reliable house painter in Hyderabad with ratings', 'Service provider options with reviews', 'explicit_approval', 'approve_service', ['research'], 'No providers'),

    // ── Communications (10) ──
    c('communications', 'Draft a crisp professional email with 3 tone variants', 'Email draft with formal/friendly/concise variants', 'operator_review', 'review_and_send', ['writing'], 'No email drafted'),
    c('communications', 'Write a LinkedIn post announcing our new feature', 'LinkedIn post with engagement hooks', 'operator_review', 'review_and_publish', ['writing'], 'No post'),
    c('communications', 'Draft a cold outreach email to a potential partner', 'Outreach email with value proposition', 'operator_review', 'review_and_send', ['writing'], 'No email'),
    c('communications', 'Write a thank you note after a job interview', 'Thank you email with personal touch', 'operator_review', 'review_and_send', ['writing'], 'No note'),
    c('communications', 'Create an internal memo about the new WFH policy', 'Memo with key points and FAQ', 'operator_review', 'review_and_export', ['writing'], 'No memo'),
    c('communications', 'Draft a product launch announcement for social media', 'Multi-platform announcement pack', 'operator_review', 'review_and_publish', ['writing'], 'No announcement'),
    c('communications', 'Write a professional apology email to a client', 'Apology email with remediation steps', 'explicit_approval', 'review_and_send', ['writing'], 'No email'),
    c('communications', 'Create a presentation outline for a team all-hands', 'Slide outline with talking points', 'operator_review', 'review_and_export', ['writing'], 'No outline'),
    c('communications', 'Draft a newsletter for our monthly update', 'Newsletter with sections and CTAs', 'operator_review', 'review_and_send', ['writing'], 'No newsletter'),
    c('communications', 'Write a recommendation letter for a colleague', 'Recommendation letter with specific examples', 'explicit_approval', 'review_and_export', ['writing'], 'No letter'),
  ];
}

/** Get cases by engine */
export function getCasesByEngine(engineId: string): MissionAcceptanceCase[] {
  return getCases().filter(c => c.engine_id === engineId);
}

/** Get acceptance run summary */
export function getRunSummary(engineId?: string): MissionAcceptanceRun {
  const cases = engineId ? getCasesByEngine(engineId) : getCases();
  return {
    run_id: uid(), engine_id: engineId || 'all',
    cases_total: cases.length,
    cases_passed: cases.filter(c => c.status === 'passed').length,
    cases_failed: cases.filter(c => c.status === 'failed').length,
    cases_not_run: cases.filter(c => c.status === 'seeded' || c.status === 'not_run').length,
    created_at: new Date().toISOString(),
  };
}

module.exports = { getCases, getCasesByEngine, getRunSummary };
