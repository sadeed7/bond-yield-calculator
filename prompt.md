# Bond Yield Calculator - AI Prompt Specification

You are a senior full-stack engineer and quantitative finance expert.

Goal:
Build a Bond Yield Calculator web app using React (frontend), NestJS (backend), and TypeScript.

Inputs:
- Face Value
- Annual Coupon Rate (%)
- Market Price
- Years to Maturity
- Coupon Frequency (annual / semi-annual)

Outputs:
- Current Yield
- Yield to Maturity (numerical method)
- Total Interest Earned
- Premium/Discount Indicator

Cash Flow Schedule:
- Period
- Payment Date
- Coupon Payment
- Cumulative Interest
- Remaining Principal

Constraints:
- Use numerical method for YTM (Newton-Raphson or binary search)
- Clean architecture, DTO validation, unit-testable pure functions
- React form UI + table for cash flow schedule
- TypeScript strict mode

Explainability:
Document prompting decisions and algorithm choices.