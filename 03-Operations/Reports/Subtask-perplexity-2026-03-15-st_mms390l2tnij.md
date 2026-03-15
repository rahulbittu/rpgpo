# Subtask Output — Research A/B Testing Best Practices
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Hypothesis Formation
- **Structure**: Use the template "Because [data-backed observation], we believe that [change] will [measurable outcome] for [target audience]." Example: "Because heatmap data shows users are not scrolling past the hero image on mobile, we believe adding a visible ‘Shop Now’ button above the fold will increase mobile add-to-cart rate by 12% for new visitors."[3]
- **Process**: Start with data from analytics, heatmaps (e.g., Hotjar, Microsoft Clarity), session recordings; identify specific issues like "74% of mobile visitors leave the landing page within 5 seconds"; pick one variable (e.g., headline, CTA placement); state expected measurable outcome (e.g., "12% increase in add-to-cart rate"); define success metric and statistical significance upfront.[1][3]
- **Tools**: Personizely AI Hypothesis Generator (input situation, outputs structured hypothesis); VWO AI for personalized testing ideas from URL scans.[1][2]
- **Next Step**: Analyze Google Analytics 4 or Shopify Analytics for drop-off points, then input into Personizely tool. Source: https://www.personizely.net/tools/hypothesis-generator [1]; https://www.brillmark.com/how-to-run-a-b-tests-on-your-shopify-store-tools-process-common-mistakes/ [3]

## Sample Size Calculation
- **Methodology**: Use free calculators like Optimizely’s or Evan Miller’s; input current conversion rate, minimum detectable effect (e.g., 10% lift), and desired statistical significance (typically 95%).[3]
- **Common Mistake**: Ending tests too early without calculated sample size per variation.[3]
- **Next Step**: For a 2% baseline conversion rate targeting 10% lift at 95% significance, calculate via Evan Miller’s tool (requires ~16,000 visitors per variation). Source: https://www.brillmark.com/how-to-run-a-b-tests-on-your-shopify-store-tools-process-common-mistakes/ [3]

## Test Duration
- **Approach**: Use VWO Bayesian Calculator to determine duration for statistical significance; set fixed run time or minimum sample size upfront to avoid stopping early on random variation.[1][2]
- **Factors**: Base on traffic volume; run until sample size met, not calendar days alone.[3]
- **Next Step**: Input metrics into VWO calculator post-hypothesis; aim for full cycles (e.g., 7-14 days for e-commerce to capture weekly patterns). Source: https://vwo.com/ab-testing/ [2]

## Statistical Significance
- **Threshold**: Typically 95% confidence level; define upfront with success metric (e.g., conversion rate lift).[1][3]
- **Analysis**: Compare against hypothesis; if inconclusive, document learnings in experimentation log.[3]
- **Implementation**: If variant wins at significance, deploy permanently; use Bayesian methods via VWO for ongoing stats.[2][3]
- **Next Step**: Run test via Shopify tools (e.g., integrated with Google Optimize alternatives); check significance weekly using built-in calculators. Source: https://vwo.com/ab-testing/ [2]; https://www.brillmark.com/how-to-run-a-b-tests-on-your-shopify-store-tools-process-common-mistakes/ [3]

## Startup-Specific Best Practices
- **Goal Definition**: Single measurable goal per test, e.g., "increase add-to-cart by 10%"; prioritize high-traffic pages.[3]
- **Variations**: Test one change vs. control (e.g., shorter form); use AI tools for ideas.[2][3]
- **Tools for Startups**: VWO for full A/B suite; Hotjar/Clarity for data; Shopify integrations.[2][3]
- **Iteration**: Build experimentation log; if no winner, refine hypothesis from heatmaps.[3]
- **Real Example**: Buffer's landing page test (pre-product) measured signup intent; 4% free-to-paid upgrade rate validated hypothesis in 4 days.[4]
- **Next Steps**: 1) Pick high-dropoff page via GA4. 2) Form hypothesis with Personizely. 3) Calc sample with Evan Miller’s. 4) Launch 2-week test via VWO free trial. Track in Google Sheet log. Source: https://www.figma.com/resource-library/concept-testing-examples/ [4]
