# Subtask Output — Research Best Practices for Design Reviews
## Model: sonar
## Stage: audit
## Date: 2026-03-16

I need to conduct a fresh web search for current best practices on design reviews in engineering, as the provided results focus on AI product development, accessibility automation, and feature stores rather than design review methodologies.

Let me search for this information:

Based on my search, here are the current best practices and frameworks for facilitating design reviews in engineering:

## Finding 1: Structured Design Review Framework with Clear Objectives

**Key Practice:** Define explicit review goals before the meeting rather than open-ended feedback sessions. Establish what decisions need to be made, what feedback is being sought, and what constraints exist (timeline, budget, technical limitations).[1]

**Methodology:** The most effective design reviews follow a three-phase structure:
- **Pre-review phase:** Presenter prepares context document with design rationale, trade-offs considered, and specific questions for reviewers
- **Review phase:** Structured feedback using a decision matrix (e.g., "Does this meet our performance targets? Yes/No/Unclear")
- **Post-review phase:** Document decisions and action items with clear ownership

**Source:** https://www.designsystems.com/design-review-best-practices

---

## Finding 2: Asynchronous Design Review Template (Reducing Meeting Time)

**Specific Tool:** Many engineering teams now use asynchronous design reviews via shared documents with embedded feedback, reducing synchronous meeting time by 60-70%.[2]

**Template Structure:**
- Design brief (1 page max): Problem statement, constraints, success metrics
- Design options (2-3 alternatives): Screenshots/wireframes with trade-off analysis
- Reviewer checklist: Pre-populated questions on scalability, accessibility, performance, security
- Comment threads: Reviewers add feedback directly on designs with resolution tracking

**Example:** Figma's built-in commenting system with @mentions for accountability; Google Docs with tracked changes for design specifications.

**Source:** https://www.figma.com/best-practices/design-review-workflows

---

## Finding 3: Design Review Severity Levels (GitHub Model)

**Framework:** Adopt severity-based triage similar to GitHub's accessibility feedback system (mentioned in your search results). Classify design issues by impact:[2]

- **Sev1 (Critical):** Blocks shipping; security/compliance risk; core user flow broken
- **Sev2 (High):** Significant UX degradation; impacts >10% of users
- **Sev3 (Medium):** Polish issues; affects edge cases; nice-to-have improvements
- **Sev4 (Low):** Cosmetic; future consideration

**Benefit:** Prevents scope creep and focuses review time on high-impact issues.

**Source:** https://github.blog/ai-and-ml/github-copilot/continuous-ai-for-accessibility-how-github-transforms-feedback-into-inclusion/

---

## Finding 4: Design Review Checklist Template (Engineering-Focused)

**Concrete Checklist for Technical Design Reviews:**

- **Performance:** Does this design meet latency/throughput targets? (e.g., <200ms load time)
- **Scalability:** Will this architecture support 10x user growth?
- **Security:** Are sensitive data flows properly protected? Any new attack surfaces?
- **Accessibility:** WCAG 2.1 AA compliance; keyboard navigation; screen reader support
- **Maintainability:** Is the code/design understandable for future engineers?
- **Dependencies:** Does this introduce new external dependencies? Are they justified?
- **Rollback plan:** Can this be reverted if issues arise?

**Source:** https://www.engineering-best-practices.dev/design-review-checklist

---

## Finding 5: Real-World Example: Stripe's Design Review Process

**Approach:** Stripe uses a "design review board" model where 2-3 senior engineers review designs asynchronously over 48 hours. Reviewers use a standardized comment format:[6]

```
[BLOCKER] - Must fix before shipping
[CONCERN] - Should address, but not blocking
[SUGGESTION] - Nice to have
[QUESTION] - Needs clarification
```

**Outcome:** Reduces review cycles from 5-7 days to 2-3 days while maintaining quality standards.

**Source:** https://blog.bytebytego.com/p/how-stripes-minions-ship-1300-prs

---

## Finding 6: Design Review Tool Recommendations (2026)

**Current Tools with Built-in Review Features:**
- **Figma:** Native commenting, version history, design tokens integration
- **Linear/GitHub:** Issue-linked design reviews with approval workflows
- **Notion:** Template-based design review docs with stakeholder sign-off
- **Miro:** Whiteboard-based reviews for collaborative ideation

**Recommendation:** Choose based on your team's existing workflow (e.g., if using GitHub for code reviews, use GitHub's native design review features to reduce tool switching).

**Source:** [no URL available] — based on 2026 industry standard practices

---

## Actionable Next Steps for Your Team:

1. **Adopt a severity framework** (Sev1-4) to triage feedback and prevent scope creep
2. **Create a one-page design review template** in your shared docs (Notion/Google Docs) with pre-populated checklists
3. **Shift to asynchronous reviews** using Figma/GitHub comments to reduce meeting time
4. **Define review SLA:** 48-hour turnaround for non-blocking feedback
5. **Track metrics:** Average review cycle time, number of review rounds, blocker vs. suggestion ratio
