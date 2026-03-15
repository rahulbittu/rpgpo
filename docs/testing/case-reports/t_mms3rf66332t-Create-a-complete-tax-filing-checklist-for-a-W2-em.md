# Create a complete tax filing checklist for a W2 employee with side LLC income. I

## Phase 1: User Context

- **Task ID**: `t_mms3rf66332t`
- **Engine**: wealthresearch
- **Urgency**: normal
- **Created**: 2026-03-15T18:43:12

### Operator Context (auto-injected)
- Rahul, Senior Data Engineer / Entrepreneur, Austin TX
- Output style: Specific, actionable, cited. No generic frameworks.

### Request
> Create a complete tax filing checklist for a W2 employee with side LLC income. Include all forms needed, deduction categories, and common mistakes to avoid.

## Phase 2: Board of AI Deliberation

**Chief of Staff**: "Create a detailed tax filing checklist for a W2 employee with side LLC income."

**Strategy**: First, conduct research to identify the specific tax forms and deduction categories relevant to a W2 employee with side LLC income. Then, synthesize this information into a structured checklist, highlighting common mistakes to avoid. Finally, compile the findings into a detailed report.

**Risk**: green | **Code Task**: No

**Execution Plan**:

| Step | Task | Model | Stage |
|------|------|-------|-------|
| 1 | Research Tax Forms and Deductions | perplexity | research |
| 2 | Synthesize Tax Filing Checklist | openai | report |

## Phase 3: Execution

### Step 1: Research Tax Forms and Deductions [perplexity]

**Status**: done | **Stage**: research

## W-2 Employee Tax Forms
W-2 employees receive **Form W-2** from their employer reporting 2025 wages, tips, and withheld taxes for the 2026 filing season (covering tax year 2025). Employers must provide Copy B to employees by **February 2, 2026** (extended from January 31 due to it falling on a Saturday) and file with the SSA by the same date; e-filing is required for 10+ returns.[2][4]

- **Key W-2 Boxes for Wages/Taxes**:
  | Box | Description | Example Data |
  |-----|-------------|--------------|
  | 1 | Wages, tips, other compensation (excludes 401(k) deferrals) | Total gross pay[1][3] |
  | 2 | Federal income tax withheld | Total withheld amount[1] |
  | 3 | Social Security wages | Up to wage base limit[3] |
  | 4 | Social Security tax withheld | 6.2% employee share[3] |
  | 5 | Medicare wages/tips | All wages (no cap)[3] |
  | 6 | Medicare tax withheld | 1.45% employee share[3] |
  | 12 | Deferred comp (e.g., Code D: 401(k) deferrals; W: HSA contributions; DD: Health coverage cost)[1][2] |
  | 15-17 | State wages, ID, state tax withheld[1][2] |

- **2026 W-2 Changes**: Box 14 splits into 14a (other, e.g., union dues, disability insurance) and 14b (Treasury Tipped Occupation Codes for tip deductions via Box 12 Code TP); new $2,000 reporting threshold for non-withheld payments (replaces $600).[3][5]
Source: https://onpay.com/insights/form-w-2-instructions/[1]; https://www.formpros.com/a-step-by-step-guide-to-filling-out-the-w2-form/[2]; https://www.paycom.com/resources/blog/w-2-distribution-file/[3]; https://efilemyforms.com/blog/when-are-w2s-due/[4]; https://www.deel.com/es/deel-works/w2-reporting-payroll-system-overhaul-2026[5]

## Side LLC Income Tax Forms
Side LLC income (assuming single-member disregarded entity, default for most) is reported on **Schedule C (Form 1040)** as self-employment income, not on W-2. File **Schedule SE** for self-employment tax (15.3% on net earnings: 12.4% Social Security + 2.9% Medicare). Use **Form 1040** to combine W-2 and LLC income; no separate LLC return needed unless multi-member (Form 1065).[No direct search result; based on standard IRS rules confirmed via IRS site knowledge, as results focus on W-2.]

- LLC requires EIN if paying contractors; track expenses on Schedule C.
Source: https://www.irs.gov/instructions/i1040sc [no URL in results; standard IRS form page]

## Personal Tax Return Forms (Combining W-2 + LLC)
File **Form 1040** by **April 15, 2026** (or extend to October 15). Attach **Schedule 1** (additional income like LLC), **Schedule C** (LLC profit/loss), **Schedule SE** (self-employment tax).[No direct 2026 Form 1040 details in results.]

## Deduction Categories
**W-2 Employee Deductions**: Mostly "above-the-line" or standard deduction; itemized on **Schedule A** if exceeding standard. 2026 standard deductions: **$32,200** married filing jointly, **$16,100** single, **$24,150** head of household.[7]

**Side LLC Deductions** (on Schedule C, ordinary/necessary business expenses, reducing s

*... truncated (4341 chars total)*

### Step 2: Synthesize Tax Filing Checklist [openai]

**Status**: done | **Stage**: report

## Key Findings

1. **Tax Forms for W-2 Employees and LLC Income**:
   - **Form W-2**: Essential for reporting wages, tips, and taxes withheld from employment.
   - **Schedule C (Form 1040)**: Used to report income or loss from a business operated as a sole proprietor or single-member LLC.
   - **Form 1040**: The primary tax form used to file an individual federal income tax return.

2. **Deduction Categories**:
   - **Business Expenses**: Deductible on Schedule C, including office supplies, travel, and advertising.
   - **Home Office Deduction**: Available if part of the home is used exclusively and regularly for business.
   - **Retirement Contributions**: Contributions to SEP IRA or Solo 401(k) can be deductible.
   - **Health Insurance Premiums**: Deductible if self-employed and not eligible for employer-sponsored plans.

3. **Common Mistakes to Avoid**:
   - **Misreporting Income**: Ensure all income from both W-2 and LLC is accurately reported.
   - **Improper Expense Deductions**: Only deduct expenses that are ordinary and necessary for the business.
   - **Home Office Deduction Errors**: Ensure the space is exclusively used for business to qualify.

## Detailed Analysis

### Tax Forms
- **Form W-2**: Must be received by February 2, 2026. Key boxes include:
  - Box 1: Wages, tips, other compensation.
  - Box 2: Federal income tax withheld.
  - Box 12: Deferred compensation like 401(k) contributions.
  - Box 14: Now split into 14a and 14b for additional reporting.

- **Schedule C (Form 1040)**: Report LLC income and expenses. Key sections include:
  - Part I: Income – Gross receipts or sales.
  - Part II: Expenses – List deductible business expenses.

- **Form 1040**: Summarizes total income, deductions, and calculates tax liability.

### Deduction Categories
- **Business Expenses**: Include costs like office supplies, travel, and advertising. Keep detailed records and receipts.
- **Home Office Deduction**: Calculate based on the percentage of the home used for business. Use Form 8829 for detailed calculations.
- **Retirement Contributions**: Contributions to retirement plans like SEP IRA or Solo 401(k) are deductible, reducing taxable income.
- **Health Insurance Premiums**: Deductible if not covered by an employer plan.

### Common Mistakes
- **Misreporting Income**: Cross-check all income sources and ensure accurate reporting.
- **Improper Expense Deductions**: Avoid deducting personal expenses as business expenses.
- **Home Office Deduction Errors**: Ensure the space is exclusively used for business to qualify.

## Recommended Actions

1. **Gather Necessary Forms**:
   - Collect Form W-2 from your employer by February 2, 2026.
   - Prepare Schedule C for your LLC income and expenses.
   - Use Form 1040 for filing your overall tax return.

2. **Organize Expense Documentation**:
   - Maintain detailed records of all business-related expenses.
   - Use accounting software to track and categorize expenses throughout the year.

3. **Review D

*... truncated (3788 chars total)*

## Phase 4: Deliverable

- **Status**: done
- **Subtasks**: 2/2 completed
- **Download MD**: /api/intake/task/t_mms3rf66332t/export?fmt=md
- **Download JSON**: /api/intake/task/t_mms3rf66332t/export?fmt=json
