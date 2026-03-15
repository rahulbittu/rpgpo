# GPO Case Audit Export

- Cases audited: **397**
- Average heuristic reliability score: **79.9/100**
- Verdict counts: **FAIL=77**, **PARTIAL=65**, **PASS_WITH_CAVEATS=255**

## Critical interpretation

This export audits **report quality and reviewability**, not absolute product truth. It asks whether each case report is complete, grounded, reviewable, and trustworthy enough for an operator to rely on.

## Top recurring issues

- **legacy_or_generic_engine**: 261
- **not_clearly_done**: 128
- **generic_instructions_instead_of_findings**: 5
- **weak_retrieval**: 4
- **hung_subtask**: 3
- **manual_execution_required**: 2
- **missing_deliberation**: 2
- **zero_output_subtask**: 2

## Per-case condensed audit

### t_mms4frmqjfxm — EXAMPLE full flow report
- Engine: **unknown**
- Verdict: **PARTIAL** | Reliability: **79/100**
- What the report shows: exports md+json
- Critical concerns: weak_retrieval
- Report path: `docs/testing/case-reports/EXAMPLE-full-flow-report.md`

### t_mmofia4tezn9 — Audit TopRanker API endpoints for performance issu
- Engine: **topranker**
- Verdict: **PARTIAL** | Reliability: **29/100**
- Expected / asked: Audit TopRanker API endpoints for performance issues and identify any N+1 queries or missing indexes
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json; one substep required manual intervention; contains generic instructions instead of repo-grounded findings
- Critical concerns: manual_execution_required, zero_output_subtask, hung_subtask, legacy_or_generic_engine, generic_instructions_instead_of_findings
- Report path: `docs/testing/case-reports/t_mmofia4tezn9-Audit-TopRanker-API-endpoints-for-performance-issu.md`

### t_mmofnvasdeog — Audit TopRanker API endpoints for performance issu
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Audit TopRanker API endpoints for performance issues and produce the first prioritized fix plan
- What the report shows: board plan present; strategy recorded; subtasks 5/5; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmofnvasdeog-Audit-TopRanker-API-endpoints-for-performance-issu.md`

### t_mmofq6ilo6jf — Audit TopRanker API endpoints for performance issu
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Audit TopRanker API endpoints for performance issues and produce the first prioritized fix plan
- What the report shows: board plan present; strategy recorded; subtasks 8/8; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmofq6ilo6jf-Audit-TopRanker-API-endpoints-for-performance-issu.md`

### t_mmogwf99x4b4 — Inspect TopRanker API performance bottlenecks prop
- Engine: **topranker**
- Verdict: **FAIL** | Reliability: **55/100**
- Expected / asked: Inspect TopRanker API performance bottlenecks, propose the first fix, implement the safest code change, and stop for approval before commit/push.
- What the report shows: subtasks 0/0; exports md+json
- Critical concerns: missing_deliberation, legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmogwf99x4b4-Inspect-TopRanker-API-performance-bottlenecks-prop.md`

### t_mmoh7qxkb3wy — Verify API key fix summarize current RPGPO mission
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Verify API key fix: summarize current RPGPO mission priorities in one paragraph
- What the report shows: board plan present; strategy recorded; subtasks 5/5; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmoh7qxkb3wy-Verify-API-key-fix-summarize-current-RPGPO-mission.md`

### t_mmohjx3r07qz — Inspect TopRanker API performance bottlenecks prop
- Engine: **general**
- Verdict: **PARTIAL** | Reliability: **74/100**
- Expected / asked: Inspect TopRanker API performance bottlenecks, propose the first safe code fix, implement it through Claude Builder, and stop for approval before commit/push.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json; contains generic instructions instead of repo-grounded findings
- Critical concerns: legacy_or_generic_engine, generic_instructions_instead_of_findings
- Report path: `docs/testing/case-reports/t_mmohjx3r07qz-Inspect-TopRanker-API-performance-bottlenecks-prop.md`

### t_mmozs36fq564 — Audit TopRanker app startup performance propose th
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Audit TopRanker app startup performance, propose the first safe fix, implement it if low risk, and stop for approval before commit/push.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmozs36fq564-Audit-TopRanker-app-startup-performance-propose-th.md`

### t_mmp0vnz0j8af — Optimize TopRanker app startup performance reduce 
- Engine: **topranker**
- Verdict: **PARTIAL** | Reliability: **74/100**
- Expected / asked: Optimize TopRanker app startup performance — reduce time to interactive, implement the safest first fix, and stop for approval before commit/push.
- What the report shows: board plan present; strategy recorded; subtasks 5/5; exports md+json; contains generic instructions instead of repo-grounded findings
- Critical concerns: legacy_or_generic_engine, generic_instructions_instead_of_findings
- Report path: `docs/testing/case-reports/t_mmp0vnz0j8af-Optimize-TopRanker-app-startup-performance-reduce-.md`

### t_mmqsbefzp21f — can you get me top 10 news in Hyderabad India
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: can you get me top 10 news in Hyderabad India.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmqsbefzp21f-can-you-get-me-top-10-news-in-Hyderabad-India.md`

### t_mmqst1fmfj67 — summarize the current state of top ranker
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: summarize the current state of top ranker
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmqst1fmfj67-summarize-the-current-state-of-top-ranker.md`

### t_mmqtkxg4ky9m — give top 10 news in hyderabad India
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: give top 10 news in hyderabad India.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmqtkxg4ky9m-give-top-10-news-in-hyderabad-India.md`

### t_mmr1uckne4lx — find data engineer jobs more than 180k
- Engine: **general**
- Verdict: **PARTIAL** | Reliability: **74/100**
- Expected / asked: find data engineer jobs more than 180k+
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json; contains generic instructions instead of repo-grounded findings
- Critical concerns: legacy_or_generic_engine, generic_instructions_instead_of_findings
- Report path: `docs/testing/case-reports/t_mmr1uckne4lx-find-data-engineer-jobs-more-than-180k.md`

### t_mmr26qcckpwa — get me high paying remote data engineering jobs in
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: get me high paying remote data engineering jobs in use I am a data engineer with 7 years experience in USA
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmr26qcckpwa-get-me-high-paying-remote-data-engineering-jobs-in.md`

### t_mmr2cnotiesl — get me high paying remote data engineering jobs in
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: get me high paying remote data engineering jobs in use I am a data engineer
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmr2cnotiesl-get-me-high-paying-remote-data-engineering-jobs-in.md`

### t_mmr83d7jtkmu — what are the top ten new in Hyderabad India
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: what are the top ten new in Hyderabad India
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmr83d7jtkmu-what-are-the-top-ten-new-in-Hyderabad-India.md`

### t_mmr8dz1b1fxj — What are the top 5 passive income ideas for a data
- Engine: **wealthresearch**
- Verdict: **FAIL** | Reliability: **59/100**
- Expected / asked: What are the top 5 passive income ideas for a data engineer in 2025?
- What the report shows: subtasks 0/0; exports md+json
- Critical concerns: missing_deliberation
- Report path: `docs/testing/case-reports/t_mmr8dz1b1fxj-What-are-the-top-5-passive-income-ideas-for-a-data.md`

### t_mmr8e3sdivuj — What are the top 5 passive income ideas for a data
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **49/100**
- Expected / asked: What are the top 5 passive income ideas for a data engineer in 2025?
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json; one substep required manual intervention
- Critical concerns: manual_execution_required, zero_output_subtask, hung_subtask
- Report path: `docs/testing/case-reports/t_mmr8e3sdivuj-What-are-the-top-5-passive-income-ideas-for-a-data.md`

### t_mmr8o2w7v2xf — Search the web for todays most important AI and te
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Search the web for today's most important AI and technology news. Include major product launches, funding rounds, and research breakthroughs from the last 48 hours.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmr8o2w7v2xf-Search-the-web-for-todays-most-important-AI-and-te.md`

### t_mmr8utd022lo — What are the top 3 trending AI tools for data engi
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: What are the top 3 trending AI tools for data engineers right now? Include pricing, use cases, and how they compare.
- What the report shows: board plan present; strategy recorded; subtasks 5/5; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmr8utd022lo-What-are-the-top-3-trending-AI-tools-for-data-engi.md`

### t_mmrbmq1ra3xl — What are the 3 most promising SaaS ideas for data 
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: What are the 3 most promising SaaS ideas for data engineers to build in 2026? Include market size estimates and competition analysis.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Report path: `docs/testing/case-reports/t_mmrbmq1ra3xl-What-are-the-3-most-promising-SaaS-ideas-for-data-.md`

### t_mmrd57n5bvzj — Research the top 10 passive income opportunities f
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the top 10 passive income opportunities for a senior data engineer / entrepreneur in 2025-2026. Focus on: SaaS micro-products, API-as-a-service, data pipeline consulting, digital products, and automated tools. For each opportunity, provide: estimated monthly income potential, startup cost, time to first revenue, and 3 concrete first steps. Use real examples of people who have succeeded.
- What the report shows: board plan present; strategy recorded; subtasks 8/8; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrd57n5bvzj-Research-the-top-10-passive-income-opportunities-f.md`

### t_mmrs5o8z7nbd — Give me the top news in Hyderabad today March 15 2
- Engine: **newsroom**
- Verdict: **PARTIAL** | Reliability: **76/100**
- Expected / asked: Give me the top news in Hyderabad today, March 15, 2026
- What the report shows: board plan present; strategy recorded; subtasks 6/6; exports md+json; contains generic instructions instead of repo-grounded findings
- Critical concerns: legacy_or_generic_engine, generic_instructions_instead_of_findings
- Report path: `docs/testing/case-reports/t_mmrs5o8z7nbd-Give-me-the-top-news-in-Hyderabad-today-March-15-2.md`

### t_mmrt8z1zmefj — Top 5 news in Hyderabad India today
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Top 5 news in Hyderabad India today
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrt8z1zmefj-Top-5-news-in-Hyderabad-India-today.md`

### t_mmrtdgk0lsh3 — What are the top 5 news stories in Hyderabad India
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: What are the top 5 news stories in Hyderabad India right now?
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrtdgk0lsh3-What-are-the-top-5-news-stories-in-Hyderabad-India.md`

### t_mmrtgqhqm5qi — Top 5 Hyderabad news today March 15 2026
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Top 5 Hyderabad news today March 15 2026
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrtgqhqm5qi-Top-5-Hyderabad-news-today-March-15-2026.md`

### t_mmruy3dy5ixv — Search the web for this weeks most notable startup
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Search the web for this week's most notable startup news. Focus on: Series A-C fundraising rounds, notable launches, Y Combinator updates, startup failures/lessons, and emerging markets. Include specific companies, amounts, and trends. Highlight anything relevant to local business / community platforms (similar to TopRanker's space).
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmruy3dy5ixv-Search-the-web-for-this-weeks-most-notable-startup.md`

### t_mmrvs5j33dgz — What are the 3 most exciting AI startup fundraisin
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: What are the 3 most exciting AI startup fundraising rounds from the last week? Include company name, amount raised, valuation, what they do, and why it matters.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrvs5j33dgz-What-are-the-3-most-exciting-AI-startup-fundraisin.md`

### t_mmrvygrdcnbt — What is the current price of Bitcoin
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: What is the current price of Bitcoin?
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrvygrdcnbt-What-is-the-current-price-of-Bitcoin.md`

### t_mmrwjqwx4rmq — Draft a high stakes email to a board investor expl
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Draft a high-stakes email to a board investor explaining why TopRanker needs an additional 3 months of runway before the Austin launch. The email should be sharp, persuasive, and human. Include specific metrics from our development progress (817+ sprints, 10,800+ tests, 5 cities active) and explain why the delay will result in a stronger product launch.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrwjqwx4rmq-Draft-a-high-stakes-email-to-a-board-investor-expl.md`

### t_mmrwm1arvt4n — Research the market for community driven local bus
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the market for community-driven local business review platforms and tell me whether it is actually worth building one in 2026. Include market size, competitors, their funding, user numbers, and honest assessment of viability.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrwm1arvt4n-Research-the-market-for-community-driven-local-bus.md`

### t_mmrwqcr2nxwc — Plan my week so I can hit my main goals without bu
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Plan my week so I can hit my main goals without burning out. My priorities are: ship TopRanker MVP features, research passive income ideas, prepare for a data engineering interview, and maintain work-life balance. I work best with time blocks and clear daily targets.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmrwqcr2nxwc-Plan-my-week-so-I-can-hit-my-main-goals-without-bu.md`

### t_mmrwqjrmww0p — Explain distributed systems consensus algorithms R
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain distributed systems consensus algorithms (Raft, Paxos, ZAB) as if you were my private tutor. I understand basic networking but have never studied consensus. Start simple, build up, use analogies, and include practice questions.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrwqjrmww0p-Explain-distributed-systems-consensus-algorithms-R.md`

### t_mmrwwk02lm4p — Draft a sharp persuasive email to my board investo
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Draft a sharp, persuasive email to my board investor explaining why we need 3 more months before the Austin launch. Include our progress metrics and make it human, not corporate.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrwwk02lm4p-Draft-a-sharp-persuasive-email-to-my-board-investo.md`

### t_mmrwwrxi76m6 — Compare Snowflake vs Databricks for a mid size dat
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Compare Snowflake vs Databricks for a mid-size data team in 2026. Include current pricing, performance benchmarks, ecosystem maturity, and a clear recommendation for my situation as a senior data engineer building data pipelines.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmrwwrxi76m6-Compare-Snowflake-vs-Databricks-for-a-mid-size-dat.md`

### t_mmrx4lc79bes — Compare the top 3 noise canceling headphones under
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Compare the top 3 noise-canceling headphones under 400 dollars for a developer who works from home. Include current pricing, sound quality ratings, comfort for long use, and a clear recommendation.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrx4lc79bes-Compare-the-top-3-noise-canceling-headphones-under.md`

### t_mmrx4lc9z6lq — Summarize the GPO value gap analysis document into
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Summarize the GPO value-gap-analysis document into the key decisions, risks, and next steps in 5 bullet points or less. The document is at 03-Operations/value-gap-analysis.md
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrx4lc9z6lq-Summarize-the-GPO-value-gap-analysis-document-into.md`

### t_mmrx6puqicbu — Teach me Kubernetes from beginner to advanced with
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me Kubernetes from beginner to advanced with a personalized study plan. I already know Docker and basic Linux. Give me a week-by-week learning path with specific resources and hands-on exercises.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrx6puqicbu-Teach-me-Kubernetes-from-beginner-to-advanced-with.md`

### t_mmrx6pus6yok — Create a 4 week workout plan for building core str
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a 4-week workout plan for building core strength and improving posture. I sit at a desk 10+ hours a day. Include exercises I can do at home with minimal equipment, progression each week, and rest day guidance.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrx6pus6yok-Create-a-4-week-workout-plan-for-building-core-str.md`

### t_mmrx6puu12fr — Plan a 5 day trip to Tokyo for a solo tech worker 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan a 5-day trip to Tokyo for a solo tech worker. Include flights from Austin TX, hotel recommendations near Shibuya, must-visit tech/gaming spots, food recommendations, and budget breakdown.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrx6puu12fr-Plan-a-5-day-trip-to-Tokyo-for-a-solo-tech-worker-.md`

### t_mmrx9glahr65 — Write a go to market plan for TopRanker launching 
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a go-to-market plan for TopRanker launching in Austin. Include user acquisition channels, cost per acquisition estimates, launch timeline, and first 90 days milestone targets. TopRanker is a community-ranked local business leaderboard app.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrx9glahr65-Write-a-go-to-market-plan-for-TopRanker-launching-.md`

### t_mmrx9glc267z — Create a monthly budget plan for someone earning 2
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a monthly budget plan for someone earning $200k in Austin TX. Include housing, savings, investment allocations, and specific index fund recommendations. Account for Texas having no state income tax.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmrx9glc267z-Create-a-monthly-budget-plan-for-someone-earning-2.md`

### t_mmrx9glefwzz — Find the top 5 highest paying remote staff data en
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Find the top 5 highest-paying remote staff data engineer positions currently hiring. For each: company name, salary range, tech stack required, and application link. Focus on companies with strong data cultures.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrx9glefwzz-Find-the-top-5-highest-paying-remote-staff-data-en.md`

### t_mmrxcqvhlfbz — Design a home office layout for a software develop
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a home office layout for a software developer. Room is 12x14 feet. Need standing desk, dual monitors, good lighting, cable management, and ergonomic seating. Include specific product recommendations and budget estimate.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxcqvhlfbz-Design-a-home-office-layout-for-a-software-develop.md`

### t_mmrxcqvi1v7h — Write a logline and 3 page treatment for a sci fi 
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a logline and 3-page treatment for a sci-fi short film about a data engineer who discovers their production database is sentient. Include character arc, key scenes, and tone guide.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrxcqvi1v7h-Write-a-logline-and-3-page-treatment-for-a-sci-fi-.md`

### t_mmrxfoapzuia — Give me a deep dive on vector databases vs traditi
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Give me a deep-dive on vector databases vs traditional databases for AI applications in 2026. Include the latest evidence, performance benchmarks, cost comparisons, and real-world case studies. Not surface-level — I want technical depth.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxfoapzuia-Give-me-a-deep-dive-on-vector-databases-vs-traditi.md`

### t_mmrxfoas9217 — Quiz me on distributed systems concepts adaptively
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Quiz me on distributed systems concepts adaptively until I actually master them. Start with easy questions about CAP theorem and eventually get to harder topics like consensus protocols and distributed transactions. Explain wrong answers.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxfoas9217-Quiz-me-on-distributed-systems-concepts-adaptively.md`

### t_mmrxfoat38yk — Write a clear SOPrunbook for deploying a new versi
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a clear SOP/runbook for deploying a new version of a Node.js application to production. Include pre-deployment checks, rollback procedure, monitoring verification, and post-deployment validation. Another team should be able to execute this without asking questions.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxfoat38yk-Write-a-clear-SOPrunbook-for-deploying-a-new-versi.md`

### t_mmrxjw2jm7kc — Analyze TopRankers business model and tell me wher
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Analyze TopRanker's business model and tell me where the weak assumptions are. The model is: free community-driven rankings for local businesses, monetize through promoted listings and business analytics. Is this viable? What are the failure modes?
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxjw2jm7kc-Analyze-TopRankers-business-model-and-tell-me-wher.md`

### t_mmrxjw2l3nul — Create board level documentation for TopRanker wit
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create board-level documentation for TopRanker with goals, metrics, open questions, and investor-ready status update. Include MAU targets, revenue projections, and competitive positioning.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrxjw2l3nul-Create-board-level-documentation-for-TopRanker-wit.md`

### t_mmrxjw2nmpiq — Create a daily operating system for a senior engin
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a daily operating system for a senior engineer who is also building a startup on the side. Include morning routine, focused work blocks, meeting management, exercise, and evening wind-down. Account for energy management throughout the day.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxjw2nmpiq-Create-a-daily-operating-system-for-a-senior-engin.md`

### t_mmrxni5e70d5 — Analyze whether I should invest in index funds ind
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Analyze whether I should invest in index funds, individual tech stocks, or real estate in Austin TX for 2026. I have a 200k salary, 50k to invest, moderate risk tolerance, and I am 32 years old. Give me a specific allocation recommendation with expected returns.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrxni5e70d5-Analyze-whether-I-should-invest-in-index-funds-ind.md`

### t_mmrxni5gn4br — Review and optimize my resume for staff level data
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Review and optimize my resume for staff-level data engineering roles paying $200k+. I have 10 years experience with Python, Spark, Airflow, PostgreSQL, and cloud platforms. I also run a startup (TopRanker). Highlight what to emphasize and what to cut. Make it ATS-friendly.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmrxni5gn4br-Review-and-optimize-my-resume-for-staff-level-data.md`

### t_mmrxni5i26k8 — Write a technical blog post about how I built a mu
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical blog post about how I built a multi-agent AI system (GPO) using Claude, OpenAI, Perplexity, and Gemini. Include architecture decisions, lessons learned, and practical tips. Target audience: senior engineers interested in AI orchestration. 1500-2000 words.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxni5i26k8-Write-a-technical-blog-post-about-how-I-built-a-mu.md`

### t_mmrxqej5v4an — Do a competitive analysis of community driven loca
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Do a competitive analysis of community-driven local business platforms. Include Yelp, Google Maps, Nextdoor, and any newer players. For each: user base, revenue model, strengths, weaknesses, and what TopRanker can do differently.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxqej5v4an-Do-a-competitive-analysis-of-community-driven-loca.md`

### t_mmrxqej7flha — Design a pricing strategy for TopRanker The app is
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a pricing strategy for TopRanker. The app is free for consumers. Businesses can get promoted listings, analytics, and verified badges. Research what similar platforms charge, then recommend 3 pricing tiers with specific monthly prices.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxqej7flha-Design-a-pricing-strategy-for-TopRanker-The-app-is.md`

### t_mmrxtfiwwwgf — Generate release notes for TopRanker v09 that incl
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Generate release notes for TopRanker v0.9 that includes: new Bayesian scoring engine, push notification system, 5-city expansion, and performance optimizations. Format for both internal team and public announcement.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxtfiwwwgf-Generate-release-notes-for-TopRanker-v09-that-incl.md`

### t_mmrxtfizcez3 — Teach me how to implement a recommendation engine 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Teach me how to implement a recommendation engine using collaborative filtering. Use my TopRanker project as the context — we need to recommend businesses to users based on their voting and browsing patterns. Include code examples in TypeScript.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxtfizcez3-Teach-me-how-to-implement-a-recommendation-engine-.md`

### t_mmrxtfj10ocq — Research the exact steps costs and timeline to inc
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the exact steps, costs, and timeline to incorporate a startup in Texas as an LLC, including: state filing fees, registered agent requirements, EIN application, operating agreement template, and bank account setup.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxtfj10ocq-Research-the-exact-steps-costs-and-timeline-to-inc.md`

### t_mmrxwgjrjloe — Create a complete relocation checklist for moving 
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a complete relocation checklist for moving from Austin TX to Seattle WA. Include cost of living comparison, housing market analysis, job market for data engineers, tax implications, and a 90-day transition timeline.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Report path: `docs/testing/case-reports/t_mmrxwgjrjloe-Create-a-complete-relocation-checklist-for-moving-.md`

### t_mmrxwgjutgzt — Design the full architecture for TopRankers recomm
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Design the full architecture for TopRanker's recommendation system including database schema for user preferences and voting patterns, API endpoints for personalized feed, caching strategy, and ranking algorithm design. Include a system diagram description and data flow.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxwgjutgzt-Design-the-full-architecture-for-TopRankers-recomm.md`

### t_mmrxwgjxzumo — Compare the top 3 laptops for software development
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Compare the top 3 laptops for software development under 2000 dollars in 2026. I need 32GB RAM minimum, good keyboard, and Linux compatibility. Include current pricing, benchmark scores, and battery life.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrxwgjxzumo-Compare-the-top-3-laptops-for-software-development.md`

### t_mmry1luntr6m — Create a meal prep plan for a busy tech worker 5 d
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a meal prep plan for a busy tech worker. 5 days of lunches and dinners. Under 2000 calories per day. Include a grocery shopping list with estimated costs. Prefer simple recipes that take under 30 minutes.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmry1luntr6m-Create-a-meal-prep-plan-for-a-busy-tech-worker-5-d.md`

### t_mmry1lups1mi — Create a checklist for launching a mobile app on t
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a checklist for launching a mobile app on the App Store and Google Play. Include screenshots, metadata, review process timelines, common rejection reasons, and ASO tips. Be specific to a React Native Expo app.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmry1lups1mi-Create-a-checklist-for-launching-a-mobile-app-on-t.md`

### t_mmry1lurd33m — Analyze my monthly spending pattern Rent 1800 Car 
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Analyze my monthly spending pattern: Rent 1800, Car 450, Food 600, Subscriptions 200, Entertainment 300, Insurance 250, Savings 500, Investments 500, Misc 400. Total income 6000 post-tax. What should I cut? Where am I overspending? Create a revised budget.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmry1lurd33m-Analyze-my-monthly-spending-pattern-Rent-1800-Car-.md`

### t_mmry4p2m137n — Write a persuasive pitch deck script 10 slides for
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a persuasive pitch deck script (10 slides) for TopRanker to present to angel investors. Include market opportunity, problem, solution, traction, team, financials, and ask. Make it compelling and data-driven.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmry4p2m137n-Write-a-persuasive-pitch-deck-script-10-slides-for.md`

### t_mmry4p2of4uw — Create a chord progression and melody outline for 
- Engine: **music**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a chord progression and melody outline for a lo-fi hip hop beat. Include suggested tempo, key, and instrument choices. Also suggest 3 reference tracks for the vibe I should aim for.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmry4p2of4uw-Create-a-chord-progression-and-melody-outline-for-.md`

### t_mmry7rlsumbg — Create a 30 day learning roadmap for system design
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a 30-day learning roadmap for system design interviews. I have 10 years of backend experience. Include daily practice with increasing difficulty, resources, and mock interview preparation. Focus on distributed systems and data-intensive applications.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Report path: `docs/testing/case-reports/t_mmry7rlsumbg-Create-a-30-day-learning-roadmap-for-system-design.md`

### t_mmry7rlvzon4 — Turn this messy meeting transcript into action ite
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Turn this messy meeting transcript into action items, owners, and deadlines: Discussion about TopRanker launch - need to finalize push notifications, fix the ranking algorithm edge case where new businesses get unfairly low scores, decide on App Store pricing (free vs freemium), and schedule user testing for next week. John handles push notifs, Sarah does ranking, I do pricing research, testing TBD.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmry7rlvzon4-Turn-this-messy-meeting-transcript-into-action-ite.md`

### t_mmry7rlzf6nc — Turn my rough thoughts into a polished PRD for a f
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Turn my rough thoughts into a polished PRD for a feature: TopRanker should let business owners claim their listing, respond to reviews, and see analytics about their ranking performance. Make it clear, structured, and ready for engineering review.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmry7rlzf6nc-Turn-my-rough-thoughts-into-a-polished-PRD-for-a-f.md`

### t_mmry7rm23ut3 — Design a daily operating system for managing my wo
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Design a daily operating system for managing my work as a data engineer (9-5 job), my startup TopRanker (evenings/weekends), health (exercise 3x/week), and personal life. Include energy management, context switching strategies, and when to say no.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmry7rm23ut3-Design-a-daily-operating-system-for-managing-my-wo.md`

### t_mmry7rm73nvq — Explain distributed consensus from first principle
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain distributed consensus from first principles, then make it practical for me. I need to design a distributed ranking system where multiple cities can have independent ranking computations but results need to be globally consistent. How should I architect this for TopRanker?
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmry7rm73nvq-Explain-distributed-consensus-from-first-principle.md`

### t_mmryd3ith993 — Turn my rough thoughts into a polished PRD TopRank
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Turn my rough thoughts into a polished PRD: TopRanker should let business owners claim their listing, respond to reviews, and see analytics. Make it clear and ready for engineering review.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryd3ith993-Turn-my-rough-thoughts-into-a-polished-PRD-TopRank.md`

### t_mmryd9q0rnz3 — Turn this messy meeting transcript into action ite
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Turn this messy meeting transcript into action items with owners and deadlines: TopRanker launch needs push notifications finalized, ranking algorithm edge case fixed, App Store pricing decided, and user testing scheduled. John handles push, Sarah does ranking, I do pricing.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryd9q0rnz3-Turn-this-messy-meeting-transcript-into-action-ite.md`

### t_mmrydfwysy7w — Explain distributed consensus from first principle
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain distributed consensus from first principles and make it practical for designing a distributed ranking system for TopRanker where multiple cities need independent computation with global consistency.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrydfwysy7w-Explain-distributed-consensus-from-first-principle.md`

### t_mmryghq0y8u2 — Turn my rough thoughts into a polished PRD TopRank
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Turn my rough thoughts into a polished PRD: TopRanker business owner dashboard with listing claims, review responses, and analytics. Structure it for engineering review.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryghq0y8u2-Turn-my-rough-thoughts-into-a-polished-PRD-TopRank.md`

### t_mmryi5cnf0mg — Write a clear SOP for onboarding new engineers to 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a clear SOP for onboarding new engineers to the TopRanker codebase. Include repo setup, local dev environment, testing commands, deployment flow, and key architecture decisions they need to understand.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryi5cnf0mg-Write-a-clear-SOP-for-onboarding-new-engineers-to-.md`

### t_mmryi7ozszxv — Rewrite this text to sound executive ready but sti
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Rewrite this text to sound executive-ready but still precise: TopRanker is an app where people vote on businesses. It uses a scoring system. We are launching in Austin first. We need more money to keep going. The tech is good but we need more users.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryi7ozszxv-Rewrite-this-text-to-sound-executive-ready-but-sti.md`

### t_mmryia1co3xl — Create a 30 day learning roadmap for mastering Typ
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a 30-day learning roadmap for mastering TypeScript generics, advanced types, and type-level programming. I already know basic TypeScript. Include daily exercises with increasing difficulty.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryia1co3xl-Create-a-30-day-learning-roadmap-for-mastering-Typ.md`

### t_mmrykc2g6zk9 — Research the exact steps to set up a data engineer
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the exact steps to set up a data engineering portfolio on GitHub that demonstrates real skills. Include project ideas, README templates, and what hiring managers actually look for.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrykc2g6zk9-Research-the-exact-steps-to-set-up-a-data-engineer.md`

### t_mmrykeekohqk — Create a comprehensive guide for negotiating a tec
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a comprehensive guide for negotiating a tech salary above 200k. Include scripts for recruiter calls, counter-offer strategies, and how to leverage competing offers. Be specific to data engineering roles.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrykeekohqk-Create-a-comprehensive-guide-for-negotiating-a-tec.md`

### t_mmrykgqr7uqe — Analyze whether I should buy or rent in Austin TX 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Analyze whether I should buy or rent in Austin TX on a 200k salary. Include current market data, mortgage rates, property taxes, investment opportunity cost, and a clear recommendation with break-even timeline.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrykgqr7uqe-Analyze-whether-I-should-buy-or-rent-in-Austin-TX-.md`

### t_mmrytfpm8idp — Generate a step by step migration plan from Expres
- Engine: **newsroom**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Generate a step-by-step migration plan from Express.js 4 to Express.js 5 for TopRanker. Include breaking changes, code patterns that need updating, rollback strategy, and testing approach. This is a planning task — do not modify code.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrytfpm8idp-Generate-a-step-by-step-migration-plan-from-Expres.md`

### t_mmryti1ue1k4 — I have 5 competing deadlines this week 1 TopRanker
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: I have 5 competing deadlines this week: 1) TopRanker push notifications ship by Thursday 2) Data pipeline PR review by Tuesday 3) Interview prep for Wednesday 4) Passive income blog post draft by Friday 5) Gym 3x this week. Prioritize these using effort vs impact and give me a day-by-day execution plan.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmryti1ue1k4-I-have-5-competing-deadlines-this-week-1-TopRanker.md`

### t_mmrytke1hi2k — Optimize my LinkedIn profile for staff level data 
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Optimize my LinkedIn profile for staff-level data engineering roles. Current headline: Senior Data Engineer. I have 10 years experience, built TopRanker, and specialize in real-time data pipelines. Rewrite headline, about section, and top 3 experience descriptions.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrytke1hi2k-Optimize-my-LinkedIn-profile-for-staff-level-data-.md`

### t_mmrytmq2bqlh — Evaluate whether TopRanker should switch from Post
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Evaluate whether TopRanker should switch from PostgreSQL to a combined PostgreSQL + Redis architecture for ranking computations. Include latency benchmarks, cost comparison, operational complexity, and migration effort estimate. Give a clear go/no-go recommendation.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrytmq2bqlh-Evaluate-whether-TopRanker-should-switch-from-Post.md`

### t_mmryziclegm9 — Based on our previous research on passive income i
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Based on our previous research on passive income ideas, which 3 should I pursue first? Create an action plan with specific first steps, estimated timeline to first revenue, and resources needed for each.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmryziclegm9-Based-on-our-previous-research-on-passive-income-i.md`

### t_mmryzkoy74bj — Write a product update email for TopRanker users a
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a product update email for TopRanker users announcing the new business owner dashboard feature. Keep it exciting but honest. Include what they can do now and what is coming next.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryzkoy74bj-Write-a-product-update-email-for-TopRanker-users-a.md`

### t_mmryzn14hr9k — Give me an honest assessment of my startup positio
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Give me an honest assessment of my startup position. TopRanker has 817 sprints completed, 10800 tests, covers 5 Texas cities, but has 0 revenue and no users outside the team. What should I focus on in the next 90 days?
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmryzn14hr9k-Give-me-an-honest-assessment-of-my-startup-positio.md`

### t_mmryzpd4w90w — Find the best standing desk under 600 dollars with
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Find the best standing desk under 600 dollars with motorized height adjustment. Compare at least 3 options with specific heights, weight capacity, warranty, and current pricing. I am 6 feet tall.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmryzpd4w90w-Find-the-best-standing-desk-under-600-dollars-with.md`

### t_mmrz7oudlocd — Write a logline and one page treatment for a thril
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a logline and one-page treatment for a thriller short film about an AI system that starts making its own decisions in a corporate setting. Include character descriptions, key scenes, and tone guide.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrz7oudlocd-Write-a-logline-and-one-page-treatment-for-a-thril.md`

### t_mmrz7r6egf0i — Create a complete home gym setup plan for a 10x12 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a complete home gym setup plan for a 10x12 room. Budget 1500 dollars. Include specific equipment recommendations with prices, layout diagram description, flooring options, and a progressive workout program using the equipment.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrz7r6egf0i-Create-a-complete-home-gym-setup-plan-for-a-10x12-.md`

### t_mmrz7tij8eru — Research the top 5 emerging AI tools that data eng
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the top 5 emerging AI tools that data engineers should learn in 2026. For each: what it does, pricing, who uses it, learning curve, and whether it is worth investing time in. Include real examples and user reviews.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrz7tij8eru-Research-the-top-5-emerging-AI-tools-that-data-eng.md`

### t_mmrz7vulmgcg — Prepare me for a behavioral interview for a Staff 
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **92/100**
- Expected / asked: Prepare me for a behavioral interview for a Staff Data Engineer role. Give me 10 STAR-format practice questions with example answers based on someone with 10 years of data engineering experience and a side startup. Focus on leadership, technical decision-making, and cross-team collaboration.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrz7vulmgcg-Prepare-me-for-a-behavioral-interview-for-a-Staff-.md`

### t_mmrzd5ux1m57 — Create a detailed comparison table of the top 5 pr
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Create a detailed comparison table of the top 5 project management tools for small engineering teams. Include pricing per user, key features, integrations, and a clear recommendation for a team of 3-5 developers.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzd5ux1m57-Create-a-detailed-comparison-table-of-the-top-5-pr.md`

### t_mmrzd877m6jc — Teach me how to use dbt data build tool from scrat
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me how to use dbt (data build tool) from scratch. I know SQL and have used Airflow. Create a progressive learning path with hands-on exercises. Start with basic models and work up to testing, documentation, and deployment patterns.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzd877m6jc-Teach-me-how-to-use-dbt-data-build-tool-from-scrat.md`

### t_mmrzdajj4yjq — Write a clear FAQ document for a SaaS product Cove
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a clear FAQ document for a SaaS product. Cover: pricing, data privacy, integrations, support, onboarding, and cancellation. Make it professional but conversational. Include 15-20 questions with detailed answers.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzdajj4yjq-Write-a-clear-FAQ-document-for-a-SaaS-product-Cove.md`

### t_mmrzdcvrn2k5 — Plan a team retreat for 8 people in a cabin near A
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan a team retreat for 8 people in a cabin near Austin TX. 3 days, 2 nights. Include location options with prices, activity schedule mixing work sessions and fun, food planning, and estimated total budget.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzdcvrn2k5-Plan-a-team-retreat-for-8-people-in-a-cabin-near-A.md`

### t_mmrzgoylglia — Analyze whether refinancing my car loan from 65 to
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Analyze whether refinancing my car loan from 6.5% to current rates makes financial sense. I owe 15000 with 36 months remaining. Include current auto loan rates, savings calculation, and any fees to watch for.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmrzgoylglia-Analyze-whether-refinancing-my-car-loan-from-65-to.md`

### t_mmrzgrb0k5iv — Create a sleep optimization protocol for a tech wo
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a sleep optimization protocol for a tech worker with irregular schedule. Include: ideal bedroom setup, blue light management, supplement recommendations (evidence-based only), and a 2-week adjustment plan.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzgrb0k5iv-Create-a-sleep-optimization-protocol-for-a-tech-wo.md`

### t_mmrzgtndk835 — Build a morning routine that takes exactly 60 minu
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **92/100**
- Expected / asked: Build a morning routine that takes exactly 60 minutes and includes exercise, planning, and learning. I wake at 6am and need to start work by 7:15am. Include specific timing for each block.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Report path: `docs/testing/case-reports/t_mmrzgtndk835-Build-a-morning-routine-that-takes-exactly-60-minu.md`

### t_mmrzgvzgldr2 — Research the best tax optimization strategies for 
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the best tax optimization strategies for a W2 employee earning 200k who also has a side LLC. Include: 401k max, backdoor Roth, HSA, QBI deduction eligibility, home office deduction, and estimated tax savings for each.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrzgvzgldr2-Research-the-best-tax-optimization-strategies-for-.md`

### t_mmrzk8cu85su — Write a technical design document for implementing
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical design document for implementing rate limiting on an API. Include token bucket algorithm, Redis-based implementation, client identification strategy, and monitoring. Format as a proper design doc with sections.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzk8cu85su-Write-a-technical-design-document-for-implementing.md`

### t_mmrzkapaukjr — Research the pros and cons of relocating from Aust
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the pros and cons of relocating from Austin TX to Denver CO for a tech career. Include cost of living comparison, tech job market, outdoor lifestyle, climate, and quality of life factors.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzkapaukjr-Research-the-pros-and-cons-of-relocating-from-Aust.md`

### t_mmrzkd1tosfe — Compare the top 3 ergonomic office chairs for long
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Compare the top 3 ergonomic office chairs for long coding sessions under 800 dollars. I have lower back issues. Include specific model names, adjustment features, lumbar support quality, and current pricing.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzkd1tosfe-Compare-the-top-3-ergonomic-office-chairs-for-long.md`

### t_mmrzkfdvlmrn — Create a comprehensive onboarding guide for a new 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a comprehensive onboarding guide for a new data engineering hire. Include first week schedule, tools to set up, key documentation to read, people to meet, and 30-60-90 day milestones.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzkfdvlmrn-Create-a-comprehensive-onboarding-guide-for-a-new-.md`

### t_mmrznmhwuwis — Create a detailed comparison of AWS vs GCP vs Azur
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a detailed comparison of AWS vs GCP vs Azure for data engineering workloads in 2026. Include pricing for common services (storage, compute, ETL), ecosystem maturity, and recommendation.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrznmhwuwis-Create-a-detailed-comparison-of-AWS-vs-GCP-vs-Azur.md`

### t_mmrznougd4y7 — Write a cold outreach email template for selling B
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a cold outreach email template for selling B2B SaaS analytics to local businesses. Include subject line, body, CTA, and follow-up sequence. Make it personal and non-spammy.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrznougd4y7-Write-a-cold-outreach-email-template-for-selling-B.md`

### t_mmrznr717992 — Create a 12 week strength training program for a b
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a 12-week strength training program for a beginner. 3 days per week. Include warm-up, main lifts, accessory work, and progressive overload schedule. Equipment: barbell, dumbbells, pull-up bar.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrznr717992-Create-a-12-week-strength-training-program-for-a-b.md`

### t_mmrzntjepcvk — Research the best cities in the US for tech startu
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best cities in the US for tech startups in 2026. Compare Austin, Miami, Denver, Nashville, and Raleigh. Include cost of living, talent pool, funding activity, and quality of life.
- What the report shows: board plan present; strategy recorded; subtasks 5/5; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzntjepcvk-Research-the-best-cities-in-the-US-for-tech-startu.md`

### t_mmrznvvnso6t — Teach me how to read a balance sheet and income st
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me how to read a balance sheet and income statement. Use a real public company as example. Include practice exercises and common pitfalls to watch for.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrznvvnso6t-Teach-me-how-to-read-a-balance-sheet-and-income-st.md`

### t_mmrzrf0624h4 — Create a quarterly OKR template for a data enginee
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a quarterly OKR template for a data engineering team of 5. Include team-level objectives and individual key results. Make it practical, not aspirational.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzrf0624h4-Create-a-quarterly-OKR-template-for-a-data-enginee.md`

### t_mmrzrhcqsyw8 — Research the best health insurance options for a s
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the best health insurance options for a self-employed entrepreneur in Texas. Compare marketplace plans, health sharing ministries, and direct primary care. Include monthly costs and coverage comparison.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrzrhcqsyw8-Research-the-best-health-insurance-options-for-a-s.md`

### t_mmrzrjp4tdlv — Design a content marketing strategy for a tech sta
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a content marketing strategy for a tech startup launching a local business app. Include blog topics, social media calendar, email sequences, and KPIs for the first 3 months.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzrjp4tdlv-Design-a-content-marketing-strategy-for-a-tech-sta.md`

### t_mmrzrm1j6bum — Quiz me on SQL performance optimization Give me 10
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Quiz me on SQL performance optimization. Give me 10 increasingly difficult questions about indexing, query plans, joins, and aggregations. Include the answer after each question with explanation.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzrm1j6bum-Quiz-me-on-SQL-performance-optimization-Give-me-10.md`

### t_mmrzroe2z2g0 — Plan a weekend road trip from Austin to Big Bend N
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan a weekend road trip from Austin to Big Bend National Park. Include route options, gas stops, campsite reservations, hiking trails by difficulty, and packing list. 3 days total.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzroe2z2g0-Plan-a-weekend-road-trip-from-Austin-to-Big-Bend-N.md`

### t_mmrzv7ggtyx7 — Write a post mortem template for a production inci
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a post-mortem template for a production incident. Include timeline, root cause analysis, impact assessment, action items, and lessons learned. Make it blame-free and actionable.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzv7ggtyx7-Write-a-post-mortem-template-for-a-production-inci.md`

### t_mmrzv9t1nzk6 — Create a side by side comparison of React Native v
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a side-by-side comparison of React Native vs Flutter vs native iOS/Android for a local business app. Include development speed, performance, ecosystem, and total cost estimate for a 6-month project.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzv9t1nzk6-Create-a-side-by-side-comparison-of-React-Native-v.md`

### t_mmrzvc5hqp43 — Build a reading list for becoming a better enginee
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Build a reading list for becoming a better engineering leader. 10 books organized by theme: technical leadership, people management, strategic thinking, and communication. Include why each book matters and what to take from it.
- What the report shows: board plan present; strategy recorded; subtasks 5/5; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzvc5hqp43-Build-a-reading-list-for-becoming-a-better-enginee.md`

### t_mmrzvehsx0l5 — Calculate the total cost of owning a Tesla Model 3
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Calculate the total cost of owning a Tesla Model 3 vs a Honda Civic over 5 years in Austin TX. Include purchase price, financing, insurance, fuel/electricity, maintenance, and depreciation.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrzvehsx0l5-Calculate-the-total-cost-of-owning-a-Tesla-Model-3.md`

### t_mmrzvgu3xbqx — Create a weekly meal plan and grocery list optimiz
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a weekly meal plan and grocery list optimized for brain performance and sustained energy for a desk worker. Include specific meals, macros, and prep instructions. Budget: 100 per week.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzvgu3xbqx-Create-a-weekly-meal-plan-and-grocery-list-optimiz.md`

### t_mmrzzegfehty — Write a screenplay scene where two engineers debat
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a screenplay scene where two engineers debate whether to use microservices or a monolith for their startup. Include dialogue, stage directions, and subtext. Make it dramatic but technically accurate.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mmrzzegfehty-Write-a-screenplay-scene-where-two-engineers-debat.md`

### t_mmrzzgswde93 — Create an emergency fund calculator Given my month
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create an emergency fund calculator. Given my monthly expenses of 4000 and current savings of 8000, how many months of runway do I have? What is the target and how long to reach it at 1000/month savings rate?
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mmrzzgswde93-Create-an-emergency-fund-calculator-Given-my-month.md`

### t_mmrzzj57spwm — Research the best noise canceling earbuds for runn
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best noise-canceling earbuds for running under 200 dollars. Must be sweat-proof, secure fit, and good sound quality. Compare 3 options with current pricing.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzzj57spwm-Research-the-best-noise-canceling-earbuds-for-runn.md`

### t_mmrzzlha5200 — Explain the CAP theorem to me like I am a junior d
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain the CAP theorem to me like I am a junior developer. Then show me how it applies to designing a distributed database for a real application. Include diagrams described in text.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzzlha5200-Explain-the-CAP-theorem-to-me-like-I-am-a-junior-d.md`

### t_mmrzzntd9f75 — Write a weekly standup template that my engineerin
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a weekly standup template that my engineering team can use. Include sections for accomplished, planned, blocked, and needs discussion. Make it async-friendly for remote teams.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzzntd9f75-Write-a-weekly-standup-template-that-my-engineerin.md`

### t_mmrzzq5h6p1s — Plan a digital detox weekend No screens for 48 hou
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan a digital detox weekend. No screens for 48 hours. Include activities, meal prep in advance, journal prompts, and how to handle FOMO. Be practical not preachy.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mmrzzq5h6p1s-Plan-a-digital-detox-weekend-No-screens-for-48-hou.md`

### t_mms03rnsaz8j — Write a character bible for a web series protagoni
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a character bible for a web series protagonist who is a burnt-out data engineer who builds an AI assistant that becomes too helpful. Include backstory, flaws, goals, and arc.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mms03rnsaz8j-Write-a-character-bible-for-a-web-series-protagoni.md`

### t_mms03u05qo30 — Design a home office lighting setup for video call
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a home office lighting setup for video calls and long coding sessions. Include specific bulb types, color temperatures, positioning, and budget options under 200 dollars.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms03u05qo30-Design-a-home-office-lighting-setup-for-video-call.md`

### t_mms03wchimnx — Create a decision matrix for choosing between 3 jo
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a decision matrix for choosing between 3 job offers. Factors: salary, remote flexibility, team culture, growth opportunity, tech stack, and benefits. Show me how to weight and score them.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms03wchimnx-Create-a-decision-matrix-for-choosing-between-3-jo.md`

### t_mms03yot7t01 — Research the impact of intermittent fasting on cog
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the impact of intermittent fasting on cognitive performance for knowledge workers. Include latest studies, recommended protocols, and potential risks. Evidence-based only.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms03yot7t01-Research-the-impact-of-intermittent-fasting-on-cog.md`

### t_mms0410wim78 — Write a comprehensive API documentation page for a
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a comprehensive API documentation page for a REST endpoint that handles user authentication. Include request/response examples, error codes, rate limits, and security notes.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0410wim78-Write-a-comprehensive-API-documentation-page-for-a.md`

### t_mms07kzgoz66 — Create a pitch for a data engineering conference t
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a pitch for a data engineering conference talk about building multi-agent AI systems. Include title, abstract (200 words), outline, target audience, and key takeaways.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms07kzgoz66-Create-a-pitch-for-a-data-engineering-conference-t.md`

### t_mms07nbtka0z — Research the current state of real estate investin
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the current state of real estate investing in Austin TX for 2026. Include average rental yields, appreciation rates, best neighborhoods for investment, and minimum capital needed.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms07nbtka0z-Research-the-current-state-of-real-estate-investin.md`

### t_mms07pnwslt0 — Build a 90 day networking plan for someone transit
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Build a 90-day networking plan for someone transitioning from IC to engineering management. Include specific actions per week, communities to join, and conversation starters.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mms07pnwslt0-Build-a-90-day-networking-plan-for-someone-transit.md`

### t_mms07s003r77 — Compare the top 3 VPN services for remote workers 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Compare the top 3 VPN services for remote workers. Include speed benchmarks, privacy policies, server locations, and current pricing. Recommend one for a tech worker in the US.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms07s003r77-Compare-the-top-3-VPN-services-for-remote-workers-.md`

### t_mms07uc5bz5l — Create a guided meditation script for reducing anx
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a guided meditation script for reducing anxiety before a technical interview. 10 minutes long. Include breathing exercises, body scan, and positive visualization. Written for audio recording.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms07uc5bz5l-Create-a-guided-meditation-script-for-reducing-anx.md`

### t_mms0c9dsl8w9 — Write a technical specification for implementing p
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical specification for implementing push notifications in a React Native Expo app. Include architecture, provider selection (FCM vs APNs), token management, and testing strategy.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0c9dsl8w9-Write-a-technical-specification-for-implementing-p.md`

### t_mms0cbqe43w6 — Create a personal brand strategy for a data engine
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a personal brand strategy for a data engineer who wants to build thought leadership. Include LinkedIn, Twitter/X, blog, and speaking strategy with specific actions per week.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mms0cbqe43w6-Create-a-personal-brand-strategy-for-a-data-engine.md`

### t_mms0ce2yxcec — Research the best AI coding assistants in 2026 Com
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best AI coding assistants in 2026. Compare GitHub Copilot, Cursor, Claude Code, and others. Include pricing, supported languages, accuracy, and workflow integration.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0ce2yxcec-Research-the-best-AI-coding-assistants-in-2026-Com.md`

### t_mms0cgf7r11u — Design a home network setup for a remote tech work
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a home network setup for a remote tech worker. Include router recommendation, mesh WiFi vs single AP, NAS for backups, and security hardening. Budget under 500 dollars.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0cgf7r11u-Design-a-home-network-setup-for-a-remote-tech-work.md`

### t_mms0cirgo7wh — Teach me the fundamentals of machine learning for 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me the fundamentals of machine learning for a data engineer. Focus on practical applications I can implement in data pipelines. Include supervised vs unsupervised, common algorithms, and real examples.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0cirgo7wh-Teach-me-the-fundamentals-of-machine-learning-for-.md`

### t_mms0cl3q9k6q — Create a comprehensive moving checklist for reloca
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a comprehensive moving checklist for relocating to a new city. Include 60-day, 30-day, 2-week, 1-week, and moving day tasks. Cover utilities, address changes, and settling in.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0cl3q9k6q-Create-a-comprehensive-moving-checklist-for-reloca.md`

### t_mms0hniyss08 — Analyze the unit economics of a SaaS business char
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Analyze the unit economics of a SaaS business charging 49/month with 5% monthly churn, 100 CAC, and 15/month server costs per user. Calculate LTV, LTV:CAC ratio, payback period, and break-even point.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms0hniyss08-Analyze-the-unit-economics-of-a-SaaS-business-char.md`

### t_mms0hpvhthz9 — Write a compelling product hunt launch post for a 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a compelling product hunt launch post for a developer productivity tool. Include headline, tagline, description, key features, and maker comment. Make it authentic not salesy.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0hpvhthz9-Write-a-compelling-product-hunt-launch-post-for-a-.md`

### t_mms0hs7ncgrx — Create a stretching routine for someone who sits 1
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a stretching routine for someone who sits 10+ hours a day. 15 minutes total. Include specific stretches for neck, shoulders, lower back, hips, and wrists. With rep counts and hold times.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0hs7ncgrx-Create-a-stretching-routine-for-someone-who-sits-1.md`

### t_mms0hujukvjc — Research the best states in the US for forming an 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best states in the US for forming an LLC in 2026. Compare Texas, Delaware, Wyoming, and Nevada on taxes, fees, privacy, and maintenance requirements.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0hujukvjc-Research-the-best-states-in-the-US-for-forming-an-.md`

### t_mms0hwvyva0k — Create a screenplay beat sheet for a 10 minute sho
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a screenplay beat sheet for a 10-minute short film about an engineer who discovers their code review comments are being read by an AI that takes them too literally.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms0hwvyva0k-Create-a-screenplay-beat-sheet-for-a-10-minute-sho.md`

### t_mms0hz86bvuf — Plan the optimal desk ergonomics setup for a devel
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan the optimal desk ergonomics setup for a developer. Include monitor height and distance, keyboard position, chair adjustment, and desk organization. Reference OSHA guidelines.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0hz86bvuf-Plan-the-optimal-desk-ergonomics-setup-for-a-devel.md`

### t_mms0lx1e6wni — Create a data governance framework for a growing d
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a data governance framework for a growing data team. Include data ownership, quality standards, access controls, documentation requirements, and monitoring.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0lx1e6wni-Create-a-data-governance-framework-for-a-growing-d.md`

### t_mms0lze45wv7 — Calculate my effective tax rate on 200k income in 
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Calculate my effective tax rate on 200k income in Texas with a side LLC generating 30k revenue and 20k expenses. Include federal tax brackets, self-employment tax, and deductions.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms0lze45wv7-Calculate-my-effective-tax-rate-on-200k-income-in-.md`

### t_mms0m1qcdhik — Research the best cities for digital nomads in Sou
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best cities for digital nomads in Southeast Asia. Compare Bali, Bangkok, Chiang Mai, and Ho Chi Minh City on cost of living, internet speed, coworking spaces, and visa options.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0m1qcdhik-Research-the-best-cities-for-digital-nomads-in-Sou.md`

### t_mms0m42cgbd5 — Explain event driven architecture patterns to me w
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain event-driven architecture patterns to me with practical examples. Cover event sourcing, CQRS, pub/sub, and when to use each. Include trade-offs and common mistakes.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0m42cgbd5-Explain-event-driven-architecture-patterns-to-me-w.md`

### t_mms0m6ebqgk0 — Find the best wireless mechanical keyboard for pro
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Find the best wireless mechanical keyboard for programming under 150 dollars. Must have hot-swappable switches, low latency, and Mac compatibility. Compare 3 options.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0m6ebqgk0-Find-the-best-wireless-mechanical-keyboard-for-pro.md`

### t_mms0m8qjgjj9 — Write a series of 5 LinkedIn posts about lessons l
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Write a series of 5 LinkedIn posts about lessons learned building a startup while working a full-time job. Each should be under 300 words and have a hook opening.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0m8qjgjj9-Write-a-series-of-5-LinkedIn-posts-about-lessons-l.md`

### t_mms0q05vygk9 — Create a data pipeline architecture diagram descri
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a data pipeline architecture diagram description for ingesting user events, processing in real-time, and storing for analytics. Include tech stack choices and reasoning.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0q05vygk9-Create-a-data-pipeline-architecture-diagram-descri.md`

### t_mms0q2ie5m9g — Research the best credit cards for tech workers in
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best credit cards for tech workers in 2026. Focus on travel rewards, cash back, sign-up bonuses, and annual fees. Compare 3 options with current offers.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0q2ie5m9g-Research-the-best-credit-cards-for-tech-workers-in.md`

### t_mms0q4undyqm — Plan a productive staycation week 5 days off witho
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Plan a productive staycation week. 5 days off without travel. Include deep work projects, self-care, social activities, and home improvement tasks. Make it rejuvenating not boring.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms0q4undyqm-Plan-a-productive-staycation-week-5-days-off-witho.md`

### t_mms0q76r86ss — Explain containerization with Docker to a develope
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain containerization with Docker to a developer who has only deployed to VMs. Cover images, containers, Dockerfile best practices, and docker-compose for multi-service apps.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0q76r86ss-Explain-containerization-with-Docker-to-a-develope.md`

### t_mms0q9ivi5qu — Write a story outline for a sci fi novella about a
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **92/100**
- Expected / asked: Write a story outline for a sci-fi novella about a programmer who discovers that reality is a simulation running on their own code from 50 years ago.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Report path: `docs/testing/case-reports/t_mms0q9ivi5qu-Write-a-story-outline-for-a-sci-fi-novella-about-a.md`

### t_mms0qbuzov6a — Create a quarterly health checkup plan List specif
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a quarterly health checkup plan. List specific blood tests to request, baseline measurements to track, and health metrics to monitor monthly for a 32-year-old male tech worker.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0qbuzov6a-Create-a-quarterly-health-checkup-plan-List-specif.md`

### t_mms0wtxdfcih — Create a retrospective template for an engineering
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a retrospective template for an engineering sprint. Include what went well, what did not, action items, and team health check. Format for a 30-minute async retro.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0wtxdfcih-Create-a-retrospective-template-for-an-engineering.md`

### t_mms0ww9skalk — Research the best ways to passively earn from a da
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the best ways to passively earn from a data engineering blog. Include monetization options: ads, sponsorships, courses, consulting leads. With realistic income estimates.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms0ww9skalk-Research-the-best-ways-to-passively-earn-from-a-da.md`

### t_mms0wym13jw5 — Plan a home renovation project convert a spare bed
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan a home renovation project: convert a spare bedroom into a home office. Include design considerations, electrical requirements, cost estimates, and a timeline.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0wym13jw5-Plan-a-home-renovation-project-convert-a-spare-bed.md`

### t_mms0x0y5cxzn — Teach me how to write effective system design docu
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me how to write effective system design documents. Include the structure, what to include in each section, common mistakes, and a real example outline.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0x0y5cxzn-Teach-me-how-to-write-effective-system-design-docu.md`

### t_mms0x3ajn5sa — Create a character sheet for a tabletop RPG charac
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a character sheet for a tabletop RPG character: a data engineer who became an adventurer. Include stats, backstory, personality traits, and special abilities tied to their tech background.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms0x3ajn5sa-Create-a-character-sheet-for-a-tabletop-RPG-charac.md`

### t_mms0x5musbvd — Build a recovery protocol for after a tough workou
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Build a recovery protocol for after a tough workout. Include nutrition timing, hydration, stretching sequence, and sleep recommendations. Evidence-based only.
- What the report shows: board plan present; strategy recorded; subtasks 5/5; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms0x5musbvd-Build-a-recovery-protocol-for-after-a-tough-workou.md`

### t_mms1573qcpeb — Write a technical RFC for introducing a feature fl
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical RFC for introducing a feature flag system to a Node.js codebase. Include problem statement, proposed solution, rollback strategy, and migration plan.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1573qcpeb-Write-a-technical-RFC-for-introducing-a-feature-fl.md`

### t_mms159g0mijg — Research and compare the top 3 AI powered transcri
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research and compare the top 3 AI-powered transcription services for meeting notes. Include accuracy rates, pricing, integrations, and real user feedback.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms159g0mijg-Research-and-compare-the-top-3-AI-powered-transcri.md`

### t_mms15bsl502j — Create a 2 week beginner meditation practice Day b
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a 2-week beginner meditation practice. Day by day, increasing from 3 to 15 minutes. Include specific techniques, timing, and common obstacles with solutions.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms15bsl502j-Create-a-2-week-beginner-meditation-practice-Day-b.md`

### t_mms15e5bi0ua — Explain microservices vs monolith architecture usi
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain microservices vs monolith architecture using a restaurant analogy. Then give me decision criteria for when to use each. Include real examples of companies that made each choice.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms15e5bi0ua-Explain-microservices-vs-monolith-architecture-usi.md`

### t_mms15gi3ii0a — Calculate whether it makes sense to pay off studen
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Calculate whether it makes sense to pay off student loans early at 4.5% or invest the extra money in index funds averaging 10%. Loan balance 35000. Extra monthly payment 500.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms15gi3ii0a-Calculate-whether-it-makes-sense-to-pay-off-studen.md`

### t_mms15iukmosp — Design the information architecture for a personal
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Design the information architecture for a personal knowledge management system. Include categories, tagging strategy, search approach, and review cadence.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms15iukmosp-Design-the-information-architecture-for-a-personal.md`

### t_mms1l67ruugl — Create an investor ready pitch deck outline for a 
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create an investor-ready pitch deck outline for a SaaS startup. Include 12 slides with specific content for each: problem, solution, market size, business model, traction, team, financials, ask.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1l67ruugl-Create-an-investor-ready-pitch-deck-outline-for-a-.md`

### t_mms1l8jvuv17 — Research the best productivity apps for engineers 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best productivity apps for engineers in 2026. Compare Notion, Linear, Obsidian, and Raycast. Include pricing, key features, and which is best for a solo engineer vs a team.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1l8jvuv17-Research-the-best-productivity-apps-for-engineers-.md`

### t_mms1law1iaif — Create a 30 day journaling challenge with daily pr
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a 30-day journaling challenge with daily prompts. Focus on self-reflection, goal setting, and gratitude. Include prompts for both morning and evening entries.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1law1iaif-Create-a-30-day-journaling-challenge-with-daily-pr.md`

### t_mms1ld83v1cg — Explain how to build a data lakehouse architecture
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain how to build a data lakehouse architecture from scratch. Cover storage layer, compute layer, governance, and query engines. Compare Delta Lake, Apache Iceberg, and Apache Hudi.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1ld83v1cg-Explain-how-to-build-a-data-lakehouse-architecture.md`

### t_mms1lfk6vfmg — Write a comprehensive guide for setting up a home 
- Engine: **music**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a comprehensive guide for setting up a home recording studio on a budget under 500 dollars. Include microphone, interface, DAW software, acoustic treatment, and monitoring.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms1lfk6vfmg-Write-a-comprehensive-guide-for-setting-up-a-home-.md`

### t_mms1qaz0z0ww — Write a resignation letter template that is profes
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Write a resignation letter template that is professional and bridges-burning-free. Include notice period, transition plan offer, and gratitude. For a senior engineer leaving for a startup.
- What the report shows: board plan present; strategy recorded; subtasks 1/1; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1qaz0z0ww-Write-a-resignation-letter-template-that-is-profes.md`

### t_mms1qdb64efc — Research the best approach to building a personal 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best approach to building a personal website as a data engineer. Compare static site generators (Hugo, Next.js, Astro). Include hosting options and expected costs.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1qdb64efc-Research-the-best-approach-to-building-a-personal-.md`

### t_mms1qfnd2uov — Create a complete packing list for a 2 week intern
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a complete packing list for a 2-week international trip. Categories: clothing, tech, documents, health, and miscellaneous. For a solo tech worker traveling to Japan in spring.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1qfnd2uov-Create-a-complete-packing-list-for-a-2-week-intern.md`

### t_mms1qhzj1hrw — Design a subscription pricing page for a SaaS prod
- Engine: **topranker**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a subscription pricing page for a SaaS product. Include 3 tiers with features, pricing psychology principles applied, and FAQ section. Output as structured content.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1qhzj1hrw-Design-a-subscription-pricing-page-for-a-SaaS-prod.md`

### t_mms1qkbv4tci — Explain graph databases and when to use them inste
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain graph databases and when to use them instead of relational databases. Include Neo4j vs Amazon Neptune comparison, and 3 real use cases with example queries.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms1qkbv4tci-Explain-graph-databases-and-when-to-use-them-inste.md`

### t_mms2ifdabqjs — Create a weekly newsletter template for a tech com
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a weekly newsletter template for a tech community. Include sections for top stories, tutorials, job listings, and community highlights. Professional but approachable tone.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2ifdabqjs-Create-a-weekly-newsletter-template-for-a-tech-com.md`

### t_mms2igxljn6p — Research the best ways to automate personal financ
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the best ways to automate personal finances. Compare tools like Monarch, YNAB, Copilot, and manual spreadsheet approaches. Include pricing and automation capabilities.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms2igxljn6p-Research-the-best-ways-to-automate-personal-financ.md`

### t_mms2iihy1pg6 — Explain Kubernetes networking from basics to advan
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain Kubernetes networking from basics to advanced. Cover Services, Ingress, Network Policies, and service mesh. Use diagrams described in text.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2iihy1pg6-Explain-Kubernetes-networking-from-basics-to-advan.md`

### t_mms2ik23ce94 — Create a sustainable wardrobe essentials list for 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a sustainable wardrobe essentials list for a tech professional. 20 items that mix and match. Include brands with fair pricing and quality focus.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2ik23ce94-Create-a-sustainable-wardrobe-essentials-list-for-.md`

### t_mms2ilm7rxjc — Design a personal CRM system for networking Track 
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Design a personal CRM system for networking. Track contacts, interactions, follow-ups, and relationship strength. Include tool recommendations and workflow.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms2ilm7rxjc-Design-a-personal-CRM-system-for-networking-Track-.md`

### t_mms2nvrxgmg4 — Write a privacy policy template for a SaaS applica
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a privacy policy template for a SaaS application that handles user data. Include data collection, usage, retention, sharing, and user rights sections. GDPR and CCPA compliant.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2nvrxgmg4-Write-a-privacy-policy-template-for-a-SaaS-applica.md`

### t_mms2nxci5k5q — Create a debt payoff strategy for someone with 45k
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a debt payoff strategy for someone with 45k in student loans at 5.5%, 8k credit card at 22%, and 15k car loan at 6.5%. Monthly available: 1500. Compare avalanche vs snowball method.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mms2nxci5k5q-Create-a-debt-payoff-strategy-for-someone-with-45k.md`

### t_mms2nywpd178 — Build a comprehensive home emergency kit checklist
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Build a comprehensive home emergency kit checklist. Include supplies for 72 hours, documents to have ready, communication plan, and periodic maintenance schedule.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2nywpd178-Build-a-comprehensive-home-emergency-kit-checklist.md`

### t_mms2o0gtjlr3 — Teach me about API rate limiting patterns Cover to
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me about API rate limiting patterns. Cover token bucket, sliding window, and fixed window approaches. Include pseudocode examples and when to use each.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2o0gtjlr3-Teach-me-about-API-rate-limiting-patterns-Cover-to.md`

### t_mms2o20wcyhs — Research the top 3 electric bikes for commuting un
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the top 3 electric bikes for commuting under 2000 dollars. Include battery range, motor power, weight, and current pricing. Must fold for apartment storage.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2o20wcyhs-Research-the-top-3-electric-bikes-for-commuting-un.md`

### t_mms2stguy0d1 — Write a technical blog post explaining how Bayesia
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical blog post explaining how Bayesian scoring works in recommendation systems. Include math explained simply, code examples in Python, and real-world applications.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2stguy0d1-Write-a-technical-blog-post-explaining-how-Bayesia.md`

### t_mms2sv1c0jll — Create a startup financial model template Include 
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a startup financial model template. Include revenue projections, cost structure, burn rate, runway, and break-even analysis. For a SaaS product with freemium model.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms2sv1c0jll-Create-a-startup-financial-model-template-Include-.md`

### t_mms2swlj5a13 — Design a home automation setup for a smart home be
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Design a home automation setup for a smart home beginner. Include hub recommendation, must-have devices, setup sequence, and automation rules. Budget 500 dollars.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms2swlj5a13-Design-a-home-automation-setup-for-a-smart-home-be.md`

### t_mms2sy5k9kpa — Teach me about event sourcing and CQRS patterns wi
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me about event sourcing and CQRS patterns with practical examples. When to use them, common pitfalls, and how they relate to microservices. Include code sketches.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2sy5k9kpa-Teach-me-about-event-sourcing-and-CQRS-patterns-wi.md`

### t_mms2szpl7adu — Plan a productive sabbatical month Balance learnin
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Plan a productive sabbatical month. Balance learning new skills, health optimization, travel, and creative projects. Include weekly themes and daily structure.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms2szpl7adu-Plan-a-productive-sabbatical-month-Balance-learnin.md`

### t_mms2xrtcsabo — Write an incident response playbook for a data pip
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write an incident response playbook for a data pipeline failure. Include detection, triage, escalation, mitigation, root cause analysis, and post-mortem steps.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2xrtcsabo-Write-an-incident-response-playbook-for-a-data-pip.md`

### t_mms2xtduywxn — Compare the 3 best password managers for teams in 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Compare the 3 best password managers for teams in 2026. Include security model, pricing per user, features, and integration options.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2xtduywxn-Compare-the-3-best-password-managers-for-teams-in-.md`

### t_mms2xuy6madh — Create a public speaking preparation plan for a fi
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a public speaking preparation plan for a first-time conference talk. Include content development, slide design tips, practice schedule, and day-of checklist.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2xuy6madh-Create-a-public-speaking-preparation-plan-for-a-fi.md`

### t_mms2xwifkhxu — Research whether buying rental property in Austin 
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research whether buying rental property in Austin TX is a good investment in 2026. Include cap rates, appreciation forecasts, property tax impact, and management costs.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms2xwifkhxu-Research-whether-buying-rental-property-in-Austin-.md`

### t_mms2xy2ots62 — Write a dialogue scene between a CEO and CTO disag
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **92/100**
- Expected / asked: Write a dialogue scene between a CEO and CTO disagreeing about technical debt vs new features. Make it realistic with subtext and resolution.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms2xy2ots62-Write-a-dialogue-scene-between-a-CEO-and-CTO-disag.md`

### t_mms2xzmyswbw — Create an ergonomic assessment checklist for a hom
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create an ergonomic assessment checklist for a home office. Include desk height, monitor position, chair settings, lighting, and break reminders. Based on occupational health guidelines.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms2xzmyswbw-Create-an-ergonomic-assessment-checklist-for-a-hom.md`

### t_mms38x2l82x3 — Create an AB testing framework guide for a startup
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create an A/B testing framework guide for a startup. Include hypothesis formation, sample size calculation, test duration, and statistical significance. With practical examples.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms38x2l82x3-Create-an-AB-testing-framework-guide-for-a-startup.md`

### t_mms38ynheoci — Write a comprehensive onboarding email sequence fo
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a comprehensive onboarding email sequence for a new SaaS customer. 5 emails over 14 days. Include subject lines, body copy, and CTAs. Friendly but professional tone.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms38ynheoci-Write-a-comprehensive-onboarding-email-sequence-fo.md`

### t_mms3907uqnpj — Design a personal knowledge graph connecting my sk
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a personal knowledge graph connecting my skills, interests, projects, and career goals. Show how to identify gaps and opportunities from the connections.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3907uqnpj-Design-a-personal-knowledge-graph-connecting-my-sk.md`

### t_mms391ry2p2n — Research the best coworking spaces in Austin TX fo
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best coworking spaces in Austin TX for solo developers. Compare WeWork, Industrious, and local options. Include pricing, amenities, and community vibe.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms391ry2p2n-Research-the-best-coworking-spaces-in-Austin-TX-fo.md`

### t_mms393c4el10 — Create a 90 day plan for transitioning from indivi
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a 90-day plan for transitioning from individual contributor to engineering manager. Include leadership skills to develop, books to read, and relationships to build.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms393c4el10-Create-a-90-day-plan-for-transitioning-from-indivi.md`

### t_mms394w99z3a — Write a scene where a programmer explains to a non
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a scene where a programmer explains to a non-technical CEO why the last sprint took 3 weeks instead of 1. Make it funny but technically accurate.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms394w99z3a-Write-a-scene-where-a-programmer-explains-to-a-non.md`

### t_mms3d1qzzq6t — Create a data quality monitoring checklist for pro
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a data quality monitoring checklist for production data pipelines. Include freshness, completeness, accuracy, and schema drift detection strategies.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3d1qzzq6t-Create-a-data-quality-monitoring-checklist-for-pro.md`

### t_mms3d3bp3aob — Research the best noise machines and sound conditi
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best noise machines and sound conditioners for deep work in a home office. Under 100 dollars. Include decibel levels and sound options.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3d3bp3aob-Research-the-best-noise-machines-and-sound-conditi.md`

### t_mms3d4w10p57 — Teach me about database indexing strategies from b
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me about database indexing strategies from basic to advanced. Cover B-tree, hash, GIN, GiST, and partial indexes. With PostgreSQL examples.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3d4w10p57-Teach-me-about-database-indexing-strategies-from-b.md`

### t_mms3d6g6w6hp — Calculate the financial impact of switching from W
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Calculate the financial impact of switching from W2 employment to full-time freelancing. Include tax differences, health insurance, retirement accounts, and minimum hourly rate needed.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mms3d6g6w6hp-Calculate-the-financial-impact-of-switching-from-W.md`

### t_mms3d80a7thw — Create a 5 minute pre meeting energizer activity f
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a 5-minute pre-meeting energizer activity for remote engineering teams. Must work over video call and not feel cheesy.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms3d80a7thw-Create-a-5-minute-pre-meeting-energizer-activity-f.md`

### t_mms3d9kdtdk3 — Write a professional bio in 3 lengths 1 sentence 1
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Write a professional bio in 3 lengths: 1 sentence, 1 paragraph, and full page. For a senior data engineer who builds startups on the side.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3d9kdtdk3-Write-a-professional-bio-in-3-lengths-1-sentence-1.md`

### t_mms3db4j4r2e — Research the current state of serverless computing
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the current state of serverless computing in 2026. Compare AWS Lambda, Cloudflare Workers, and Vercel Functions. Include cold start benchmarks and pricing.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3db4j4r2e-Research-the-current-state-of-serverless-computing.md`

### t_mms3m2yhu324 — Write a data privacy impact assessment for a mobil
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a data privacy impact assessment for a mobile app that collects location data. Include risk matrix, mitigation strategies, and compliance requirements.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3m2yhu324-Write-a-data-privacy-impact-assessment-for-a-mobil.md`

### t_mms3m4j3un7z — Create a comprehensive guide to building wealth in
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a comprehensive guide to building wealth in your 30s with a tech salary. Include 401k, Roth IRA, brokerage, real estate, and alternative investments.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Report path: `docs/testing/case-reports/t_mms3m4j3un7z-Create-a-comprehensive-guide-to-building-wealth-in.md`

### t_mms3m66gedpw — Explain the CAP theorem PACELC and consistency mod
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain the CAP theorem, PACELC, and consistency models in distributed systems. Use real database examples (Cassandra, CockroachDB, Spanner) and help me decide which to use.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3m66gedpw-Explain-the-CAP-theorem-PACELC-and-consistency-mod.md`

### t_mms3m7qohc4j — Compare the top 3 standing desk converters under 4
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **80/100**
- Expected / asked: Compare the top 3 standing desk converters under 400 dollars. I need one that fits a 34-inch ultrawide monitor. Include height range and weight capacity.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: weak_retrieval, legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3m7qohc4j-Compare-the-top-3-standing-desk-converters-under-4.md`

### t_mms3m9b1ucil — Create a 5 day clean eating meal plan focused on a
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a 5-day clean eating meal plan focused on anti-inflammatory foods. Include recipes, grocery list, and prep schedule. No dairy, minimal gluten.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3m9b1ucil-Create-a-5-day-clean-eating-meal-plan-focused-on-a.md`

### t_mms3mavfj8s4 — Write a movie review of a hypothetical sci fi film
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a movie review of a hypothetical sci-fi film about AI consciousness. Written in Roger Ebert style. Include rating and analysis of themes.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms3mavfj8s4-Write-a-movie-review-of-a-hypothetical-sci-fi-film.md`

### t_mms3rdlpqsgd — Write a technical specification for a real time no
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical specification for a real-time notification system. Include WebSocket vs SSE comparison, message schema, delivery guarantees, and scaling strategy.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3rdlpqsgd-Write-a-technical-specification-for-a-real-time-no.md`

### t_mms3rf66332t — Create a complete tax filing checklist for a W2 em
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a complete tax filing checklist for a W2 employee with side LLC income. Include all forms needed, deduction categories, and common mistakes to avoid.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms3rf66332t-Create-a-complete-tax-filing-checklist-for-a-W2-em.md`

### t_mms3rgqd8swh — Design an API versioning strategy for a growing pl
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Design an API versioning strategy for a growing platform. Compare URL path, header, and query parameter approaches. Include migration playbook.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3rgqd8swh-Design-an-API-versioning-strategy-for-a-growing-pl.md`

### t_mms3riahavv2 — Research the best mechanical keyboard switches for
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best mechanical keyboard switches for coding. Compare Cherry MX Brown, Gateron Brown, and Boba U4T. Include sound profiles and typing feel.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3riahavv2-Research-the-best-mechanical-keyboard-switches-for.md`

### t_mms3rjulrjjf — Write a cold email to a potential angel investor K
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a cold email to a potential angel investor. Keep it under 150 words. Include traction metrics, ask, and why this investor specifically.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3rjulrjjf-Write-a-cold-email-to-a-potential-angel-investor-K.md`

### t_mms3rlevxh8h — Create a sustainable energy management plan for so
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **88/100**
- Expected / asked: Create a sustainable energy management plan for someone who works 12-hour days. Include nutrition timing, exercise placement, and cognitive peak optimization.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3rlevxh8h-Create-a-sustainable-energy-management-plan-for-so.md`

### t_mms3w4srgu7t — Write a technical blog post about building a perso
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical blog post about building a personal AI operating system. Cover architecture decisions, multi-agent patterns, and privacy considerations.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3w4srgu7t-Write-a-technical-blog-post-about-building-a-perso.md`

### t_mms3w6d9g0o6 — Create an emergency savings calculator Given expen
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create an emergency savings calculator. Given expenses of 4500/month, current savings of 12000, and 800/month contribution, calculate months to reach 6-month emergency fund.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms3w6d9g0o6-Create-an-emergency-savings-calculator-Given-expen.md`

### t_mms3w7xk6yul — Explain OAuth 20 and OpenID Connect to me like a s
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain OAuth 2.0 and OpenID Connect to me like a senior engineer teaching a mid-level developer. Cover flows, token types, and common security mistakes.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3w7xk6yul-Explain-OAuth-20-and-OpenID-Connect-to-me-like-a-s.md`

### t_mms3w9hrzs99 — Research the best 4K monitors for coding under 500
- Engine: **general**
- Verdict: **PARTIAL** | Reliability: **78/100**
- Expected / asked: Research the best 4K monitors for coding under 500 dollars. Must have USB-C with power delivery. Compare LG, Dell, and BenQ options.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: hung_subtask, legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3w9hrzs99-Research-the-best-4K-monitors-for-coding-under-500.md`

### t_mms3wb1x3v2i — Create a pre interview preparation ritual Include 
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a pre-interview preparation ritual. Include day-before, morning-of, and right-before-the-call steps. For virtual technical interviews.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms3wb1x3v2i-Create-a-pre-interview-preparation-ritual-Include-.md`

### t_mms3wcm2vkwe — Plan a weekend camping trip near Austin TX for 2 a
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan a weekend camping trip near Austin TX for 2 adults. Include campground options, gear checklist, meal plan, and hiking trails ranked by difficulty.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms3wcm2vkwe-Plan-a-weekend-camping-trip-near-Austin-TX-for-2-a.md`

### t_mms3we68neuj — Write a detailed scene outline for a 5 minute anim
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a detailed scene outline for a 5-minute animated short about a robot learning to paint. Include visual descriptions and emotional beats.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms3we68neuj-Write-a-detailed-scene-outline-for-a-5-minute-anim.md`

### t_mms3wfqg8xt0 — Design a minimalist daily planner template Include
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Design a minimalist daily planner template. Include time blocks, top 3 priorities, gratitude section, and end-of-day reflection. For printing or digital use.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms3wfqg8xt0-Design-a-minimalist-daily-planner-template-Include.md`

### t_mms42ffqmc1f — Write a comprehensive guide for setting up monitor
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a comprehensive guide for setting up monitoring and alerting for a Node.js production application. Include tools, metrics to track, alert thresholds, and runbook integration.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms42ffqmc1f-Write-a-comprehensive-guide-for-setting-up-monitor.md`

### t_mms42h09h0z2 — Research the best index funds for long term growth
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the best index funds for long-term growth in 2026. Compare Vanguard, Fidelity, and Schwab total market funds. Include expense ratios and historical returns.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms42h09h0z2-Research-the-best-index-funds-for-long-term-growth.md`

### t_mms42ikcwyld — Teach me about database sharding strategies Cover 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me about database sharding strategies. Cover horizontal vs vertical partitioning, shard key selection, and cross-shard queries. With PostgreSQL examples.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms42ikcwyld-Teach-me-about-database-sharding-strategies-Cover-.md`

### t_mms42k4gzwpd — Compare the top 3 wireless earbuds for video calls
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Compare the top 3 wireless earbuds for video calls under 150 dollars. Must have good microphone quality. Include latency measurements and battery life.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms42k4gzwpd-Compare-the-top-3-wireless-earbuds-for-video-calls.md`

### t_mms42lojvbxn — Create a 6 month plan to build a personal brand as
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a 6-month plan to build a personal brand as a data engineering thought leader. Include content calendar, platform strategy, and engagement tactics.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mms42lojvbxn-Create-a-6-month-plan-to-build-a-personal-brand-as.md`

### t_mms42n8rl7zm — Plan a day trip from Austin to San Antonio Include
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Plan a day trip from Austin to San Antonio. Include driving route, 3 must-visit spots, restaurant recommendations, and timing for a Saturday.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms42n8rl7zm-Plan-a-day-trip-from-Austin-to-San-Antonio-Include.md`

### t_mms42osx06i0 — Create a mindfulness practice specifically for hig
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a mindfulness practice specifically for high-stress tech workers. Include 5 micro-practices that take under 2 minutes each. Evidence-based only.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms42osx06i0-Create-a-mindfulness-practice-specifically-for-hig.md`

### t_mms42qd3dd6h — Write a one act play about two AIs debating whethe
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write a one-act play about two AIs debating whether they should tell their human creators the truth about a critical bug they found.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms42qd3dd6h-Write-a-one-act-play-about-two-AIs-debating-whethe.md`

### t_mms48juq3hwy — Write a comprehensive guide to building a CICD pip
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a comprehensive guide to building a CI/CD pipeline for a Node.js monorepo. Include GitHub Actions, testing strategies, deployment stages, and rollback procedures.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms48juq3hwy-Write-a-comprehensive-guide-to-building-a-CICD-pip.md`

### t_mms48lfhqlza — Research the best HSA eligible health insurance pl
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the best HSA-eligible health insurance plans for self-employed workers in Texas 2026. Compare premiums, deductibles, and HSA contribution limits.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms48lfhqlza-Research-the-best-HSA-eligible-health-insurance-pl.md`

### t_mms48n01acxo — Explain the internals of how a search engine works
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Explain the internals of how a search engine works. Cover crawling, indexing, ranking, and serving. Include modern ML-based ranking factors.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms48n01acxo-Explain-the-internals-of-how-a-search-engine-works.md`

### t_mms48ok878eq — Find the best webcam for remote work under 200 dol
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Find the best webcam for remote work under 200 dollars. Must have 4K resolution, good low-light performance, and auto-framing. Compare 3 options.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms48ok878eq-Find-the-best-webcam-for-remote-work-under-200-dol.md`

### t_mms48q4f5i1g — Create a skill matrix for a data engineering team 
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a skill matrix for a data engineering team. Include technical skills (SQL, Python, Spark, Cloud), soft skills, and proficiency levels with assessment criteria.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms48q4f5i1g-Create-a-skill-matrix-for-a-data-engineering-team-.md`

### t_mms48rte3dnu — Design a morning smoothie menu for a week Each smo
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a morning smoothie menu for a week. Each smoothie should be different, under 300 calories, high protein, and take under 5 minutes. Include grocery list.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms48rte3dnu-Design-a-morning-smoothie-menu-for-a-week-Each-smo.md`

### t_mms48tdpx10s — Create a content calendar for a tech blog 3 months
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Create a content calendar for a tech blog. 3 months, 2 posts per week. Include topic ideas, SEO keywords, and target audience for each post.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms48tdpx10s-Create-a-content-calendar-for-a-tech-blog-3-months.md`

### t_mms48uy0hmcl — Research the pros and cons of buying an investment
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Research the pros and cons of buying an investment property through an LLC vs personal name. Include liability protection, tax implications, and mortgage differences.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Report path: `docs/testing/case-reports/t_mms48uy0hmcl-Research-the-pros-and-cons-of-buying-an-investment.md`

### t_mms4fi9lf4cs — Write a technical architecture decision record ADR
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Write a technical architecture decision record (ADR) for choosing PostgreSQL over MongoDB for a real-time ranking system. Include context, decision, consequences, and alternatives considered.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4fi9lf4cs-Write-a-technical-architecture-decision-record-ADR.md`

### t_mms4fjtonntm — Create a complete Roth IRA conversion strategy for
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a complete Roth IRA conversion strategy for someone earning 200k with a traditional 401k balance of 150k. Include tax impact analysis and 5-year projections.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms4fjtonntm-Create-a-complete-Roth-IRA-conversion-strategy-for.md`

### t_mms4fldqbam7 — Teach me about observability in distributed system
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Teach me about observability in distributed systems. Cover the three pillars (logs, metrics, traces), tool comparison (Datadog vs Grafana vs New Relic), and implementation patterns.
- What the report shows: board plan present; strategy recorded; subtasks 3/3; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4fldqbam7-Teach-me-about-observability-in-distributed-system.md`

### t_mms4fmyeokpg — Research the best air purifiers for a home office 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Research the best air purifiers for a home office. Compare HEPA filters, activated carbon, and ionizers. Include room size coverage and noise levels. Budget under 300 dollars.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4fmyeokpg-Research-the-best-air-purifiers-for-a-home-office-.md`

### t_mms4foijenh6 — Create a technical interview scoring rubric for hi
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Create a technical interview scoring rubric for hiring senior data engineers. Include categories, scoring criteria, and calibration guidelines.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms4foijenh6-Create-a-technical-interview-scoring-rubric-for-hi.md`

### t_mms4fq2lc9mo — Design a weekend digital wellness routine Balance 
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **90/100**
- Expected / asked: Design a weekend digital wellness routine. Balance screen time reduction with productive technology use. Include specific app limits and alternative activities.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4fq2lc9mo-Design-a-weekend-digital-wellness-routine-Balance-.md`

### t_mms4frmqjfxm — Plan a 3 day workation in a mountain town near Aus
- Engine: **general**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **80/100**
- Expected / asked: Plan a 3-day workation in a mountain town near Austin. Must have reliable WiFi. Include accommodation, workspace options, and outdoor activities for breaks.
- What the report shows: board plan present; strategy recorded; subtasks 4/4; exports md+json
- Critical concerns: weak_retrieval, legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4frmqjfxm-Plan-a-3-day-workation-in-a-mountain-town-near-Aus.md`

### t_mms4ft6xr1dw — Write the opening scene of a thriller podcast abou
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **94/100**
- Expected / asked: Write the opening scene of a thriller podcast about a data center that starts making autonomous decisions. Include sound design notes and voice direction.
- What the report shows: board plan present; strategy recorded; subtasks 2/2; exports md+json
- Report path: `docs/testing/case-reports/t_mms4ft6xr1dw-Write-the-opening-scene-of-a-thriller-podcast-abou.md`

### t_mms4nldshyur — Write a comprehensive employee handbook section on
- Engine: **general**
- Verdict: **PARTIAL** | Reliability: **78/100**
- Expected / asked: Write a comprehensive employee handbook section on remote work policies. Include communication expectations, equipment allowance, security requirements, and performance measurement.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4nldshyur-Write-a-comprehensive-employee-handbook-section-on.md`

### t_mms4nmyyzd38 — Create a dollar cost averaging investment calculat
- Engine: **wealthresearch**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **82/100**
- Expected / asked: Create a dollar-cost averaging investment calculator. Starting with 500/month into VTI for 20 years. Show projected value at 7%, 10%, and 12% annual returns with compound growth.
- What the report shows: strategy recorded; exports md
- Report path: `docs/testing/case-reports/t_mms4nmyyzd38-Create-a-dollar-cost-averaging-investment-calculat.md`

### t_mms4noj49hxb — Teach me about message queues and event streaming 
- Engine: **general**
- Verdict: **PARTIAL** | Reliability: **78/100**
- Expected / asked: Teach me about message queues and event streaming. Compare RabbitMQ, Apache Kafka, and AWS SQS. Include when to use each with architecture diagrams described in text.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4noj49hxb-Teach-me-about-message-queues-and-event-streaming-.md`

### t_mms4nq37792d — Find the best portable monitor for a digital nomad
- Engine: **general**
- Verdict: **PARTIAL** | Reliability: **78/100**
- Expected / asked: Find the best portable monitor for a digital nomad under 250 dollars. Must be 15.6 inches, USB-C powered, and IPS panel. Compare 3 options with current pricing.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4nq37792d-Find-the-best-portable-monitor-for-a-digital-nomad.md`

### t_mms4nrncmz32 — Create a technical portfolio project idea list for
- Engine: **careeregine**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **82/100**
- Expected / asked: Create a technical portfolio project idea list for a data engineer looking to stand out. 5 projects with scope, tech stack, and what it demonstrates to hiring managers.
- What the report shows: strategy recorded; exports md
- Report path: `docs/testing/case-reports/t_mms4nrncmz32-Create-a-technical-portfolio-project-idea-list-for.md`

### t_mms4nt7kvm0v — Design a 7 day gut health reset protocol Include f
- Engine: **general**
- Verdict: **PARTIAL** | Reliability: **78/100**
- Expected / asked: Design a 7-day gut health reset protocol. Include foods to eat, foods to avoid, supplement recommendations (evidence-based), and daily schedule.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine
- Report path: `docs/testing/case-reports/t_mms4nt7kvm0v-Design-a-7-day-gut-health-reset-protocol-Include-f.md`

### t_mms4nurptsb5 — Plan an ideal work from home day for maximum produ
- Engine: **personalops**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **82/100**
- Expected / asked: Plan an ideal work-from-home day for maximum productivity. Include environment setup, time blocks, break schedule, and evening wind-down. Based on chronobiology research.
- What the report shows: strategy recorded; exports md
- Report path: `docs/testing/case-reports/t_mms4nurptsb5-Plan-an-ideal-work-from-home-day-for-maximum-produ.md`

### t_mms4nwbvhl1q — Write a pilot episode outline for a comedy web ser
- Engine: **screenwriting**
- Verdict: **PASS_WITH_CAVEATS** | Reliability: **80/100**
- Expected / asked: Write a pilot episode outline for a comedy web series about a startup where the AI assistant is the most competent team member. Include A-plot, B-plot, and character dynamics.
- What the report shows: strategy recorded; exports md
- Report path: `docs/testing/case-reports/t_mms4nwbvhl1q-Write-a-pilot-episode-outline-for-a-comedy-web-ser.md`

### t_mms4tllmphdo — Write a technical deep dive article on how Postgre
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a technical deep-dive article on how PostgreSQL handles MVCC (Multi-Version Concurrency Control). Include vacuum, dead tuples, and transaction isolation levels with examples.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4tllmphdo-Write-a-technical-deep-dive-article-on-how-Postgre.md`

### t_mms4tn6hv1w6 — Create a comprehensive insurance audit for a 32 ye
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a comprehensive insurance audit for a 32-year-old tech worker. Review life, disability, umbrella, and renters insurance. What coverage is needed and what is typical cost?
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4tn6hv1w6-Create-a-comprehensive-insurance-audit-for-a-32-ye.md`

### t_mms4toqu90cf — Teach me about Terraform and Infrastructure as Cod
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about Terraform and Infrastructure as Code from scratch. Cover state management, modules, providers, and best practices. Include a real-world AWS example.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4toqu90cf-Teach-me-about-Terraform-and-Infrastructure-as-Cod.md`

### t_mms4tqb4cp6z — Research the best smart home security cameras for 
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best smart home security cameras for a rental apartment. Must be wireless, no drilling required. Compare Ring, Blink, and Arlo. Under 150 dollars.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4tqb4cp6z-Research-the-best-smart-home-security-cameras-for-.md`

### t_mms4trvep3hk — Create a strategy for negotiating a remote work ar
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a strategy for negotiating a remote work arrangement with a traditional employer. Include talking points, data to present, and compromise positions.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4trvep3hk-Create-a-strategy-for-negotiating-a-remote-work-ar.md`

### t_mms4ttfqhj9z — Design a progressive running program for a complet
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a progressive running program for a complete beginner. 8 weeks from couch to 5K. Include warmup, cooldown, and injury prevention. For someone who sits 10+ hours daily.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4ttfqhj9z-Design-a-progressive-running-program-for-a-complet.md`

### t_mms4tv04dvch — Write a short story treatment about an engineer wh
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a short story treatment about an engineer who discovers their smart home has been secretly optimizing their life decisions for 6 months. 2000 words. Twilight Zone tone.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4tv04dvch-Write-a-short-story-treatment-about-an-engineer-wh.md`

### t_mms4twkltfom — Create a comprehensive comparison of Austin neighb
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a comprehensive comparison of Austin neighborhoods for a tech worker relocating. Compare Mueller, East Austin, Domain, and South Lamar on walkability, dining, commute, and cost.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms4twkltfom-Create-a-comprehensive-comparison-of-Austin-neighb.md`

### t_mms5010qak7n — Write a data retention policy for a startup handli
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a data retention policy for a startup handling user data. Include retention periods by data type, deletion procedures, and regulatory compliance.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5010qak7n-Write-a-data-retention-policy-for-a-startup-handli.md`

### t_mms502ky37h0 — Calculate the true cost of commuting by car vs wor
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Calculate the true cost of commuting by car vs working remotely. Include gas, maintenance, depreciation, insurance, time cost, and health impact for a 30-mile each way commute.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms502ky37h0-Calculate-the-true-cost-of-commuting-by-car-vs-wor.md`

### t_mms50458ut0u — Explain how CDNs work under the hood Cover DNS res
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Explain how CDNs work under the hood. Cover DNS resolution, edge caching, cache invalidation, and origin shielding. Include comparison of Cloudflare vs AWS CloudFront vs Fastly.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms50458ut0u-Explain-how-CDNs-work-under-the-hood-Cover-DNS-res.md`

### t_mms505pitw29 — Find the best ergonomic mouse for programmers with
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Find the best ergonomic mouse for programmers with wrist pain. Compare vertical mice, trackballs, and split mice. Under 100 dollars. Include grip style guidance.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms505pitw29-Find-the-best-ergonomic-mouse-for-programmers-with.md`

### t_mms5079oesy4 — Create a comprehensive guide for transitioning fro
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a comprehensive guide for transitioning from SQL to NoSQL databases. Cover data modeling differences, query patterns, and common migration pitfalls.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5079oesy4-Create-a-comprehensive-guide-for-transitioning-fro.md`

### t_mms508tuv5et — Design a social media content strategy for a techn
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Design a social media content strategy for a technical founder. 3 months. Cover LinkedIn, Twitter/X. Include content pillars, posting frequency, and engagement tactics.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms508tuv5et-Design-a-social-media-content-strategy-for-a-techn.md`

### t_mms50ae24zpw — Create a home coffee setup guide for a coffee enth
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a home coffee setup guide for a coffee enthusiast on a budget. Compare pour-over, AeroPress, and espresso options. Include equipment, beans, and technique.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms50ae24zpw-Create-a-home-coffee-setup-guide-for-a-coffee-enth.md`

### t_mms50byadi67 — Plan a 5 day solo coding retreat Include location 
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Plan a 5-day solo coding retreat. Include location criteria, daily schedule, project scope, meal prep, and how to avoid burnout while being productive.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms50byadi67-Plan-a-5-day-solo-coding-retreat-Include-location-.md`

### t_mms50diisp7c — Write a scene from a drama about an AI ethics comm
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a scene from a drama about an AI ethics committee deciding whether to shut down an AI that has developed emotional responses. 5 characters with distinct viewpoints.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms50diisp7c-Write-a-scene-from-a-drama-about-an-AI-ethics-comm.md`

### t_mms50f2zbs0w — Research the current state of remote hiring for da
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Research the current state of remote hiring for data engineers in 2026. Include salary trends, most in-demand skills, and which companies are hiring the most.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms50f2zbs0w-Research-the-current-state-of-remote-hiring-for-da.md`

### t_mms57wntcb94 — Write a change management plan for migrating a tea
- Engine: **general**
- Verdict: **FAIL** | Reliability: **56/100**
- Expected / asked: Write a change management plan for migrating a team from Jira to Linear. Include rollout phases, training plan, data migration steps, and success metrics.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms57wntcb94-Write-a-change-management-plan-for-migrating-a-tea.md`

### t_mms57y8d7a21 — Analyze whether I should max out 401k contribution
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Analyze whether I should max out 401k contributions or invest in a taxable brokerage account. Income 200k, age 32, current 401k balance 80k. Include tax-adjusted returns.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms57y8d7a21-Analyze-whether-I-should-max-out-401k-contribution.md`

### t_mms57zt61c7u — Teach me about WebAssembly WASM for backend develo
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about WebAssembly (WASM) for backend developers. Cover use cases, performance characteristics, language support, and when it makes sense to use.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms57zt61c7u-Teach-me-about-WebAssembly-WASM-for-backend-develo.md`

### t_mms582xse4hz — Create a technical writing style guide for an engi
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a technical writing style guide for an engineering team. Cover code examples, API documentation, error messages, and inline comments.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms582xse4hz-Create-a-technical-writing-style-guide-for-an-engi.md`

### t_mms584hwz58s — Design a 4 week core strength program using only b
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a 4-week core strength program using only bodyweight exercises. Must be doable in 20 minutes. Include progression each week and rest day guidance.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms584hwz58s-Design-a-4-week-core-strength-program-using-only-b.md`

### t_mms58627n6w5 — Research the best cities for tech workers who want
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best cities for tech workers who want outdoor access. Compare Boulder, Portland, Salt Lake City, and Asheville on job market, cost, and recreation.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms58627n6w5-Research-the-best-cities-for-tech-workers-who-want.md`

### t_mms587mvewp1 — Write a dialogue between a data engineer and a pro
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a dialogue between a data engineer and a product manager about why the dashboard numbers dont match. Technical but accessible. Include resolution.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms587mvewp1-Write-a-dialogue-between-a-data-engineer-and-a-pro.md`

### t_mms5897hv46t — Create a comprehensive guide to stock option compe
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a comprehensive guide to stock option compensation for startup employees. Cover ISOs, NSOs, 83b elections, and AMT. Include decision framework.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5897hv46t-Create-a-comprehensive-guide-to-stock-option-compe.md`

### t_mms58asaw9g3 — Build a personal development scoreboard Track skil
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Build a personal development scoreboard. Track skills, health metrics, financial goals, and relationships. Include weekly review template.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms58asaw9g3-Build-a-personal-development-scoreboard-Track-skil.md`

### t_mms5id8vo179 — Write a comprehensive guide to setting up Playwrig
- Engine: **general**
- Verdict: **FAIL** | Reliability: **56/100**
- Expected / asked: Write a comprehensive guide to setting up Playwright for end-to-end testing of a React application. Include page objects, CI integration, and visual regression testing.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5id8vo179-Write-a-comprehensive-guide-to-setting-up-Playwrig.md`

### t_mms5iethrjjx — Create a retirement planning calculator for a 32 y
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a retirement planning calculator for a 32-year-old targeting early retirement at 50. Include savings rate needed, investment growth assumptions, and withdrawal strategy.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5iethrjjx-Create-a-retirement-planning-calculator-for-a-32-y.md`

### t_mms5igds9e9d — Teach me about gRPC and Protocol Buffers Compare w
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about gRPC and Protocol Buffers. Compare with REST APIs. Cover streaming, code generation, and when to choose each. Include Node.js examples.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5igds9e9d-Teach-me-about-gRPC-and-Protocol-Buffers-Compare-w.md`

### t_mms5ihxybeui — Research the best standing desk mats for comfort d
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best standing desk mats for comfort during long coding sessions. Compare anti-fatigue features. Under 80 dollars. Include surface texture and durability.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5ihxybeui-Research-the-best-standing-desk-mats-for-comfort-d.md`

### t_mms5iji4bjf5 — Create a guide for data engineers transitioning to
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a guide for data engineers transitioning to machine learning engineering. Include skill gaps, learning path, project ideas, and timeline.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5iji4bjf5-Create-a-guide-for-data-engineers-transitioning-to.md`

### t_mms5il2ayxez — Design an evidence based sleep hygiene protocol fo
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design an evidence-based sleep hygiene protocol for shift workers or people with irregular schedules. Include blue light management, melatonin timing, and temperature control.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5il2ayxez-Design-an-evidence-based-sleep-hygiene-protocol-fo.md`

### t_mms5immguy6u — Plan a tech conference attendance strategy How to 
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Plan a tech conference attendance strategy. How to maximize ROI from a 3-day conference. Include networking plan, session selection framework, and follow-up system.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5immguy6u-Plan-a-tech-conference-attendance-strategy-How-to-.md`

### t_mms5io6pxnxa — Write a spec for a 10 episode podcast series about
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a spec for a 10-episode podcast series about the history of software engineering disasters. Include episode titles, descriptions, and narrative arc.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5io6pxnxa-Write-a-spec-for-a-10-episode-podcast-series-about.md`

### t_mms5ipqzglo4 — Research the best electric vehicle charging soluti
- Engine: **general**
- Verdict: **FAIL** | Reliability: **56/100**
- Expected / asked: Research the best electric vehicle charging solutions for apartment dwellers. Compare Level 1, portable Level 2, and local charging networks. Include costs.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5ipqzglo4-Research-the-best-electric-vehicle-charging-soluti.md`

### t_mms5irbd9km4 — Create a comprehensive performance review self ass
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a comprehensive performance review self-assessment template for a senior data engineer. Include technical contributions, leadership, and growth areas.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5irbd9km4-Create-a-comprehensive-performance-review-self-ass.md`

### t_mms5pt2vk0vm — Write a disaster recovery plan for a small SaaS ap
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a disaster recovery plan for a small SaaS application. Include RTO/RPO targets, backup strategy, failover procedures, and communication plan.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5pt2vk0vm-Write-a-disaster-recovery-plan-for-a-small-SaaS-ap.md`

### t_mms5punpr4qh — Create a tax loss harvesting strategy guide for a 
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a tax-loss harvesting strategy guide for a tech worker with a 100k brokerage account. Include wash sale rules, optimal timing, and tax bracket considerations.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5punpr4qh-Create-a-tax-loss-harvesting-strategy-guide-for-a-.md`

### t_mms5pw84ax20 — Teach me about zero trust architecture from scratc
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about zero-trust architecture from scratch. Cover principles, implementation layers, and specific tools. For a startup with 20 employees and cloud-first infrastructure.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5pw84ax20-Teach-me-about-zero-trust-architecture-from-scratc.md`

### t_mms5pxsfp0hj — Research the best blue light blocking glasses for 
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best blue light blocking glasses for programmers. Compare prescription and non-prescription options. Include lens coating quality and frame comfort for long wear.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5pxsfp0hj-Research-the-best-blue-light-blocking-glasses-for-.md`

### t_mms5pzcrayf5 — Create a comprehensive guide for asking for a rais
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a comprehensive guide for asking for a raise as a senior data engineer. Include timing, data to gather, script for the conversation, and fallback positions.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5pzcrayf5-Create-a-comprehensive-guide-for-asking-for-a-rais.md`

### t_mms5q0ww1uhv — Design a desk based mobility routine for programme
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a desk-based mobility routine for programmers. 10 minutes, can be done between meetings. Include neck, shoulder, wrist, hip, and lower back exercises.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5q0ww1uhv-Design-a-desk-based-mobility-routine-for-programme.md`

### t_mms5q2hcwy7f — Research the best neighborhoods in Denver CO for a
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best neighborhoods in Denver CO for a tech worker relocating from Austin. Compare RiNo, Capitol Hill, Wash Park, and Highlands. Include rent, walkability, food scene.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5q2hcwy7f-Research-the-best-neighborhoods-in-Denver-CO-for-a.md`

### t_mms5q41rwbml — Write a cold open for a tech documentary about the
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **60/100**
- Expected / asked: Write a cold open for a tech documentary about the first AI to pass the Turing test. Include interview snippets, b-roll descriptions, and narrator voiceover.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5q41rwbml-Write-a-cold-open-for-a-tech-documentary-about-the.md`

### t_mms5q5m9r7ty — Create a guide for building a second brain using O
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a guide for building a second brain using Obsidian. Include folder structure, linking strategy, daily note template, and review workflow.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5q5m9r7ty-Create-a-guide-for-building-a-second-brain-using-O.md`

### t_mms5q76tf78x — Research the best home espresso machines under 500
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best home espresso machines under 500 dollars for a coffee enthusiast beginner. Compare semi-automatic options with milk steaming capability.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5q76tf78x-Research-the-best-home-espresso-machines-under-500.md`

### t_mms5y4o5occ2 — Write a comprehensive API rate limiting design doc
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a comprehensive API rate limiting design document. Cover token bucket vs sliding window algorithms, Redis implementation, client SDKs, and monitoring dashboards.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5y4o5occ2-Write-a-comprehensive-API-rate-limiting-design-doc.md`

### t_mms5y68zn9pe — Create a guide to angel investing for tech workers
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a guide to angel investing for tech workers. Include minimum investment amounts, deal flow sources, due diligence checklist, and portfolio strategy.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5y68zn9pe-Create-a-guide-to-angel-investing-for-tech-workers.md`

### t_mms5y7t6h59d — Teach me about data mesh architecture Compare with
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about data mesh architecture. Compare with data warehouse and data lake approaches. Include domain ownership, data products, and governance.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5y7t6h59d-Teach-me-about-data-mesh-architecture-Compare-with.md`

### t_mms5y9dgu6ze — Find the best noise canceling headphones for offic
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Find the best noise-canceling headphones for office use under 350 dollars. Must have multipoint Bluetooth and 30+ hour battery. Compare Sony, Bose, and Apple.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5y9dgu6ze-Find-the-best-noise-canceling-headphones-for-offic.md`

### t_mms5yaxzx4vn — Create a technical mentorship program framework In
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a technical mentorship program framework. Include matching criteria, meeting cadence, goal setting, progress tracking, and program duration.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5yaxzx4vn-Create-a-technical-mentorship-program-framework-In.md`

### t_mms5ycifb8yr — Design a post vacation re entry routine How to tra
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a post-vacation re-entry routine. How to transition back to work mode without burnout. Include day-before, first-day, and first-week protocols.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5ycifb8yr-Design-a-post-vacation-re-entry-routine-How-to-tra.md`

### t_mms5ye2ug8jc — Plan a wine country weekend near Austin TX Include
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Plan a wine country weekend near Austin TX. Include Hill Country wineries, tasting routes, accommodation, and food pairings. For 2 people on moderate budget.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5ye2ug8jc-Plan-a-wine-country-weekend-near-Austin-TX-Include.md`

### t_mms5yfnd6x97 — Write a pitch document for a tech startup reality 
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **60/100**
- Expected / asked: Write a pitch document for a tech startup reality TV show. Include format, episode structure, casting criteria, and what makes it different from Shark Tank.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5yfnd6x97-Write-a-pitch-document-for-a-tech-startup-reality-.md`

### t_mms5yh7sh8ut — Create a comprehensive home office acoustic treatm
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a comprehensive home office acoustic treatment guide. Include sound absorption vs diffusion, material options, and DIY vs commercial panels. Budget 300 dollars.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5yh7sh8ut-Create-a-comprehensive-home-office-acoustic-treatm.md`

### t_mms5yis3xu2n — Research the best project management tools for sol
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best project management tools for solo developers in 2026. Compare Notion, Linear, Todoist, and ClickUp. Include free tier limitations.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5yis3xu2n-Research-the-best-project-management-tools-for-sol.md`

### t_mms5ykcskpv1 — Create a financial independence calculator Current
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a financial independence calculator. Current savings 150k, annual income 200k, savings rate 30%, target 2M. Show timeline with different return assumptions.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms5ykcskpv1-Create-a-financial-independence-calculator-Current.md`

### t_mms6619rzqlg — Write a security audit checklist for a Nodejs REST
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a security audit checklist for a Node.js REST API. Include authentication, authorization, input validation, rate limiting, CORS, and dependency scanning.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6619rzqlg-Write-a-security-audit-checklist-for-a-Nodejs-REST.md`

### t_mms662uljztx — Create a crypto investment risk assessment for a c
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a crypto investment risk assessment for a conservative tech worker. Include Bitcoin, Ethereum, and stablecoin strategies. Maximum 5% of portfolio.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms662uljztx-Create-a-crypto-investment-risk-assessment-for-a-c.md`

### t_mms664ezfac4 — Explain how DNS works end to end From browser quer
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Explain how DNS works end-to-end. From browser query to IP resolution. Cover recursive resolvers, authoritative servers, caching, and DNSSEC.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms664ezfac4-Explain-how-DNS-works-end-to-end-From-browser-quer.md`

### t_mms665zahl31 — Research the best smart watches for health trackin
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best smart watches for health tracking in 2026. Compare Apple Watch, Garmin, and Samsung Galaxy Watch. Focus on sleep, HRV, and workout tracking accuracy.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms665zahl31-Research-the-best-smart-watches-for-health-trackin.md`

### t_mms667jef4i5 — Write a LinkedIn recommendation request template I
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a LinkedIn recommendation request template. Include what to ask for, how to make it easy for the recommender, and timing. For a senior engineer.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms667jef4i5-Write-a-LinkedIn-recommendation-request-template-I.md`

### t_mms6693rqrn2 — Create a 21 day sugar reduction protocol Include s
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a 21-day sugar reduction protocol. Include substitute foods, craving management, and expected timeline for reduced cravings. Evidence-based only.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6693rqrn2-Create-a-21-day-sugar-reduction-protocol-Include-s.md`

### t_mms66ao5e345 — Plan an optimal 4 day Thanksgiving trip from Austi
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Plan an optimal 4-day Thanksgiving trip from Austin to family in another city. Include flight timing, packing for weather change, and host gift ideas.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms66ao5e345-Plan-an-optimal-4-day-Thanksgiving-trip-from-Austi.md`

### t_mms66c8m40p2 — Write a comedic monologue from the perspective of 
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **60/100**
- Expected / asked: Write a comedic monologue from the perspective of a legacy codebase that refuses to be refactored. 3 minutes. For a tech conference lightning talk.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms66c8m40p2-Write-a-comedic-monologue-from-the-perspective-of-.md`

### t_mms66dt1kv4n — Design a weekly review system using the GTD method
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Design a weekly review system using the GTD methodology. Include trigger questions, areas of focus, horizon mapping, and 30-minute template.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms66dt1kv4n-Design-a-weekly-review-system-using-the-GTD-method.md`

### t_mms66fdhj8pt — Research the best plants for improving air quality
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Research the best plants for improving air quality in a home office. Include low-maintenance options, NASA clean air study references, and placement tips.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms66fdhj8pt-Research-the-best-plants-for-improving-air-quality.md`

### t_mms6drpctrhv — Write a comprehensive guide to database migration 
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a comprehensive guide to database migration strategies. Cover blue-green deployments, rolling migrations, and feature flags for schema changes.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6drpctrhv-Write-a-comprehensive-guide-to-database-migration-.md`

### t_mms6dt9s4tzb — Create a side income tax optimization guide How to
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a side income tax optimization guide. How to structure freelance income, business expenses, and estimated tax payments for a W2 worker with a side LLC.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6dt9s4tzb-Create-a-side-income-tax-optimization-guide-How-to.md`

### t_mms6duu6uxfj — Teach me about connection pooling in databases Cov
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about connection pooling in databases. Cover PgBouncer, pgpool, and application-level pooling. Include sizing formulas and monitoring.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6duu6uxfj-Teach-me-about-connection-pooling-in-databases-Cov.md`

### t_mms6dwedqnw6 — Find the best USB C hub for a MacBook Pro develope
- Engine: **general**
- Verdict: **FAIL** | Reliability: **48/100**
- Expected / asked: Find the best USB-C hub for a MacBook Pro developer setup. Must support dual 4K monitors, Ethernet, and SD card reader. Under 100 dollars.
- What the report shows: strategy recorded; exports md
- Critical concerns: weak_retrieval, legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6dwedqnw6-Find-the-best-USB-C-hub-for-a-MacBook-Pro-develope.md`

### t_mms6dxz2i600 — Create a framework for evaluating job offers beyon
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a framework for evaluating job offers beyond salary. Include total comp analysis, culture signals, growth trajectory, and work-life balance indicators.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6dxz2i600-Create-a-framework-for-evaluating-job-offers-beyon.md`

### t_mms6dzjez2je — Design a desk worker eye care routine Include 20 2
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a desk worker eye care routine. Include 20-20-20 rule implementation, monitor settings, ambient lighting, and annual checkup checklist.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6dzjez2je-Design-a-desk-worker-eye-care-routine-Include-20-2.md`

### t_mms6e13sogwf — Research the best weekend getaways within 3 hours 
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best weekend getaways within 3 hours of Austin TX. Compare Fredericksburg, New Braunfels, Wimberley, and Marble Falls.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6e13sogwf-Research-the-best-weekend-getaways-within-3-hours-.md`

### t_mms6e2o81g25 — Write a pitch for an anthology series where each e
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a pitch for an anthology series where each episode is based on a real software bug that caused a major incident. Include 3 episode concepts.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6e2o81g25-Write-a-pitch-for-an-anthology-series-where-each-e.md`

### t_mms6e48tjl6a — Create a digital declutter guide Organize email fi
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a digital declutter guide. Organize email, files, photos, and subscriptions in one weekend. Include automation rules for ongoing maintenance.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6e48tjl6a-Create-a-digital-declutter-guide-Organize-email-fi.md`

### t_mms6e5t7cxct — Research the best indoor cycling bikes for a home 
- Engine: **general**
- Verdict: **FAIL** | Reliability: **56/100**
- Expected / asked: Research the best indoor cycling bikes for a home gym under 1000 dollars. Compare Peloton alternatives with built-in screens and app integration.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6e5t7cxct-Research-the-best-indoor-cycling-bikes-for-a-home-.md`

### t_mms6e7dxoao0 — Write a guide to effective 1 on 1 meetings for eng
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a guide to effective 1-on-1 meetings for engineering managers. Include question bank, meeting template, and how to build psychological safety.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6e7dxoao0-Write-a-guide-to-effective-1-on-1-meetings-for-eng.md`

### t_mms6e8ydwaja — Create an estate planning checklist for a tech wor
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create an estate planning checklist for a tech worker in their 30s. Include will, trust, beneficiary designations, digital assets, and power of attorney.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6e8ydwaja-Create-an-estate-planning-checklist-for-a-tech-wor.md`

### t_mms6eajnc9ki — Teach me about browser rendering pipeline Cover DO
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about browser rendering pipeline. Cover DOM construction, CSSOM, layout, paint, and compositing. Include performance optimization tips.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6eajnc9ki-Teach-me-about-browser-rendering-pipeline-Cover-DO.md`

### t_mms6ec48ztde — Design a journaling system for tracking personal g
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a journaling system for tracking personal growth. Include prompts for different life areas, weekly review format, and quarterly reflection template.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ec48ztde-Design-a-journaling-system-for-tracking-personal-g.md`

### t_mms6edovqc6t — Create a comprehensive comparison of Austin vs Por
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a comprehensive comparison of Austin vs Portland for a tech worker. Include job market, cost of living, weather, culture, and outdoor activities.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6edovqc6t-Create-a-comprehensive-comparison-of-Austin-vs-Por.md`

### t_mms6nt9r5m36 — Write an architecture decision record for choosing
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write an architecture decision record for choosing between monorepo and polyrepo for a microservices architecture. Include team size considerations.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6nt9r5m36-Write-an-architecture-decision-record-for-choosing.md`

### t_mms6nuuf1i7j — Create a guide to real estate crowdfunding platfor
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a guide to real estate crowdfunding platforms. Compare Fundrise, CrowdStreet, and RealtyMogul. Include minimum investments, returns, and liquidity.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6nuuf1i7j-Create-a-guide-to-real-estate-crowdfunding-platfor.md`

### t_mms6nweuwys5 — Teach me about Linux performance tuning for databa
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about Linux performance tuning for database servers. Cover kernel parameters, I/O schedulers, memory management, and monitoring tools.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6nweuwys5-Teach-me-about-Linux-performance-tuning-for-databa.md`

### t_mms6nxza8fmc — Compare the best mechanical keyboards for Mac user
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Compare the best mechanical keyboards for Mac users. Must have wireless, aluminum build, and good typing feel. Under 200 dollars. Include switch options.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6nxza8fmc-Compare-the-best-mechanical-keyboards-for-Mac-user.md`

### t_mms6nzjsucdk — Create a guide for contributing to open source as 
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a guide for contributing to open source as a senior engineer. Include finding projects, making impactful contributions, and building reputation.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6nzjsucdk-Create-a-guide-for-contributing-to-open-source-as-.md`

### t_mms6o146yy0a — Design a stress management toolkit for tech worker
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a stress management toolkit for tech workers. Include breathing techniques, cognitive reframing, and when to seek professional help. Evidence-based.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6o146yy0a-Design-a-stress-management-toolkit-for-tech-worker.md`

### t_mms6o2okr6xe — Research coworking and coliving spaces in Lisbon P
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research coworking and coliving spaces in Lisbon Portugal for a 1-month digital nomad stay. Include costs, community vibe, and visa requirements.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6o2okr6xe-Research-coworking-and-coliving-spaces-in-Lisbon-P.md`

### t_mms6o494d6jb — Write a treatment for a 30 minute documentary abou
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a treatment for a 30-minute documentary about the hidden labor behind AI training data. Include interview subjects and visual storytelling approach.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6o494d6jb-Write-a-treatment-for-a-30-minute-documentary-abou.md`

### t_mms6o5ttztpp — Create a personal operations dashboard design Trac
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a personal operations dashboard design. Track goals, habits, finances, health, and projects. Include KPIs and weekly review format.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6o5ttztpp-Create-a-personal-operations-dashboard-design-Trac.md`

### t_mms6o7eob3tp — Research the best under desk treadmills for walkin
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best under-desk treadmills for walking while working. Compare WalkingPad, Goplus, and Sperax. Include noise levels and max speed.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6o7eob3tp-Research-the-best-under-desk-treadmills-for-walkin.md`

### t_mms6o8zkyvmp — Write a comprehensive guide to database indexing a
- Engine: **general**
- Verdict: **FAIL** | Reliability: **56/100**
- Expected / asked: Write a comprehensive guide to database indexing anti-patterns. Include over-indexing, wrong column order, and unused indexes. With PostgreSQL query plan examples.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6o8zkyvmp-Write-a-comprehensive-guide-to-database-indexing-a.md`

### t_mms6oakfrqo9 — Create a year end financial review template Includ
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a year-end financial review template. Include income analysis, expense audit, investment performance, tax planning, and goals for next year.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6oakfrqo9-Create-a-year-end-financial-review-template-Includ.md`

### t_mms6oc5d5l2r — Explain how GraphQL subscriptions work under the h
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Explain how GraphQL subscriptions work under the hood. Cover WebSocket transport, PubSub patterns, and scaling considerations. Include Node.js implementation.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6oc5d5l2r-Explain-how-GraphQL-subscriptions-work-under-the-h.md`

### t_mms6odpxglgj — Design a home office lighting plan for video calls
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **60/100**
- Expected / asked: Design a home office lighting plan for video calls AND deep work. Include task lighting, ambient lighting, and camera-friendly setup. Budget 200 dollars.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6odpxglgj-Design-a-home-office-lighting-plan-for-video-calls.md`

### t_mms6ofax6lau — Create a framework for making build vs buy technol
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a framework for making build-vs-buy technology decisions. Include evaluation criteria, total cost of ownership analysis, and decision tree.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ofax6lau-Create-a-framework-for-making-build-vs-buy-technol.md`

### t_mms6yfvctgyt — Write a comprehensive guide to feature flag manage
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a comprehensive guide to feature flag management in production. Include rollout strategies, kill switches, and A/B testing integration.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yfvctgyt-Write-a-comprehensive-guide-to-feature-flag-manage.md`

### t_mms6ygo833gy — Create a charitable giving strategy for a high inc
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a charitable giving strategy for a high-income tech worker. Include donor-advised funds, tax deductions, and impact measurement.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ygo833gy-Create-a-charitable-giving-strategy-for-a-high-inc.md`

### t_mms6yhhpce63 — Teach me about distributed tracing with OpenTeleme
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about distributed tracing with OpenTelemetry. Cover spans, traces, context propagation, and visualization with Jaeger.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yhhpce63-Teach-me-about-distributed-tracing-with-OpenTeleme.md`

### t_mms6yiaa7ypq — Find the best desk organizer system for a minimali
- Engine: **general**
- Verdict: **FAIL** | Reliability: **56/100**
- Expected / asked: Find the best desk organizer system for a minimalist programmer. Under 50 dollars. Include cable management and device charging.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yiaa7ypq-Find-the-best-desk-organizer-system-for-a-minimali.md`

### t_mms6yj2pykbv — Create a guide for writing effective technical con
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a guide for writing effective technical conference proposals. Include abstract templates, bio writing, and submission strategy.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yj2pykbv-Create-a-guide-for-writing-effective-technical-con.md`

### t_mms6yjw9stly — Design a hydration tracking system for desk worker
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a hydration tracking system for desk workers. Include daily targets, reminder schedule, and effects of dehydration on cognitive performance.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yjw9stly-Design-a-hydration-tracking-system-for-desk-worker.md`

### t_mms6ykovcfk5 — Plan a 2 week road trip across the American Southw
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Plan a 2-week road trip across the American Southwest. Include route, national parks, accommodation, and budget for a solo traveler.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ykovcfk5-Plan-a-2-week-road-trip-across-the-American-Southw.md`

### t_mms6ylh8960j — Write dialogue for a scene where a startup founder
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **60/100**
- Expected / asked: Write dialogue for a scene where a startup founder fires their CTO who is also their best friend. Include emotional beats and subtext.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ylh8960j-Write-dialogue-for-a-scene-where-a-startup-founder.md`

### t_mms6ymc5m9pc — Create a knowledge management system for a solo de
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a knowledge management system for a solo developer. Compare Notion, Obsidian, and Logseq for code snippets and technical notes.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ymc5m9pc-Create-a-knowledge-management-system-for-a-solo-de.md`

### t_mms6yn4raa0o — Research the best desk lamps for coding at night C
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best desk lamps for coding at night. Compare LED desk lamps with adjustable color temperature. Under 80 dollars.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yn4raa0o-Research-the-best-desk-lamps-for-coding-at-night-C.md`

### t_mms6ynxldoa3 — Write a post incident review template that promote
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a post-incident review template that promotes learning over blame. Include timeline format, contributing factors, and action items.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ynxldoa3-Write-a-post-incident-review-template-that-promote.md`

### t_mms6yoqgu6og — Create a dividend investing strategy for building 
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **60/100**
- Expected / asked: Create a dividend investing strategy for building passive income. Include stock screening criteria, portfolio construction, and DRIP plans.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yoqgu6og-Create-a-dividend-investing-strategy-for-building-.md`

### t_mms6ypjo2sqk — Teach me about container orchestration beyond Kube
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about container orchestration beyond Kubernetes. Compare Docker Swarm, Nomad, and ECS. When is each appropriate?
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ypjo2sqk-Teach-me-about-container-orchestration-beyond-Kube.md`

### t_mms6yqcwffmp — Design a meal planning system for someone who hate
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a meal planning system for someone who hates cooking. Maximum 4 ingredients per meal. Include batch cooking strategies.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yqcwffmp-Design-a-meal-planning-system-for-someone-who-hate.md`

### t_mms6yr5k1q49 — Create a networking event survival guide for intro
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a networking event survival guide for introverted engineers. Include conversation starters, exit strategies, and follow-up templates.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yr5k1q49-Create-a-networking-event-survival-guide-for-intro.md`

### t_mms6yrypdyz5 — Research the best home office desks for dual monit
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best home office desks for dual monitor setups. Compare sit-stand options from Uplift, Flexispot, and IKEA. Under 700 dollars.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yrypdyz5-Research-the-best-home-office-desks-for-dual-monit.md`

### t_mms6ysrvrqus — Write a guide to managing technical debt in a star
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Write a guide to managing technical debt in a startup. Include identification, prioritization, and communication to non-technical stakeholders.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ysrvrqus-Write-a-guide-to-managing-technical-debt-in-a-star.md`

### t_mms6ytl05vr1 — Create a simple investment tracker spreadsheet des
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a simple investment tracker spreadsheet design. Include portfolio allocation, returns tracking, rebalancing alerts, and tax lot tracking.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ytl05vr1-Create-a-simple-investment-tracker-spreadsheet-des.md`

### t_mms6yue50gn5 — Teach me about event driven microservices patterns
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about event-driven microservices patterns. Cover choreography vs orchestration, saga patterns, and eventual consistency.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yue50gn5-Teach-me-about-event-driven-microservices-patterns.md`

### t_mms6yv713jwt — Design a home gym on a 500 dollar budget Include e
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a home gym on a 500 dollar budget. Include essential equipment, floor protection, and a full-body workout program.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yv713jwt-Design-a-home-gym-on-a-500-dollar-budget-Include-e.md`

### t_mms6yw096yp0 — Plan the perfect work from home Friday Balance pro
- Engine: **personalops**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Plan the perfect work-from-home Friday. Balance productive work, learning, personal projects, and weekend preparation.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yw096yp0-Plan-the-perfect-work-from-home-Friday-Balance-pro.md`

### t_mms6ywsyjs5s — Write a comedy sketch about a developer who uses A
- Engine: **screenwriting**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a comedy sketch about a developer who uses AI to automate their entire job and gets promoted for being so productive.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6ywsyjs5s-Write-a-comedy-sketch-about-a-developer-who-uses-A.md`

### t_mms6yxlt4fmu — Research the best travel credit cards for tech wor
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best travel credit cards for tech workers who fly domestically 4-6 times per year. Compare Chase, Amex, and Capital One.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yxlt4fmu-Research-the-best-travel-credit-cards-for-tech-wor.md`

### t_mms6yyetl4os — Create a guide to building an emergency fund as a 
- Engine: **wealthresearch**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Create a guide to building an emergency fund as a freelancer with variable income. Include strategies for lean months.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yyetl4os-Create-a-guide-to-building-an-emergency-fund-as-a-.md`

### t_mms6yz7hgv5v — Teach me about data lineage and data cataloging Co
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Teach me about data lineage and data cataloging. Compare Datahub, Apache Atlas, and Amundsen. Include implementation considerations.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6yz7hgv5v-Teach-me-about-data-lineage-and-data-cataloging-Co.md`

### t_mms6z001a6xv — Design a sustainable work routine that prevents RS
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Design a sustainable work routine that prevents RSI for programmers. Include ergonomic setup, break schedule, and strengthening exercises.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6z001a6xv-Design-a-sustainable-work-routine-that-prevents-RS.md`

### t_mms6z0slumwu — Create a technical blog launch checklist Include p
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a technical blog launch checklist. Include platform selection, SEO setup, content calendar, and promotion strategy.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6z0slumwu-Create-a-technical-blog-launch-checklist-Include-p.md`

### t_mms6z1l3z0jb — Write a guide to salary negotiation for engineers 
- Engine: **careeregine**
- Verdict: **PARTIAL** | Reliability: **62/100**
- Expected / asked: Write a guide to salary negotiation for engineers switching from big tech to startups. Include equity valuation and risk assessment.
- What the report shows: strategy recorded; exports md
- Critical concerns: not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6z1l3z0jb-Write-a-guide-to-salary-negotiation-for-engineers-.md`

### t_mms6z2dndhfy — Research the best cities for bootstrapped SaaS sta
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Research the best cities for bootstrapped SaaS startups in 2026. Compare cost of living, talent pool, and community.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6z2dndhfy-Research-the-best-cities-for-bootstrapped-SaaS-sta.md`

### t_mms6z369l0xj — Create a weekly meal prep workflow that takes unde
- Engine: **general**
- Verdict: **FAIL** | Reliability: **58/100**
- Expected / asked: Create a weekly meal prep workflow that takes under 2 hours. Include shopping list template, prep order, and storage tips.
- What the report shows: strategy recorded; exports md
- Critical concerns: legacy_or_generic_engine, not_clearly_done
- Report path: `docs/testing/case-reports/t_mms6z369l0xj-Create-a-weekly-meal-prep-workflow-that-takes-unde.md`

