# Subtask Output — Research Note-Taking Apps
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Obsidian Overview (2026)
Obsidian is a free, local-first note-taking app using Markdown files for **100% local storage**, **1,000+ community plugins**, and strong data portability via plain text files.[1]  
- **Speed**: Performance can lag with large databases or growing vaults, though core app is desktop-optimized.[3]  
- **Offline Support**: Fully offline as files stay on-device; no cloud dependency for core use.[1][2][4]  
- **Plugin Ecosystem**: Over 1,000 extensions, including Dataview for SQL-like queries and Canvas for visual whiteboards; plugins enable databases but can conflict or break on updates.[1][3][5]  
- **Data Portability**: Markdown-based with YAML metadata; future-proof, no vendor lock-in, works with Git for version control.[1][2][3]  
Pricing: Free core; $8/mo optional sync/publish.[1]  
Source: https://www.taskade.com/blog/best-notion-alternatives[1]

## Notion Overview (2026)
Notion is a cloud-based all-in-one workspace with native databases, but weaker on local control and reliable offline access.[1][2]  
- **Speed**: Sluggish with thousands of pages or linked databases; relational changes can cascade unexpectedly.[2][5]  
- **Offline Support**: Exists but unreliable for extended use; fully cloud-dependent.[2]  
- **Plugin Ecosystem**: Template-heavy with embeds, but no open plugin system like Obsidian; excels in native automation/collaboration ($10-20/user/mo).[1][2]  
- **Data Portability**: Server-stored; no self-hosting, potential lock-in despite export options.[2]  
Best for teams/databases, not privacy-focused solos.[1]  
Source: https://www.taskade.com/blog/best-notion-alternatives[1]; https://docmost.com/blog/obsidian-alternatives/[2]

## Logseq Overview (2026)
Logseq is a free, open-source (AGPL-3.0) outliner using local Markdown/Org-mode files, emphasizing block-level linking and whiteboards.[2][3][4]  
- **Speed**: Slows with large graphs (10,000+ blocks); mobile lags behind desktop.[2]  
- **Offline Support**: Fully local-first; third-party sync (iCloud/Dropbox/Git) possible but risks file conflicts.[2][3][4]  
- **Plugin Ecosystem**: Supports extensions like Git integration, Zotero, Readwise, PDF annotation; outliner model enables queries/properties but limits long-form layouts.[3][4]  
- **Data Portability**: Plain files with full ownership; Git for history, convertible to visual diagrams.[2][3][4]  
Pricing: Completely free; sync ~$5/mo via third-party or self-hosted.[4]  
Source: https://docmost.com/blog/obsidian-alternatives/[2]; https://buildin.ai/blog/top-10-evernote-alternatives[3]

## Direct Comparison Table (Speed, Offline, Plugins, Portability)

| Feature          | Obsidian                          | Notion                            | Logseq                            |
|------------------|-----------------------------------|-----------------------------------|-----------------------------------|
| **Speed**       | Lags on large vaults/plugins[3]  | Sluggish on 1,000s pages[2]      | Slows at 10k+ blocks[2]          |
| **Offline**     | Full (local files)[1][4]         | Unreliable extended use[2]       | Full (local + third-party sync)[4]|
| **Plugins**     | 1,000+ (Dataview, Canvas)[1][3]  | Native templates/embeds[2]       | Git/Zotero/queries[3][4]         |
| **Portability** | Markdown/YAML/Git[1][3]          | Cloud export only[2]             | Markdown/Org/Git[2][3]           |

**Next Steps**: Test Obsidian/Logseq with a 1,000-note Markdown vault (import via Git); benchmark speed on your machine using Dataview queries. For teams, trial Notion's $10/mo plan but export weekly to MD for portability.[1][2]
