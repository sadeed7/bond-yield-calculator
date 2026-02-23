export class BondCashFlowItemDto {
  period!: number;
  paymentDate!: string; // ISO date string
  couponPayment!: number;
  cumulativeInterest!: number;
  remainingPrincipal!: number;
}
