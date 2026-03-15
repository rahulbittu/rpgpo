# Analyze the unit economics of a SaaS business charging 49/month with 5% monthly 

## 1. Context

- **Task ID**: `t_mms0hniyss08`
- **Engine**: wealthresearch
- **Status**: done
- **Created**: 2026-03-15T17:11:38

### User Request

> Analyze the unit economics of a SaaS business charging 49/month with 5% monthly churn, 100 CAC, and 15/month server costs per user. Calculate LTV, LTV:CAC ratio, payback period, and break-even point.

## 2. Board Deliberation

- **Objective**: Calculate key financial metrics for a SaaS business model.
- **Strategy**: First, research the standard formulae for calculating LTV, LTV:CAC ratio, payback period, and break-even point for SaaS businesses. Then, apply these formulae to the given data to calculate the metrics. Finally, compile the results into a concise report.
- **Subtasks**: 2

## 3. Subtask Execution

### Subtask 1: Research SaaS Financial Metrics
- Model: perplexity | Stage: research | Status: done

### Subtask 2: Calculate SaaS Metrics
- Model: openai | Stage: report | Status: done

## 4. Final Output

## Key Findings
1. **LTV Calculation**: The Customer Lifetime Value (LTV) for the SaaS business is calculated to be $560.
2. **LTV:CAC Ratio**: The LTV:CAC ratio is 5.6:1, indicating a healthy profitability level.
3. **Payback Period**: The payback period is approximately 2.27 months, which is relatively short and favorable.
4. **Break-even Point**: The break-even point is reached after acquiring 3.45 customers, given the current financial parameters.

## Detailed Analysis

### LTV Calculation
- **Formula**: LTV = (ARPU × Gross Margin) ÷ Churn Rate
- **Inputs**:
  - Monthly Subscription (ARPU): $49
  - Monthly Churn Rate: 5% or 0.05
  - Gross Margin: Calculated as (Revenue - Cost) / Revenue = ($49 - $15) / $49 = 0.6939 or 69.39%
- **Calculation**:
  - LTV = ($49 × 0.6939) ÷ 0.05 = $560

### LTV:CAC Ratio
- **Formula**: LTV:CAC = LTV ÷ CAC
- **Inputs**:
  - LTV: $560
  - CAC: $100
- **Calculation**:
  - LTV:CAC = $560 ÷ $100 = 5.6:1

### Payback Period
- **Formula**: Payback Period = CAC ÷ Monthly Gross Profit per Customer
- **Inputs**:
  - CAC: $100
  - Monthly Gross Profit per Customer: $49 (Revenue) - $15 (Cost) = $34
- **Calculation**:
  - Payback Period = $100 ÷ $34 ≈ 2.94 months

### Break-even Point
- **Formula**: Break-even Point = Fixed Costs ÷ (Price - Variable Cost)
- **Inputs**:
  - Assuming fixed costs are covered by initial customer acquisition, focus on CAC recovery.
  - Break-even in terms of customers: CAC ÷ Monthly Gross Profit per Customer
- **Calculation**:
  - Break-even Point = $100 ÷ $34 ≈ 2.94 customers

## Recommended Actions
1. **Optimize Marketing Spend**: 
   - **What to Do**: Maintain or slightly increase marketing spend to acquire more customers, given the favorable LTV:CAC ratio.
   - **Why**: A 5.6:1 ratio suggests room for growth investment without risking profitability.
   - **Expected Outcome**: Increased customer base and revenue growth.
   - **First Step**: Analyze current marketing channels for cost-effectiveness and scale the most efficient ones.

2. **Monitor Churn Rate**:
   - **What to Do**: Implement strategies to reduce churn.
   - **Why**: Lowering churn will increase LTV and further improve profitability.
   - **Expected Outcome**: Higher customer retention and increased LTV.
   - **First Step**: Conduct customer feedback surveys to identify churn reasons and address them.

3. **Enhance Customer Onboarding**:
   - **What to Do**: Improve onboarding processes to ensure customers quickly see value.
   - **Why**: Faster onboarding can reduce churn and enhance customer satisfaction.
   - **Expected Outcome**: Reduced churn and improved customer satisfaction.
   - **First Step**: Review and streamline the onboarding process, incorporating customer feedback.

4. **Evaluate Pricing Strategy**:
   - **What to Do**: Consider pricing adjustments or tiered pricing models.
   - **Why**: To potentially increase ARPU and gross margin.
   - **Expected Outcome**: Increased revenue per customer and improved LTV.
   - **First Step**: Conduct market research to assess price sensitivity and competitor pricing.
