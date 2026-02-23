/**
 * Pure bond calculation utilities (unit-testable, no framework deps).
 * YTM is computed via binary search for stability and simplicity.
 */

import type { CouponFrequency } from './dto/calculate-bond-request.dto';
import type { PremiumDiscount } from './dto/bond-calculation-result.dto';
import type { BondCashFlowItemDto } from './dto/bond-cash-flow-item.dto';

const MAX_ITERATIONS = 200;
const YTM_TOLERANCE = 1e-8;

/** Number of coupon payments per year */
export function paymentsPerYear(frequency: CouponFrequency): number {
  return frequency === 'semi-annual' ? 2 : 1;
}

/** Coupon payment per period (before maturity; last period includes principal) */
export function couponPerPeriod(
  faceValue: number,
  annualCouponRatePct: number,
  frequency: CouponFrequency,
): number {
  return (faceValue * (annualCouponRatePct / 100)) / paymentsPerYear(frequency);
}

/** Current yield = annual coupon income / market price */
export function calculateCurrentYield(
  faceValue: number,
  annualCouponRatePct: number,
  marketPrice: number,
): number {
  if (marketPrice <= 0) return 0;
  const annualCoupon = faceValue * (annualCouponRatePct / 100);
  return (annualCoupon / marketPrice) * 100;
}

/** Present value of cash flows at a given per-period discount rate (decimal, e.g. 0.03 for 3%) */
export function presentValue(
  cashFlows: number[],
  ratePerPeriod: number,
): number {
  let pv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    pv += cashFlows[t] / Math.pow(1 + ratePerPeriod, t + 1);
  }
  return pv;
}

/** Build array of cash flows (coupon, coupon, ..., coupon + face value). */
export function buildCashFlowAmounts(
  faceValue: number,
  annualCouponRatePct: number,
  yearsToMaturity: number,
  frequency: CouponFrequency,
): number[] {
  const n = paymentsPerYear(frequency);
  const periods = Math.ceil(yearsToMaturity * n);
  const coupon = couponPerPeriod(faceValue, annualCouponRatePct, frequency);
  const flows: number[] = [];
  for (let i = 0; i < periods; i++) {
    flows.push(i === periods - 1 ? coupon + faceValue : coupon);
  }
  return flows;
}

/** YTM (per period, decimal) via binary search; annualized return in percentage. */
export function calculateYTM(
  faceValue: number,
  annualCouponRatePct: number,
  marketPrice: number,
  yearsToMaturity: number,
  frequency: CouponFrequency,
): number {
  const flows = buildCashFlowAmounts(
    faceValue,
    annualCouponRatePct,
    yearsToMaturity,
    frequency,
  );
  let low = 0.0001;
  let high = 2;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    const pv = presentValue(flows, mid);
    if (Math.abs(pv - marketPrice) < YTM_TOLERANCE) {
      const n = paymentsPerYear(frequency);
      return mid * n * 100; // annualized YTM in %
    }
    if (pv > marketPrice) low = mid;
    else high = mid;
  }
  const mid = (low + high) / 2;
  const n = paymentsPerYear(frequency);
  return mid * n * 100;
}

/** Total coupon interest = sum of all coupon payments (excluding return of principal). */
export function calculateTotalCouponInterest(
  faceValue: number,
  annualCouponRatePct: number,
  yearsToMaturity: number,
  frequency: CouponFrequency,
): number {
  const n = paymentsPerYear(frequency);
  const periods = Math.ceil(yearsToMaturity * n);
  const coupon = couponPerPeriod(faceValue, annualCouponRatePct, frequency);
  return coupon * periods;
}

/**
 * Total interest earned (dollar profit if held to maturity) =
 * (total coupons + redemption) - purchase price.
 *
 * This makes zero-coupon bonds earn (faceValue - marketPrice) over the life.
 */
export function calculateTotalInterestEarned(
  faceValue: number,
  annualCouponRatePct: number,
  marketPrice: number,
  yearsToMaturity: number,
  frequency: CouponFrequency,
): number {
  const totalCoupons = calculateTotalCouponInterest(
    faceValue,
    annualCouponRatePct,
    yearsToMaturity,
    frequency,
  );
  return totalCoupons + faceValue - marketPrice;
}

export function detectPremiumDiscount(marketPrice: number, faceValue: number): PremiumDiscount {
  if (Math.abs(marketPrice - faceValue) < 0.01) return 'par';
  return marketPrice > faceValue ? 'premium' : 'discount';
}

/** Build cash flow schedule with period, payment date, coupon, cumulative interest, remaining principal. */
export function buildBondCashFlows(
  faceValue: number,
  annualCouponRatePct: number,
  yearsToMaturity: number,
  frequency: CouponFrequency,
  startDate: Date = new Date(),
): BondCashFlowItemDto[] {
  const n = paymentsPerYear(frequency);
  const periods = Math.ceil(yearsToMaturity * n);
  const coupon = couponPerPeriod(faceValue, annualCouponRatePct, frequency);
  const monthsPerPeriod = 12 / n;
  const schedule: BondCashFlowItemDto[] = [];
  let cumulative = 0;
  for (let i = 0; i < periods; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + (i + 1) * monthsPerPeriod);
    cumulative += coupon;
    const remainingPrincipal = i === periods - 1 ? 0 : faceValue;
    schedule.push({
      period: i + 1,
      paymentDate: paymentDate.toISOString().slice(0, 10),
      couponPayment: i === periods - 1 ? coupon + faceValue : coupon,
      cumulativeInterest: cumulative,
      remainingPrincipal,
    });
  }
  return schedule;
}
