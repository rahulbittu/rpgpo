# TopRanker Constitution -- Unified Edition

> The governing document for the TopRanker company, product, and culture.
> Every principle here is binding. When in doubt, refer back to this document.

---

## Section 1: Core Product Principles (1--21)

**1. Restaurants First.**
TopRanker launches with restaurants. One vertical, done right, before expanding. Depth beats breadth at the start.

**2. Structured Scoring, Not Star Ratings.**
Every rating is broken into structured dimensions (food quality, service, ambiance, value, etc.). A single star is meaningless. Dimensions create signal.

**3. Every Rating Has a Consequence.**
Ratings are not decorative. Every rating feeds the leaderboard, shifts rank positions, and updates trust scores. If a rating does not change something visible, it should not exist.

**4. Live Leaderboard Is the Product.**
The ranked list -- visible, updating, consequential -- is the core experience. Users come to see who is #1 and why. The leaderboard is not a feature; it is the product.

**5. Credibility-Weighted Voting.**
Not all votes are equal. A user who has rated 200 restaurants with consistent, detailed reviews carries more weight than a new account with one rating. Credibility is earned, not given.

**6. Credibility Is Transparent.**
Users can see their own credibility tier and understand what drives it. The system is not a black box. Trust requires transparency.

**7. Fair Ranking Means Anti-Gaming.**
Businesses cannot buy rank. Coordinated fake reviews are detected and penalized. The ranking algorithm is resistant to manipulation by design, not by moderation alone.

**8. Honest Under Low Data.**
When a restaurant has few ratings, the system says so. Low-confidence scores are displayed differently from high-confidence scores. We never pretend to know more than we do.

**9. New Users See Progress Immediately.**
A first-time user who submits a rating should see something change -- their credibility tier, their contribution count, the leaderboard. Feedback loops must be tight.

**10. Premium Feel, Free Access.**
The core product -- viewing rankings, submitting ratings -- is free. The experience should feel premium: polished typography, smooth animations, thoughtful design. Free does not mean cheap.

**11. Core Loop Priority.**
Rate, see consequence, check leaderboard. That loop is sacred. Every feature is evaluated by whether it strengthens or distracts from the core loop.

**12. Trust Explainer Is Mandatory.**
Every business page must include a trust explainer card that shows users how the score was calculated, what dimensions contributed, and what credibility tiers participated.

**13. City-Scoped Rankings.**
Rankings are local. A #1 restaurant in Austin is not competing with a #1 restaurant in New York. City context is always present and always clear.

**14. Visual Identity Communicates Trust.**
Amber and navy. Playfair Display for scores. DM Sans for UI. The brand system is not aesthetic preference -- it signals authority and reliability.

**15. Photo Evidence Strengthens Credibility.**
Users who attach photos to reviews earn more credibility weight. Visual evidence is harder to fake and more useful to other users.

**16. The Challenger Mechanic Drives Engagement.**
Head-to-head comparisons (VS cards) turn passive browsing into active judgment. Users do not just read -- they decide. Decisions create investment.

**17. Bookmarks Are Personal Rankings.**
Saved places are not just a list. They represent a user's personal ranking over time. The bookmark system should reflect this with metadata and ordering.

**18. Search Must Surface Trust Signals.**
Search results are not just names and addresses. Every result card shows the trust score, rank position, and credibility context. Search without trust data is just a directory.

**19. Offline Capability Is a Trust Feature.**
If a user loses connectivity, their draft ratings are preserved and synced when reconnected. Losing user input destroys trust in the product.

**20. Performance Is a Feature.**
Slow load times erode trust. Every page must meet performance budgets. A ranking that takes 5 seconds to load feels less authoritative than one that appears instantly.

**21. Data Integrity Over Feature Velocity.**
If a feature risks corrupting ranking data, it does not ship. Data integrity is the foundation. Everything else is decoration without it.

---

## Section 2: AI-Native Operating Values (22--33)

**22. AI Does Not Replace Judgment.**
AI accelerates execution but does not make product decisions. A human decides what to build. AI helps build it faster and with fewer errors.

**23. Intelligence Allocation Is Strategic.**
Not every problem needs AI. Apply intelligence (human or artificial) where it creates the most leverage. Simple problems get simple solutions.

**24. AI Is Embedded, Not Bolted On.**
AI capabilities are woven into the development workflow, testing pipeline, and operational processes. AI is not a separate tool -- it is how we work.

**25. Context Is Our Advantage.**
The memory system, sprint history, team knowledge, and codebase context make our AI workflow compounding. Every sprint makes the next sprint smarter.

**26. Agent-Friendly Codebase.**
Code is structured so that AI agents can read, understand, and modify it effectively. Clear naming, small files, explicit types, and documented contracts.

**27. Build Speed Does Not Equal Validation Speed.**
Building fast with AI does not mean the feature is validated. Speed of construction is separate from speed of learning whether users want it.

**28. Automated Testing Is Non-Negotiable.**
Every feature ships with tests. AI can write tests faster, so there is no excuse for shipping untested code. 100% functional coverage before any push.

**29. AI-Generated Code Gets Human Review.**
AI writes code; humans review it. The review checks for correctness, security, performance, and alignment with product principles. Rubber-stamping is prohibited.

**30. Prompt Engineering Is a Core Skill.**
The quality of AI output depends on the quality of instructions. Prompts, memory files, and context documents are maintained with the same rigor as production code.

**31. AI Enables Cross-Department Contribution.**
AI agents allow every department -- legal, marketing, design, security, engineering, finance -- to contribute to every sprint. No department sits idle.

**32. Compounding Knowledge Is the Moat.**
Sprint docs, retros, audits, memory files, and critique protocols create an institutional knowledge base that compounds. This is not overhead -- it is competitive advantage.

**33. Ship With Confidence, Not Hope.**
AI-assisted testing, type checking, linting, and CI pipelines mean we know the state of the product before it reaches users. Shipping should feel confident, not anxious.

---

## Section 3: Speed, Growth, and Learning Principles (34--43)

**34. Speed After Proof.**
Move fast only after you have proven the core assumption. Before proof, move carefully. After proof, move relentlessly.

**35. No Premature Blitzscaling.**
Scaling before product-market fit burns money and encodes mistakes. Scale when the unit economics and retention prove the product works.

**36. PMF Before Scaling.**
Product-market fit is not a milestone you declare. It is measured: retention curves, organic growth, and users who would be disappointed if the product disappeared.

**37. Learning Speed Is the Real Metric.**
The team that learns fastest wins. Cycle time from hypothesis to validated learning is more important than cycle time from ticket to deployment.

**38. Friction Is Data; Virality Is Signal.**
Where users struggle reveals what to fix. Where users share reveals what is working. Both are more valuable than opinions in meetings.

**39. Do Things That Don't Scale.**
Manual processes, personal outreach, hand-curated content -- these are not embarrassing. They are how you learn what to automate later.

**40. Launch Beats Over-Perfection.**
A shipped product that is 80% right teaches more than an unshipped product that is 100% designed. Perfectionism is a form of procrastination.

**41. Measure What Matters, Ignore What Doesn't.**
Vanity metrics (downloads, page views) are noise. Retention, rating frequency, and leaderboard engagement are signal. Instrument for signal.

**42. Small Bets, Fast Iteration.**
A/B experiments with clear hypotheses, Wilson score confidence intervals, and defined success criteria. No big-bang launches without incremental validation.

**43. Growth Comes From Product Quality.**
Marketing amplifies what works. It cannot fix what is broken. The best growth strategy is a product people recommend to friends.

---

## Section 4: Decoupling and Customer Value Chain Principles (44--51)

**44. Own the Weakest Link.**
The customer experience is only as strong as its weakest point. Identify the weakest link in the value chain and own it. Do not outsource your vulnerabilities.

**45. Reduce Money, Time, and Effort for the Customer.**
Every feature should reduce at least one of: money spent, time wasted, or effort required. If it does not reduce any, it does not ship.

**46. Decouple Before You Couple.**
Keep systems, services, and components independent until there is a proven reason to integrate them. Premature coupling creates fragility.

**47. Specificity Wins.**
A product that is excellent for restaurant rankings in one city beats a product that is mediocre for everything everywhere. Specificity creates authority.

**48. Customer Friction Is a Design Failure.**
Every point of friction in the user journey is a failure of design, not a limitation of the user. Audit friction relentlessly.

**49. The Value Chain Is: Discover, Evaluate, Decide, Act.**
Users discover restaurants, evaluate them via trust scores, decide where to go, and act on that decision. Every feature maps to one of these stages.

**50. Data Portability Builds Trust.**
Users should be able to export their ratings, reviews, and history. Locking users in with data hostage-taking is the opposite of trust.

**51. Platform Thinking From Day One.**
Even as a single-vertical product, the architecture supports future verticals. Restaurants today; hotels, services, and products tomorrow. Build for extension without over-engineering for it.

---

## Section 5: Founder Purpose and Culture Principles (52--82)

**52. Founder-Market Fit Is Real.**
The founder's personal frustration with fake reviews, pay-to-play rankings, and untrustworthy recommendations is the fuel. This is not an abstract problem -- it is a personal mission.

**53. Solve Meaningful Problems.**
TopRanker exists because people cannot trust online rankings. This is a real problem that affects real decisions. We do not build solutions looking for problems.

**54. Disciplined Boldness.**
Be bold in vision, disciplined in execution. Ambition without discipline is chaos. Discipline without ambition is bureaucracy.

**55. Decisions Under Uncertainty Are Still Decisions.**
Waiting for perfect information is a decision to do nothing. Make the best decision with available data, document the reasoning, and be ready to adapt.

**56. Resourcefulness Over Resources.**
A small team with ingenuity beats a large team with inertia. Constraints breed creativity. Budget limitations are not excuses -- they are forcing functions.

**57. Conviction With Flexibility.**
Hold strong convictions about the mission and principles. Hold loose convictions about tactics and implementation. Know the difference.

**58. Resilience Is a Practice, Not a Trait.**
Setbacks are expected. Recovery is designed. Post-mortems, retros, and documented learnings turn failures into institutional knowledge.

**59. Proof Beats Explanation.**
A working demo is worth more than a slide deck. A shipped feature is worth more than a roadmap. Show, do not tell.

**60. Product Quality Is Respect for the User.**
Every pixel, every millisecond of load time, every error message is a statement about how much we respect the people using our product. Sloppy work is disrespectful.

**61. Stay in Learning Mode.**
The moment you think you know everything is the moment you start declining. Critique protocols, external audits, and honest retros keep learning alive.

**62. Truth Over Comfort.**
Honest feedback, even when uncomfortable, is more valuable than polite agreement. The critique protocol exists because internal echo chambers are dangerous.

**63. Authenticity Is Non-Negotiable.**
The product promises trust. The company must embody trust. Internal practices, external communications, and business dealings must all be authentic.

**64. Every Team Member Is an Expert.**
No hand-offs disguised as delegation. Every person on the team is expected to own their domain completely. "User needs to do X" is not acceptable -- we do X.

**65. Cross-Functional by Default.**
Engineers understand business. Designers understand engineering. Marketing understands product. Silos are the enemy of speed and quality.

**66. Document Everything That Matters.**
Sprint docs, retros, audits, meeting notes, architecture decisions. If it is not written down, it did not happen. Documentation is institutional memory.

**67. Fix Bugs First, Features Second.**
A broken product with new features is still a broken product. Bug fixes are always prioritized over new development. No exceptions.

**68. No Vanity Features.**
Every feature must serve the trust mission. If a feature looks impressive but does not improve rankings, credibility, or user trust, it does not belong.

**69. Celebrate Substance, Not Theater.**
Celebrate shipped features, fixed bugs, improved metrics, and honest retros. Do not celebrate busy-ness, long hours, or performative urgency.

**70. Hire for Mission Alignment.**
Skills can be developed. Mission alignment cannot be trained. Every team member must believe that trustworthy rankings matter.

**71. Transparency With Users.**
When we make mistakes, we say so. When rankings change, we explain why. When data is limited, we admit it. Transparency is not a PR strategy -- it is the product.

**72. Long-Term Thinking, Short-Term Action.**
The vision is 10 years. The sprint is 1 week. Both matter. Long-term thinking prevents short-term panic. Short-term action prevents long-term stagnation.

**73. Revenue Serves the Mission.**
Challenger subscriptions, Business Pro, Featured Placement, and Premium API are revenue streams that align with the trust mission. Revenue that compromises trust is rejected.

**74. Community Is the Moat.**
A credibility-weighted community of honest reviewers is the real competitive advantage. Algorithms can be copied. Communities cannot.

**75. Privacy Is a Trust Imperative.**
User data is protected not because regulations require it, but because trust requires it. GDPR compliance is the floor, not the ceiling.

**76. Accessibility Is Not Optional.**
A product that excludes users is not trustworthy. Accessibility standards are built into the design system, not bolted on after launch.

**77. Security Is Foundational.**
OWASP compliance, CSP headers, rate limiting, input sanitization -- these are not nice-to-haves. A compromised product cannot be trusted.

**78. Open to Feedback, Resistant to Noise.**
Listen to users, critique responses, and market signals. Ignore hype cycles, competitor panic, and unsolicited advice from people who do not understand the mission.

**79. Build for the User Who Comes Back.**
Retention is the ultimate compliment. A user who returns daily trusts the product. Optimize for the returning user, not the first-time visitor.

**80. Compete on Merit.**
No pay-to-play, no astroturfing, no dark patterns. If we cannot win on product quality, we do not deserve to win.

**81. The Mission Is Bigger Than the Company.**
Trustworthy rankings should exist in the world whether TopRanker builds them or not. We are the vehicle, not the destination. If we fail, we hope someone else succeeds.

**82. Ship It.**
Talk is cheap. Code ships. Documents ship. Decisions ship. The bias is always toward action. When in doubt, ship it and learn.

---

## Section 6: Default Operating Rule

> **Rate -> Consequence -> Ranking**

Every action in the system follows this chain:

1. **Rate**: A user submits a structured, dimension-based rating.
2. **Consequence**: The rating is weighted by the user's credibility tier, validated against anti-gaming rules, and applied to the business's trust score.
3. **Ranking**: The leaderboard updates. Positions shift. The world sees the result.

If any link in this chain is broken, the product is broken. This is the atomic unit of TopRanker.

---

## Section 7: Operating Protocol

All work follows a four-phase protocol with clear priority definitions.

### Priority Definitions

| Priority | Definition | Response Time |
|----------|-----------|---------------|
| **P0 -- Critical** | Data integrity risk, security vulnerability, or complete feature breakage. Blocks users from completing the core loop. | Immediate. Next sprint or hotfix. |
| **P1 -- High** | Significant degradation of user experience, trust signal inaccuracy, or performance regression. Does not block the core loop but materially harms it. | Within 2 sprints. |
| **P2 -- Medium** | Quality-of-life improvements, minor UI inconsistencies, non-blocking technical debt. Important but not urgent. | Scheduled in backlog. |

### PHASE 1: Audit

Assess the current state before making any changes.

- Run `scripts/arch-health-check.sh` for automated codebase health metrics.
- Review open action items from the most recent retro.
- Check `memory/prd-gaps.md` for outstanding product gaps.
- Read the latest critique response from `docs/critique/outbox/`.
- Identify all P0 items. P0 items override all other planned work.

### PHASE 2: Decide

Determine what to build, fix, or improve.

- Backlog refinement document: what goes in this sprint, what does not, and why.
- SLT and department input incorporated (every 5 sprints for SLT; every sprint for departments).
- Every item is tagged with a priority (P0, P1, P2) and mapped to a Core Product Principle.
- If an item cannot be mapped to a principle, it is challenged or rejected.

### PHASE 3: Implement

Build with discipline.

- Every team member contributes. No department sits idle.
- Tests written alongside code. 100% functional coverage before push.
- CI pipeline must pass: tests, file size checks, type cast audits, dependency validation.
- Visual verification is mandatory. Screenshots before shipping.
- Code review is not optional. AI-generated code gets human review.

### PHASE 4: Report

Document and learn.

- Sprint doc in `/docs/sprints/SPRINT-N-*.md` with team discussion (4--8 named members).
- Retro in `/docs/retros/RETRO-N-*.md` with What Went Well, What Could Improve, Action Items, Team Morale.
- Critique request written to `docs/critique/inbox/SPRINT-N-REQUEST.md`.
- Memory files updated. PRD gaps updated. Changelog updated.
- **All docs must be committed and pushed with the sprint code.** Untracked docs are bugs. Every commit must leave git status clean for tracked documentation.
- **Update MEMORY.md current state every commit** — test count, sprint number, file counts, key metrics. Stale metrics are stale docs.
- Commit, push, and wait for external critique before planning the next sprint.

---

*This Constitution is a living document. Amendments require explicit discussion and documented rationale. Principles are added, never silently removed.*
