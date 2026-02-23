export type CouponFrequency = 'annual' | 'semi-annual';
export type PremiumDiscount = 'premium' | 'discount' | 'par';

export interface CalculateBondRequest {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
}

export interface BondCashFlowItem {
  period: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export interface BondCalculationResult {
  currentYield: number;
  yieldToMaturity: number;
  totalInterestEarned: number;
  premiumDiscount: PremiumDiscount;
  cashFlowSchedule: BondCashFlowItem[];
}
