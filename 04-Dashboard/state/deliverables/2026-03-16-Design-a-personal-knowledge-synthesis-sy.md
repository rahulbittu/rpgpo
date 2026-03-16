# Design a personal knowledge synthesis system that turns reading notes into origi

**Domain:** general | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Existing Knowledge Synthesis Systems
## Finding 1: UBC Knowledge Synthesis & AI Search Wiki 2026 Lists 20+ Tools for AI-Powered Search and Extraction
- Tools include **Open Evidence** (openevidence.com), **otto-SR** (ottosr.com), **Perplexity** (perplexity.ai), **PubMed.ai** (pubmed.ai), **Undermind.ai** (undermind.ai), **Consensus** (consensus.app) for distilling scientific findings, **Dimensions AI** (dimensions.ai) with access to 100 million+ publications, **Google NotebookLM** (notebooklm.google.com), **Research Rabbit** (researchrabbitapp.com), **SciSpace** (scispace.com), **Semantic Scholar** (semanticscholar.org).
- Additional: **Asta** by Ai2, **ChatGPT** (openai.com/chatgpt), **ChatPDF** (chatbotapp.ai), **Connected Papers** (connectedpapers.com), **Doximity DoxGPT** (doximity.com/gpt), **Evidence Hunt** (evidencehunt.com), **Inciteful** (inciteful.xyz), **LitMaps** (litmaps.com), **Moara.io** (moara.io), **OpenRead** (openread.academy), **The Literature.com** (the-literature.com), **Pub2Post** (pub2post.com).
- Focus: Screening, data extraction in knowledge synthesis (KS).
Source: https://wiki.ubc.ca/Knowledge_Synthesis_(KS)_&_AI_Search_Wiki_2026[1]

## Finding 2: UWO Research Guide Highlights AI Tools for Systematic Reviews and Literature Synthesis
- **Consensus** extracts key results from papers; **Elicit** automates literature reviews by finding papers, summarizing takeaways, extracting info; **SciSpace** (typeset.io/search) decodes papers, explains text/math/tables; **ASReview Lab** screens large texts for relevant records; **AskYourPDF** chats with uploaded docs; **VOSviewer** visualizes bibliometric networks (citations, co-authorship); **Gemini** (formerly Bard) handles multimodal inputs.
- **AI Reviewer** gives peer-review feedback on manuscripts.
Source: https://guides.lib.uwo.ca/c.php?g=733893&p=5380016[2]

## Finding 3: Science Q Platform for Scientific Knowledge Synthesis (2026 Launch Focus)
- Merges transformer models with scientific knowledge graphs; trained on PubMed, arXiv, IEEE Xplore, Springer Nature; handles queries like carbon sequestration methods with curated peer-reviewed synthesis, comparative data.
- Features: Dynamic reasoning, trend identification, citation analysis, knowledge gap flagging; reduces literature review time by hours.
Source: https://explore.st-aug.edu/exp/how-science-q-is-revolutionizing-knowledge-synthesis-and-accelerating-discovery[3]

## Finding 4: Evidence Synthesis Tools for Systematic Reviews (UTexas Guide)
| Tool | Key Functions | Pricing | Integrations |
|------|---------------|---------|--------------|
| **Colandr** | ML for screening/relevance ranking, manual data extraction | Free, open source | None built-in for PRISMA |
| **Covidence** | Deduplication, screening, extraction, quality assessment, PRISMA generator | Paid (free trial) | EndNote, Zotero |
| **DistillerSR** | Citation management, screening, extraction, AI optimization, PRISMA automation | Paid subscription | External data analysis tools |
| **TERA (formerly SRA)** | Deduplication, screening (Screenatron), dispute resolution (Disputatron), citation chasing (SpiderCite) | Paid subscription | N/A |

Source: https://guides.lib.utexas.edu/systematicreviews/tools[4]

## Finding 5: 2026 PhD Tech Stack Recommends AI Discovery and Knowledge Graph Tools
- **Consensus, Connected Papers, Litmaps** for literature discovery/mapping; **Obsidian** for non-linear knowledge graphing (Markdown-based Zettelkasten for synthesis across readings).
Source: https://www.thesify.ai/blog/best-tools-for-phd-students-beyond-ai[5]

## Finding 6: AI Deep Research Tools Comparison for 2026 Workflows
- **Perplexity** best for source discovery/citations; **ChatGPT/Claude** for synthesis/structured outputs; **Gemini** for reasoning/Google integration.
- Workflow: Perplexity/ChatGPT for mapping, Claude/ChatGPT for synthesis, separate evidence/inferences.
Source: https://rephrase-it.com/blog/ai-deep-research-tools-compared-for-2026[6]

**Next Steps**: Test **Consensus** or **Elicit** (free tiers) on a sample query from your data engineering projects; integrate **Obsidian** for personal KS on SaaS trends (download from obsidian.md, import 10 recent papers). Track time savings in a 1-week trial.

## Synthesize Knowledge Synthesis System Plan
## Key Findings

1. **Tool Availability**: There are over 20 AI-powered tools available for search and extraction in knowledge synthesis, including Open Evidence, otto-SR, Perplexity, PubMed.ai, and others. These tools are designed to facilitate screening and data extraction in knowledge synthesis processes.

2. **Specialized Functions**: Some tools, like Consensus and Elicit, are designed to extract key results from scientific papers and automate literature reviews, respectively. SciSpace offers capabilities to decode and explain complex academic content.

3. **Comprehensive Access**: Dimensions AI provides access to over 100 million publications, offering a broad base for data extraction and synthesis.

## Detailed Analysis

- **Capture Notes**: Tools like Google NotebookLM and Research Rabbit can be leveraged for capturing and organizing notes. These platforms allow for easy annotation and tagging, which is crucial for later retrieval and synthesis.

- **Mapping Connections**: Connected Papers and LitMaps are specifically designed to visualize the connections between research papers, helping identify trends and gaps in the literature.

- **Conducting Synthesis Sessions**: Elicit and ASReview Lab can automate and streamline the process of literature review by identifying relevant papers and extracting key insights, reducing manual workload significantly.

- **Producing Outputs**: SciSpace and Consensus can be used to produce detailed summaries and explanations of complex scientific findings, making it easier to communicate insights effectively.

## Recommended Actions

1. **Implement a Note-Capturing Workflow**
   - **What to Do**: Use Google NotebookLM or Research Rabbit to capture and organize notes.
   - **Why**: These tools allow for efficient tagging and retrieval, essential for managing large volumes of information.
   - **Expected Outcome**: Streamlined note-taking process with easy access to organized information.
   - **First Step**: Set up an account on Google NotebookLM and begin importing existing notes for tagging and organization.

2. **Develop Connection Mapping**
   - **What to Do**: Utilize Connected Papers and LitMaps to map out research connections.
   - **Why**: Visualizing connections helps in understanding the landscape of research and identifying potential areas for further exploration.
   - **Expected Outcome**: A clear visual representation of research trends and gaps.
   - **First Step**: Choose a key research topic and generate a map using Connected Papers to explore related work.

3. **Automate Synthesis Sessions**
   - **What to Do**: Use Elicit and ASReview Lab to automate literature reviews.
   - **Why**: Automation reduces manual effort and increases efficiency in identifying and synthesizing relevant literature.
   - **Expected Outcome**: Faster, more efficient synthesis sessions with comprehensive insights.
   - **First Step**: Set up a project in Elicit, input key research questions, and begin automated literature review.

4. **Produce Detailed Outputs**
   - **What to Do**: Employ SciSpace and Consensus for generating summaries and explanations.
   - **Why**: These tools provide clear, concise outputs that are easy to understand and communicate.
   - **Expected Outcome**: High-quality, easily digestible summaries of complex research findings.
   - **First Step**: Identify a complex paper and use SciSpace to generate a detailed explanation and summary.

By integrating these tools and workflows, you can create a robust personal knowledge synthesis system that enhances efficiency and clarity in managing and synthesizing research data.