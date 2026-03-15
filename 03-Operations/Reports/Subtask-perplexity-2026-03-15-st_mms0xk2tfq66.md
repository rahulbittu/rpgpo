# Subtask Output — Research System Design Document Best Practices
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Best Practices for Writing System Design Documents

Use a clear, hierarchical structure with sections like **system architecture**, **modules/components**, **data flow diagrams (DFDs)**, **interface design**, **technology stack**, and **deployment architecture** to provide an overview of component relationships and interactions[3][5]. Organize into logical subpages or sections: **Foundations** (colors, typography, spacing), **Component Library** (with visuals, usage guidelines, states, code snippets), **Content & Voice** (tone, grammar, accessibility), and **Resources** (assets like icons)[1]. Include **artifacts** such as architecture diagrams, data flows, flowcharts, and performance trade-offs for scalability, security, and cost[5]. Employ consistent formatting like Markdown for headings, lists, code blocks, and scannable paragraphs to improve readability and navigation[4].

**Concrete Next Steps:**
- Start with a table of contents and sticky navigation for findability[4].
- Add "Do’s and Don’ts" examples per component, e.g., "Don’t use primary button for destructive actions"[1].
- Incorporate quick starts, interactive examples, and "next step" links like Stripe Docs[4].

## Recommended Structures

| Section | Key Elements | Example from Sources |
|---------|--------------|----------------------|
| **System Architecture** | Overview of components and relationships | E-commerce: user service, product service, order service, payment service[5]. |
| **Modules/Components** | Breakdown by responsibility | Banking: account management, transaction processing; UI: atoms (colors), molecules (buttons), organisms (nav bars)[2][3][5]. |
| **Data Flows & Interfaces** | DFDs, APIs, UI specs | Request/response formats, error codes; navigation menus, modals[3][5]. |
| **Non-Functional** | Scalability, tech stack, deployment | Load balancing for video streaming; server configs, cloud infra[3][5]. |
| **Foundations/Components** | Visuals, states, code | Buttons: default/hover/disabled states with React snippets; grid spacing in 8px increments[1][2]. |

High-Level Design (HLD) documents focus on flows, flowcharts, and module logic; extend to Low-Level Design (LLD) for schemas and APIs[3][5]. Use layout templates for consistency, e.g., homepage, dashboard, mobile views[2].

## Common Mistakes and How to Avoid Them

- **Inconsistent or unmanaged structure**: Leads to duplicate data and misalignment; avoid by using source-controlled schemas with audits, unlike unmanaged variables[6].
- **Poor readability**: Long, fragile docs (e.g., large DOC files) with random formatting; fix with Markdown, short paragraphs, stable menus, and search functionality[4].
- **Missing details**: No states, usage guidelines, or trade-offs; include anatomy breakdowns, accessibility (A11y), and performance considerations explicitly[1][5].
- **Overly complex without visuals**: Wall of text without previews or diagrams; add live examples, galleries, and DFDs[1][3].
- **Lack of governance**: No ownership or change tracking; define roles, permissions, and version diffs[6].

**Concrete Next Steps to Avoid Mistakes:**
- Audit existing docs for hierarchy issues: limit to 1-3 levels of headings[4].
- Test scannability: Ensure 50%+ content is lists/code/images, not paragraphs[4].
- Version control: Use Git for diffs; reject edits without PRs[6].

Sources:  
- [1] https://www.techcompanynews.com/what-is-a-design-system-documentation-guide-for-beginners/  
- [2] https://www.neue.world/learn/design-system/the-components-of-a-design-system  
- [3] https://www.geeksforgeeks.org/system-design/what-is-high-level-design-learn-system-design/  
- [4] https://technicalwriterhq.com/documentation/documentation-formatting-examples/  
- [5] https://www.geeksforgeeks.org/system-design/getting-started-with-system-design/  
- [6] https://www.avo.app/docs/data-design/guides/avo-as-solutions-design-document
