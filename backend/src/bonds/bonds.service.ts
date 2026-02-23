import { Injectable } from '@nestjs/common';
import { CalculateBondRequestDto } from './dto/calculate-bond-request.dto';
import { BondCalculationResultDto } from './dto/bond-calculation-result.dto';
import {
  calculateCurrentYield,
  calculateYTM,
  calculateTotalInterestEarned,
  detectPremiumDiscount,
  buildBondCashFlows,
} from './bond.utils';

@Injectable()
export class BondsService {
  calculate(dto: CalculateBondRequestDto): BondCalculationResultDto {
    const {
      faceValue,
      annualCouponRate,
      marketPrice,
      yearsToMaturity,
      couponFrequency,
    } = dto;

    const currentYield = calculateCurrentYield(
      faceValue,
      annualCouponRate,
      marketPrice,
    );
    const yieldToMaturity = calculateYTM(
      faceValue,
      annualCouponRate,
      marketPrice,
      yearsToMaturity,
      couponFrequency,
    );
    const totalInterestEarned = calculateTotalInterestEarned(
      faceValue,
      annualCouponRate,
      marketPrice,
      yearsToMaturity,
      couponFrequency,
    );
    const premiumDiscount = detectPremiumDiscount(marketPrice, faceValue);
    const cashFlowSchedule = buildBondCashFlows(
      faceValue,
      annualCouponRate,
      yearsToMaturity,
      couponFrequency,
    );

    return {
      currentYield,
      yieldToMaturity,
      totalInterestEarned,
      premiumDiscount,
      cashFlowSchedule,
    };
  }
}
