import { IsNumber, IsIn, Min, Max } from 'class-validator';

export type CouponFrequency = 'annual' | 'semi-annual';

export class CalculateBondRequestDto {
  @IsNumber()
  @Min(0.01, { message: 'Face value must be positive' })
  faceValue!: number;

  @IsNumber()
  @Min(0, { message: 'Coupon rate cannot be negative' })
  @Max(100, { message: 'Coupon rate cannot exceed 100%' })
  annualCouponRate!: number;

  @IsNumber()
  @Min(0.01, { message: 'Market price must be positive' })
  marketPrice!: number;

  @IsNumber()
  @Min(0.01, { message: 'Years to maturity must be positive' })
  yearsToMaturity!: number;

  @IsIn(['annual', 'semi-annual'], {
    message: 'Coupon frequency must be "annual" or "semi-annual"',
  })
  couponFrequency!: CouponFrequency;
}
