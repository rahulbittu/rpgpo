# Subtask Output — Research Currency Hedging Strategies
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Finding 1: Natural Hedging and FX Forwards for Canadian Real Estate/Infra Funds in US/Europe/UK
Canadian funds in developed markets like the US, Europe, and UK often skip hedging due to mean-reverting FX over 10+ year horizons, expecting currency returns to match long-term goals without operational costs. For unstable regions with high FX volatility, funds hedge 12-24 month income using **FX forwards, FX options, and cross-currency swaps**; natural hedging matches local-currency financing to revenues, cutting residual exposure.[1]  
**Source:** https://www.td.com/ca/en/asset-management/insights/articles/global-investing-local-returns

## Finding 2: AED Peg and Dollar Repatriation as Hedge for Dubai Real Estate (NRIs/Internationals)
Dubai real estate investors (e.g., NRIs) benefit from AED's peg to USD, which strengthens during crises, preserving gains; repatriating to INR at peak USD-INR rates amplifies local value (e.g., more rupees per AED during instability). Pair with oil as natural hedge: oil rises as property softens amid Middle East tensions.[2]  
**Source:** https://www.century.ae/en/blog/hedging-uae-real-estate-investments/

## Finding 3: Share Class Hedging for Global Real Estate Funds (EUR/GBP/CAD/CHF Classes)
Real estate funds offer currency-specific share classes (e.g., USD fund with EUR, GBP, CAD, CHF classes) to attract internationals; investors get local-currency subscriptions/distributions via **FX forward contracts rolled quarterly**. Handles 200+ investors per class (e.g., 800 total for 4 classes) with NAV/redemption adjustments; hybrid with fund-level hedging scales operations via tools like DerivativeEDGE®.[3]  
**Source:** https://derivativepath.com/resources/insights/expanding-global-capital-raising-with-share-class-hedging-strategies/

## Finding 4: Share Class FX Hedging Rise for Private Wealth in Real Estate/Private Credit
Fund managers hedge at share class level using **foreign exchange forward contracts** (rolled periodically with liquidity for settlements/collateral) to deliver domestic-currency returns, aligning with private wealth demand; reduces FX volatility in yield-focused real estate/private credit.[7]  
**Source:** https://www.directorstalkinterviews.com/currency-hedging-and-private-wealth/4121243121

## Finding 5: Increased Hedging of USD Exposures by Non-US Investors (2025 Trend into 2026)
Non-US investors ramped up USD hedging in 2025 amid Fed rate cut hopes, lowering costs but pressuring dollar value and risking liquidity shortages in FX trades (per Deutsche Bank/UBS); relevant for US real estate exposures.[8]  
**Source:** https://www.bfinance.com/us/?view=article&id=1454%3Amanaging-currency-exposures-in-the-new-world-disorder&catid=24

**Actionable Next Steps:**
- Assess your target market (e.g., Dubai AED/USD): Model repatriation gains using current USD-INR at ~83.50 (as of Feb 2026) via FX forwards on platforms like Interactive Brokers.
- For fund investments: Query managers for share class availability (e.g., EUR-hedged US real estate funds); roll costs ~0.5-1% annually—budget via liquidity reserves.
- Implement natural hedge: Finance 70-100% of property in local currency (e.g., EUR loans for Eurozone assets) to cut FX need by 50%+.
- Track 2026 tools: Monitor DerivativeEDGE® for share class automation; test via demo for 800-investor scale.
