# Bond Yield Calculator – Algorithm Choices

## Yield to Maturity (YTM)

- **Method**: Binary search on the per-period discount rate.
- **Rationale**: Newton-Raphson is faster per iteration but requires a good initial guess and can diverge for extreme inputs. Binary search is robust, easy to test, and converges within a small number of iterations (we use 200 max) to a tolerance of `1e-8` on price.
- **Formula**: We find the per-period rate `r` such that  
  `marketPrice = Σ (cashFlow[t] / (1+r)^(t+1))` for `t = 0..n-1`.  
  Annualized YTM is then `r × paymentsPerYear × 100` (in percentage).
- **Cash flows**: For each period we pay the coupon; on the last period we also repay the face value. Number of periods = `ceil(yearsToMaturity × paymentsPerYear)`.

## Current Yield

- **Formula**: `(faceValue × annualCouponRate% / 100) / marketPrice × 100`.  
  I.e. annual coupon income divided by market price, expressed as a percentage.

## Total Interest Earned

- **Formula (hold-to-maturity dollars earned)**: Total cash received minus purchase price.  
  
  `Total Interest Earned = ((sum of coupons) + faceValue) - market price`
  
  
  This ensures **zero-coupon bonds** earn \(\text{face} - \text{price}\) over the life.

## Premium / Discount

- **Rule**: If `marketPrice > faceValue` → premium; if `marketPrice < faceValue` → discount; if they are equal within $0.01 → par.

## Cash Flow Schedule

- **Payment dates**: First payment is one period from “today” (server date at calculation time), then every 6 months (semi-annual) or 12 months (annual).
- **Columns**: Period index, payment date (ISO), coupon payment (last row includes principal), cumulative interest (running sum of coupons), remaining principal (face value until last period, then 0).
