# Subtask Output — Research SaaS Financial Metrics
## Model: sonar
## Stage: research
## Date: 2026-03-15

## LTV Calculation for SaaS
**Customer Lifetime Value (LTV)** measures total gross profit per customer over their lifetime, using the formula: **LTV = (ARPA or ARPU × Gross Margin) ÷ Monthly Churn Rate**.[1][3][4][6]

- Example from ScaleWithCFO (2023): ARPA £500/month, 80% gross margin, 2% churn → LTV = (£500 × 0.80) ÷ 0.02 = **£20,000**.[1] Source: https://www.scalewithcfo.com/post/unit-economics-saas-guide
- Example from Twilio (2024): ARPA $100/month, 80% gross margin, 5% churn → LTV = ($100 × 0.80) ÷ 0.05 = **$1,600**.[4] Source: https://www.twilio.com/en-us/blog/insights/customer-lifetime-value-clv
- Conservative variant from Userpilot (2023): LTV = (ARPA ÷ Churn) × 0.75 discount factor; e.g., ARPA $40, 20% churn → ($40 ÷ 0.2) × 0.75 = **$150**.[2] Source: https://userpilot.com/blog/ltv-cac-ratio-saas/

## LTV:CAC Ratio
**LTV:CAC ratio** compares lifetime value to acquisition cost (CAC = Total Sales/Marketing Expenses ÷ New Customers); target **3:1 minimum** for healthy SaaS profitability.[1][2][4][5]

- Benchmark: 3:1+ sustainable; <3:1 unprofitable; 5:1+ under-investing in growth.[5] Source: https://swetrix.com/tools/ltv-calculator
- Userpilot example (2022 data): LTV $150, CAC $16.67 → **9:1 ratio**.[2] Source: https://userpilot.com/blog/ltv-cac-ratio-saas/
- Formula: LTV:CAC = [(ARPA ÷ Churn × 0.75) ÷ CAC].[2] Source: https://userpilot.com/blog/ltv-cac-ratio-saas/

## Payback Period
Payback period is the time to recover CAC from customer gross profit; formula: **Payback Period (months) = CAC ÷ (ARPA × Gross Margin)**. Aim for <12 months in SaaS.[1]

- No specific numerical examples in results; derived from LTV components (e.g., using ScaleWithCFO data: if CAC £5,000, ARPA £500, 80% margin → 5,000 ÷ (£500 × 0.8) = **12.5 months**).[1] Source: https://www.scalewithcfo.com/post/unit-economics-saas-guide

## Break-Even Point
Break-even occurs when cumulative gross profit equals CAC, aligning with payback period; no standalone formula in results, but tied to LTV:CAC ≥1:1 where LTV covers CAC.[4][5]

- At 1:1 ratio, business breaks even per customer; Twilio example: CAC <$382 profitable with LTV $382.[4] Source: https://www.twilio.com/en-us/blog/insights/customer-lifetime-value-clv
- No additional specific examples found.

**Next Steps:** Input your ARPA, margin, churn, CAC into Swetrix calculator for instant results (https://swetrix.com/tools/ltv-calculator); track monthly via cohort analysis in tools like Userpilot; target 3:1 LTV:CAC by Q1 2026 benchmark review.[2][5]
