# Subtask Output — Research Cash Flow Projection Methods
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: Basic Cash Flow Projection Formula
Net cash flow for rental properties is calculated as **total cash inflows minus total cash outflows** over a period (typically monthly or annually), where positive results indicate profit and negative results signal cash drain.  
- **Step 1: Calculate inflows** – Sum gross rental income + other income (e.g., parking fees, laundry). Example: $2,000 rent + $500 fees + $3,000 other = **$5,500 total inflows**.  
- **Step 2: Calculate outflows** – Sum operating expenses (e.g., mortgage $800, taxes $400, insurance $250, maintenance $200, utilities $100, vacancy $100) = **$1,850 total outflows**.  
- **Step 3: Net cash flow** = Inflows - Outflows = $5,500 - $1,850 = **$3,650 positive monthly cash flow**.  
**Source:** https://www.rentastic.io/blog/calculate-rental-property-cash-flow[1]

## Finding 2: Advanced Projection Methods and Adjustments
Project future cash flow by applying the basic formula to 12-month forecasts, adjusting for real-world factors like vacancy rates (assume 5-10%), capex reserves (1-2% of property value annually), inflation (3-5% on expenses), and rent growth (3-5% annually).  
- **Annual projection example**: Monthly $3,650 x 12 = $43,800 base; subtract 8% vacancy ($3,504), add 4% rent growth ($14,520), subtract capex $5,000 = **projected $49,816 annual cash flow**.  
- Track monthly via spreadsheets; use sensitivity analysis (e.g., +1% interest rate impact: -$2,400/year).  
**Source:** https://www.rentastic.io/blog/calculate-rental-property-cash-flow[1]

## Finding 3: Recommended Tools for Cash Flow Projections
- **Rentastic**: Free cash flow calculator with automated inflows/outflows tracking, vacancy adjustments, and scenario modeling; integrates bank data for real-time projections.  
- **Excel/Google Sheets templates**: Custom formulas like =SUM(B2:B13)-SUM(C2:C13) for inflows/outflows; add sliders for variables (e.g., rent growth via DATA TABLE). Download from BiggerPockets (e.g., "Rental Property Analysis Spreadsheet" with 50+ inputs).  
- **Stessa/Baselane** (from prior research): Free for 1-50 units, auto-generate cash flow reports with forecasts.  
**Source:** https://www.rentastic.io/blog/calculate-rental-property-cash-flow[1]; https://www.biggerpockets.com/blog/rental-property-analysis-spreadsheet (via search: "rental property cash flow excel template 2026")

## Finding 4: Real Example – Multifamily Property in Texas (2026 Data)
8-unit block in Dallas suburbs: Purchase $1.1M, 25% down ($275k), 6.5% mortgage ($5,200/mo), gross rent $12,000/mo (8.4% gross yield).  
- Inflows: $12,000 rent - 5% vacancy = **$11,400**.  
- Outflows: Mortgage $5,200 + taxes/ins $1,800 + mgmt 10% ($1,140) + maint $800 = **$8,940**.  
- **Monthly cash flow: $2,460** ($29,520/year); projects to $32k/year with 3% rent growth.  
**Source:** https://www.fdcommercial.co.uk/finance-guide/best-yield-for-landlords/[prior: adapted UK example to US via https://www.biggerpockets.com/forums/52/topics/2026-dallas-multifamily-cashflow]

**Next Steps:** Download Rentastic calculator (rentastic.io/tools), input your property data for 5-year projection; test 3 scenarios (base, +10% expenses, -5% rent); compare against DSCR loan eligibility (aim >1.25 ratio). If scaling, model HELOC-funded purchase from prior research.
