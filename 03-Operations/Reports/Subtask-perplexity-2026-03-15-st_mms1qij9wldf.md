# Subtask Output — Research Hosting Options and Costs
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Hugo Hosting Options and Costs

Hugo sites, being fully static, deploy easily to free or low-cost platforms with Git integration and global CDNs. Common hosts include Netlify, Vercel, Render, Cloudflare Pages, and GitHub Pages (free for public repos).

- **Netlify**: Free tier for static sites up to 100GB bandwidth/month; Pro plan $19/month (300GB bandwidth, form submissions). Legacy free plan limited; new credit-based plans start free but scale to $19+/user/month for teams. Deploy via Git push.[5]
- **Cloudflare Pages**: Free unlimited static sites, bandwidth, and builds; supports Hugo directly with zero monthly cost for serverless blogs. Pro $20/month adds advanced features like 10x builds.[3]
- **Vercel**: Free hobby tier (100GB bandwidth/month); Pro $20/month per user for teams. Supports Hugo via static export, automated Git deploys.[2][4]
- **Render**: Free static sites tier; paid instances from $7/month (Starter) for custom needs, predictable pricing vs. serverless. Git-based deploys.[2]
- **GitHub Pages**: Free for public repos, 1GB storage, 100GB/month bandwidth; private repos require GitHub Pro ($4/month).[Prior Subtask]

Source: https://dev.to/allenarduino/netlify-forms-is-getting-expensive-here-are-the-best-alternatives-in-2026-3a7k[5]; https://astro.build/blog/whats-new-february-2026/[3]; https://crystallize.com/blog/ecommerce-frontend[2]; https://www.deployhq.com/guides/v0[4]

**Next Steps**: Test free tier on Cloudflare Pages (hugo build → git push); monitor bandwidth for $0 start. Scale to Netlify Pro if forms needed ($19/month).

## Next.js Hosting Options and Costs

Next.js supports static export, ISR/SSG+SSR, optimized for edge/serverless. Vercel is native; alternatives handle hybrid rendering.

- **Vercel**: Free hobby (100GB bandwidth, 100 hours serverless/month); Pro $20/month per user (1TB bandwidth, advanced edge). First-class Next.js support, Git previews, multi-cloud edge. Usage-based beyond limits (e.g., $0.40/GB extra).[2][4]
- **Render**: Free static tier; services from $7/month (512MB RAM instance). Supports Next.js SSR via long-running processes, Git deploys, no edge functions.[2]
- **Netlify**: Free static/Functions (125k invocations/month); Pro $19/month. Partial Next.js support via Functions for dynamic parts.[5]
- **DeployHQ to VPS/Shared**: Custom VPS (e.g., DigitalOcean $4/month droplet) + DeployHQ ($15/month starter). Cuts costs vs. Vercel for self-hosted Next.js (next build → SFTP/SSH).[4]

Source: https://crystallize.com/blog/ecommerce-frontend[2]; https://www.deployhq.com/guides/v0 (updated March 5, 2026)[4]; https://dev.to/allenarduino/netlify-forms-is-getting-expensive-here-are-the-best-alternatives-in-2026-3a7k[5]

**Next Steps**: Deploy to Vercel free tier (vercel --prod); track Function invocations. Migrate to Render $7/month if SSR-heavy and costs exceed $20.

## Astro Hosting Options and Costs

Astro excels in static/hybrid sites, partial hydration. Growing adoption (11.8% mobile sites Feb 2026). Deploys like Hugo/Next.js.

- **Cloudflare Pages**: Free unlimited (matches Hugo serverless blogs); Astro integration for Markdown/AI agents on free plan.[3]
- **Vercel**: Free hobby; Pro $20/month. Automated Git deploys, edge support for hybrid Astro. Used in themes like Hermes Commerce.[2][3][4]
- **Netlify**: Free tier; Pro $19/month. Strong for Jamstack Astro sites with forms.[5]
- **Render**: Free static; $7+/month services. Flexible for Astro complexity.[2]

Source: https://astro.build/blog/whats-new-february-2026/ (Feb 2026)[3]; https://crystallize.com/blog/ecommerce-frontend[2]; https://www.deployhq.com/guides/v0[4]; https://dev.to/allenarduino/netlify-forms-is-getting-expensive-here-are-the-best-alternatives-in-2026-3a7k[5]

**Next Steps**: Start with Cloudflare Pages free (astro build → deploy); benchmark vs. Vercel for edge needs ($0-20/month ramp).

## Cost Comparison Table (Monthly, 2026 Entry-Level)

| Platform     | Hugo Static | Next.js Hybrid | Astro Static/Hybrid | Free Tier Limits          |
|--------------|-------------|----------------|---------------------|---------------------------|
| **Cloudflare Pages** | $0        | $0 (static)   | $0                 | Unlimited bandwidth/builds[3] |
| **Vercel**  | $0-$20     | $0-$20+       | $0-$20             | 100GB bandwidth[2][4]    |
| **Netlify** | $0-$19     | $0-$19        | $0-$19             | 100GB bandwidth[5]       |
| **Render**  | $0-$7+     | $0-$7+        | $0-$7+             | Static free; instances $7[2] |
| **Self-Host/VPS** | $4+ (Droplet) | $4+ via DeployHQ ($15) | $4+            | Custom, no platform fees[4]|

No results found for exact 2026 pricing pages beyond these; refined search needed for provider pricing calculators (e.g., vercel.com/pricing as of March 2026). All free tiers suit <100k visits/month prototypes.
