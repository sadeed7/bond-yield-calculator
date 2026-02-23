import { BondCashFlowItemDto } from './bond-cash-flow-item.dto';

export type PremiumDiscount = 'premium' | 'discount' | 'par';

export class BondCalculationResultDto {
  currentYield!: number;
  yieldToMaturity!: number;
  totalInterestEarned!: number;
  premiumDiscount!: PremiumDiscount;
  cashFlowSchedule!: BondCashFlowItemDto[];
}
