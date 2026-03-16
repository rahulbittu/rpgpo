# Subtask Output — Research Tax Implications of Stock Options
## Model: sonar
## Stage: research
## Date: 2026-03-16

## ISOs: Tax Implications and AMT Calculation
Incentive Stock Options (ISOs) defer regular federal income tax at exercise, but the **spread** (fair market value minus strike price) is an AMT preference item taxed at **26% or 28% AMT rates**. For example, exercising 1,000 ISOs at $10 strike when FMV is $50 creates a $40,000 spread added to AMT income.[1] To qualify for **long-term capital gains (0%, 15%, or 20%)** on sale, hold shares **1 year post-exercise** and **2 years post-grant**; otherwise, disqualifying disposition taxes the spread as ordinary income (10%-46%).[1][2] ISOs must be exercised within **10 years of grant** (5 years for 10% shareholders) or within **3 months of termination** to retain status.[2] Annual vesting limit is **$100,000** in realizable value.[3][6]

**AMT Example (Federal):** $400,000 spread on 10,000 shares ($10 strike, $50 FMV) triggers AMT on that amount; combined with California ordinary income tax up to **13.3%**, effective rate can exceed **50%**.[3]

Source: https://www.esofund.com/blog/stock-option-taxes[1]; https://www.jdsupra.com/legalnews/tech-sector-guide-to-stock-options-9829881/[2]; https://ietaxattorney.com/stock-option-taxes-in-california-iso-nso-and-rsu-tax-planning-for-tech-workers/[3]; https://carta.com/sg/en/learn/resources/iso-100k-guide/[6]

## NSOs: Tax Implications
Non-Qualified Stock Options (NSOs) tax the **spread at exercise as ordinary income (10%-46% federal + payroll taxes/withholding)**, with post-exercise gain/loss as capital gains (long-term if held **1+ year** post-exercise).[1][2][3] No holding periods for ISO benefits apply. **Optimal strategy:** Exercise-and-sell simultaneously (cashless exercise) to cover taxes with proceeds and avoid holding risk, as upfront tax on unrealized gains creates opportunity cost.[5]

Source: https://www.esofund.com/blog/stock-option-taxes[1]; https://www.jdsupra.com/legalnews/tech-sector-guide-to-stock-options-9829881/[2]; https://ietaxattorney.com/stock-option-taxes-in-california-iso-nso-and-rsu-tax-planning-for-tech-workers/[3]; https://investingforever.com/2026/02/17/when-to-sell-your-nsos-a-practical-guide-for-professionals/[5]

## 83(b) Election Timing
File **Section 83(b) election within 30 days of early exercise** (before/upon vesting) for NSOs to treat unvested shares as vested, taxing the spread at exercise (low value) as ordinary income; future appreciation qualifies for capital gains. Not required but elective; inapplicable to standard vested exercises. No 83(b) for ISOs at exercise (no regular tax event).[2]

Source: https://www.jdsupra.com/legalnews/tech-sector-guide-to-stock-options-9829881/[2]

## Optimal Exercise Strategies
- **ISOs:** Time exercises to minimize AMT (e.g., stagger across years, coordinate with deductions); exercise-and-hold if liquidity allows for long-term gains, but watch California double-tax (ordinary income on spread).[1][3][4] Avoid post-termination lapse (3 months).[2]
- **NSOs:** Prefer cashless exercise-and-sell; defer via **83(i) election** (up to 5 years for qualified small business stock) or swap exercises.[4][5]
- **General:** Check cash flow for immediate taxes; high-tax states like California add **13.3%** on ISO spreads.[1][3][4]

**No income-bracket-specific strategies found** in results (e.g., no breakdowns by $200k-$500k AGI); strategies are situational based on AMT phase-out, not explicit brackets. Federal brackets: ordinary 10%-46%, LTCG 0%/15%/20%.[1]

**Next Steps:**
- Use IRS Form 6251 for AMT preview on ISO spread.
- Consult CPA for 2026 modeling (e.g., via esofund.com tools).[1][4]
- File 83(b) via IRS letter post-exercise if early NSO.

Source: https://www.esofund.com/blog/ways-to-reduce-stock-option-taxes[4] (2026 Guide)
