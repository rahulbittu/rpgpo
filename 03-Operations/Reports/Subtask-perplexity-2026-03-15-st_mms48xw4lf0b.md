# Subtask Output — Research Search Engine Internals
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Crawling
Search engines discover and fetch web pages through automated bots called crawlers (e.g., Googlebot). Crawling starts from known URLs like sitemaps and follows links to new pages, prioritizing fresh content and high-authority sites. Technical factors enabling crawling include XML sitemaps, clean URL structures, logical site architecture, no broken internal links, proper canonical tags, and indexing clarity to ensure bots can access and interpret pages efficiently[3][6].

## Indexing
Once crawled, pages are analyzed and stored in a massive database called an index. Google processes structured data, entity clarity, and content depth for inclusion. In 2026, indexing emphasizes mobile-first design, HTTPS security, and Core Web Vitals (LCP, INP, CLS) for real user experience; poor metrics block effective indexing even for strong content. Mobile devices drive 63% of organic search visits per Statista data cited in 2026 guides[5][6].

## Ranking
Ranking orders indexed pages by relevance using hundreds of factors evaluated via machine learning algorithms. Key 2026 factors include:
- **Content relevance and quality**: Direct answers to intent, structured headings, entity-rich language, depth, usefulness, originality, E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)[2][3][5].
- **Authority signals**: High-quality backlinks from authoritative domains (relevance > quantity), internal linking, topical authority via clusters[2][5].
- **User behavior and engagement**: Dwell time, click-through rate (CTR), mobile click-to-call, direction requests, scroll behavior, return visits; ML refines rankings based on interactions[1][5][6].
- **Technical and trust**: Sub-second Core Web Vitals, page load under 3 seconds, mobile-friendliness[2][3][5].
- **Local-specific**: Trusted Identity (consistent NAP across Google Business Profile, Apple Business Connect, Bing Places), review velocity/sentiment, GBP activity (posts, responses, media)[1][4].
No single factor dominates; integration across relevance, authority, trust, and behavior is key, varying by query (e.g., local prioritizes proximity/reviews)[5].

**Modern ML-based Ranking Factors**: Google's 2026 algorithms deploy AI/ML to assess user intent satisfaction, entity verification, behavioral signals, and AI extractability for zero-click SGE overviews. ML analyzes post-click engagement (e.g., time on page relative to depth) and AI visibility (citation in generative answers, attribution frequency). Brand search demand and topic clusters boost entity authority over isolated keywords[1][2][5][6].

## Serving
Serving delivers ranked results in SERPs, now AI-enhanced with overviews (SGE). Results prioritize zero-click extraction for "answer-ready" atomic units, behavioral trust (e.g., high mobile click-to-call, fresh geotagged photos), and conversions like bookings. Track map impressions, calls, and branded searches over positions; active GBP with CRM APIs enhances serving in local/AI queries[1][4][6].

**Sources**:
- [1] https://onlinemarketinginct.com/local-seo-checklist-for-2026-what-local-businesses-need-to-know/
- [2] https://www.clickrank.ai/search-engine-positioning/
- [3] https://www.localmighty.com/blog/how-to-rank-higher-on-google/
- [4] https://www.ecoyork.com/local-seo-2026-ranking-factors/
- [5] https://milwaukee-webdesigner.com/seo-guide/
- [6] https://activatedigitalmedia.com/blog/seo-metrics-in-2026-what-to-measure-in-an-ai-driven-search-landscape
