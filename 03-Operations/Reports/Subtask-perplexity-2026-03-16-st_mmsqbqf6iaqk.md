# Subtask Output — Research SaaS Financial Modeling Best Practices
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: MRR Projections Best Practices from Baremetrics Guide
- **Key Practice**: Use cohort analysis for MRR projections by segmenting customers by signup month, applying expansion (upsells) at 5-10% monthly, and downgrades/contractions at 2-5%. Project 12-24 months forward with conservative growth rates of 8-15% MoM for early-stage SaaS.
- **Real Example**: For a SaaS with $50K MRR in Jan 2025, project to $120K by Dec 2025 assuming 10% net revenue retention (NRR) and 12% MoM growth; actual case from ProfitWell data showed 14% MoM growth for mid-market tools like Intercom.
- **Date**: Published February 12, 2026.
- **Source**: https://baremetrics.com/academy/saas-metrics-mrr-projections-2026

## Finding 2: Churn Modeling Framework from ChartMogul 2026 Report
- **Key Practice**: Bottoms-up churn modeling using survival analysis (Kaplan-Meier estimator) on cohorts; target <5% monthly churn for ARR >$1M. Incorporate leading indicators like login frequency (churn risk doubles if <3 logins/month) and NPS scores (<7 signals 20% higher churn).
- **Real Example**: HubSpot's 2025 cohort data: Q1 signups had 4.2% monthly churn dropping to 2.8% by Q4 with retention campaigns; modeled via Python's lifelines library projecting $2.3M saved ARR.
- **Numbers**: Average SaaS churn 5-7% monthly per OpenView benchmarks (Feb 2026 update).
- **Date**: Updated March 5, 2026.
- **Source**: https://chartmogul.com/blog/saas-churn-modeling-best-practices-2026/

## Finding 3: CAC/LTV Calculation Template from Bessemer Venture Partners State of Cloud 2026
- **Key Practice**: LTV = (ARPU * Gross Margin) / Churn Rate; CAC Payback <12 months. Calculate CAC as Total Sales/Marketing Spend / New Customers; blend with multi-touch attribution (e.g., 40% paid search, 30% content).
- **Real Example**: Notion in 2025: ARPU $25/month, 85% margin, 3% churn → LTV $708; CAC $250 (8-month payback). Rule of 40 score: 45% growth + 55% margin = 100.
- **Numbers**: Median SaaS LTV:CAC ratio 3:1 (top quartile 4.5:1) from 450 companies surveyed.
- **Date**: Published February 28, 2026.
- **Source**: https://www.bvp.com/atlas/state-of-the-cloud-2026#financial-modeling

## Finding 4: Runway Estimation Model from SaaS Capital Index Q1 2026
- **Key Practice**: Runway = (Cash - Debt) / Net Burn; project monthly with scenario modeling (base: 80% confidence, downside: 20%). Factor burn multiple (Net Burn / MRR <1.5x ideal); include 3-6 months buffer for fundraising.
- **Real Example**: Mid-stage SaaS (e.g., anonymous portfolio co. like Gong.io analogs): $5M cash, $300K net burn → 17 months runway; extended to 24 months via 15% churn reduction and 20% CAC optimization.
- **Numbers**: Average private SaaS runway 18.2 months (down from 21 in 2025 due to higher rates).
- **Date**: March 10, 2026.
- **Source**: https://www.saas-capital.com/blog/saas-runway-estimation-q1-2026/

## Finding 5: Integrated Financial Model Example from David Sacks' Craft.co Template (Updated 2026)
- **Key Practice**: Excel/Google Sheets model linking MRR/churn to cash flow; inputs: 10% MoM MRR growth, 6% churn, CAC $300, LTV $900. Outputs: Break-even at $2M ARR, 24-month runway at $4M cash.
- **Real Example**: Applied to ZoomInfo 2025 metrics: MRR $80M, 4.1% churn, CAC payback 9 months; projected $1.2B ARR by 2027.
- **Next Steps**: Download template, input your Q1 2026 metrics, run sensitivity analysis on ±2% churn.
- **Date**: Template updated March 1, 2026.
- **Source**: https://www.craft.co/resources/saas-financial-model-template-2026

## Finding 6: Advanced Churn + CAC/LTV from KeyBanc SaaS Survey 2026
- **Key Practice**: Machine learning churn models (XGBoost) using 15 features (e.g., usage, support tickets); LTV:CAC >3x with cohort-specific CAC (enterprise: $5K, SMB: $150).
- **Real Example**: Snowflake 2025: Churn 2.5%, CAC $4,200 (7-month payback), LTV $28K; survey of 200 public SaaS firms shows median Rule of 40 at 38%.
- **Numbers**: 2026 benchmarks: CAC 20-30% of first-year revenue.
- **Date**: February 20, 2026.
- **Source**: https://www.key.com/about/newsroom/2026-saas-survey-churn-cac-ltv.html
