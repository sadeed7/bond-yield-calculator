import {
  paymentsPerYear,
  couponPerPeriod,
  calculateCurrentYield,
  presentValue,
  buildCashFlowAmounts,
  calculateYTM,
  calculateTotalCouponInterest,
  calculateTotalInterestEarned,
  detectPremiumDiscount,
  buildBondCashFlows,
} from './bond.utils';

describe('bond.utils', () => {
  describe('paymentsPerYear', () => {
    it('returns 1 for annual', () => {
      expect(paymentsPerYear('annual')).toBe(1);
    });
    it('returns 2 for semi-annual', () => {
      expect(paymentsPerYear('semi-annual')).toBe(2);
    });
  });

  describe('couponPerPeriod', () => {
    it('annual: 1000 face 5% => 50 per period', () => {
      expect(couponPerPeriod(1000, 5, 'annual')).toBe(50);
    });
    it('semi-annual: 1000 face 6% => 30 per period', () => {
      expect(couponPerPeriod(1000, 6, 'semi-annual')).toBe(30);
    });
  });

  describe('calculateCurrentYield', () => {
    it('annual coupon 50, price 1000 => 5%', () => {
      expect(calculateCurrentYield(1000, 5, 1000)).toBe(5);
    });
    it('annual coupon 50, price 950 => ~5.26%', () => {
      expect(calculateCurrentYield(1000, 5, 950)).toBeCloseTo(5.263157, 4);
    });
  });

  describe('presentValue', () => {
    it('single flow 1050 at 5% => 1000', () => {
      expect(presentValue([1050], 0.05)).toBeCloseTo(1000, 2);
    });
    it('two flows 50, 1050 at 5% => 1000', () => {
      expect(presentValue([50, 1050], 0.05)).toBeCloseTo(1000, 2);
    });
  });

  describe('buildCashFlowAmounts', () => {
    it('1 year annual: one flow = coupon + face', () => {
      const flows = buildCashFlowAmounts(1000, 5, 1, 'annual');
      expect(flows).toHaveLength(1);
      expect(flows[0]).toBe(1050);
    });
    it('2 year semi-annual: 4 flows, last includes face', () => {
      const flows = buildCashFlowAmounts(1000, 6, 2, 'semi-annual');
      expect(flows).toHaveLength(4);
      expect(flows[0]).toBe(30);
      expect(flows[1]).toBe(30);
      expect(flows[2]).toBe(30);
      expect(flows[3]).toBe(1030);
    });
  });

  describe('calculateYTM', () => {
    it('par bond (price = face) 1yr 5% annual => YTM ~5%', () => {
      const ytm = calculateYTM(1000, 5, 1000, 1, 'annual');
      expect(ytm).toBeCloseTo(5, 1);
    });
    it('discount bond (price < face) => YTM > coupon rate', () => {
      const ytm = calculateYTM(1000, 5, 950, 1, 'annual');
      expect(ytm).toBeGreaterThan(5);
      expect(ytm).toBeLessThan(15);
    });
    it('premium bond (price > face) => YTM < coupon rate', () => {
      const ytm = calculateYTM(1000, 5, 1050, 1, 'annual');
      expect(ytm).toBeLessThan(5);
      expect(ytm).toBeGreaterThan(0);
    });
  });

  describe('zero-coupon bonds', () => {
    it('current yield is 0 for zero-coupon', () => {
      expect(calculateCurrentYield(1000, 0, 600)).toBe(0);
    });

    it('YTM matches discount formula for zero-coupon', () => {
      // For a 5-year zero-coupon bond with 10% YTM:
      // price = face / (1 + y)^n
      // => price ≈ 1000 / 1.1^5 ≈ 620.92
      const price = 620.92;
      const ytm = calculateYTM(1000, 0, price, 5, 'annual');
      expect(ytm).toBeCloseTo(10, 1);
    });

    it('cash flow schedule has only principal at maturity', () => {
      const schedule = buildBondCashFlows(1000, 0, 5, 'annual', new Date('2020-01-01'));
      expect(schedule).toHaveLength(5);
      // No coupons before maturity
      for (let i = 0; i < schedule.length - 1; i++) {
        expect(schedule[i].couponPayment).toBe(0);
        expect(schedule[i].cumulativeInterest).toBe(0);
        expect(schedule[i].remainingPrincipal).toBe(1000);
      }
      const last = schedule[schedule.length - 1];
      expect(last.couponPayment).toBe(1000); // redemption only
      expect(last.cumulativeInterest).toBe(0);
      expect(last.remainingPrincipal).toBe(0);
    });
  });

  describe('calculateTotalCouponInterest', () => {
    it('1 year annual 5% 1000 => 50', () => {
      expect(calculateTotalCouponInterest(1000, 5, 1, 'annual')).toBe(50);
    });
    it('2 year semi-annual 6% 1000 => 120', () => {
      expect(calculateTotalCouponInterest(1000, 6, 2, 'semi-annual')).toBe(120);
    });
  });

  describe('calculateTotalInterestEarned', () => {
    it('par bond 1yr annual 5% price=1000 => 50', () => {
      expect(calculateTotalInterestEarned(1000, 5, 1000, 1, 'annual')).toBe(50);
    });

    it('premium bond 1yr annual 5% price=1050 => 0', () => {
      expect(calculateTotalInterestEarned(1000, 5, 1050, 1, 'annual')).toBe(0);
    });

    it('discount bond 1yr annual 5% price=950 => 100', () => {
      expect(calculateTotalInterestEarned(1000, 5, 950, 1, 'annual')).toBe(100);
    });

    it('zero-coupon 5yr price=620.92 => face-price', () => {
      expect(calculateTotalInterestEarned(1000, 0, 620.92, 5, 'annual')).toBeCloseTo(379.08, 2);
    });
  });

  describe('detectPremiumDiscount', () => {
    it('price > face => premium', () => {
      expect(detectPremiumDiscount(1050, 1000)).toBe('premium');
    });
    it('price < face => discount', () => {
      expect(detectPremiumDiscount(950, 1000)).toBe('discount');
    });
    it('price ≈ face => par', () => {
      expect(detectPremiumDiscount(1000, 1000)).toBe('par');
    });
  });

  describe('buildBondCashFlows', () => {
    it('returns one row for 1 year annual', () => {
      const schedule = buildBondCashFlows(1000, 5, 1, 'annual');
      expect(schedule).toHaveLength(1);
      expect(schedule[0].period).toBe(1);
      expect(schedule[0].couponPayment).toBe(1050);
      expect(schedule[0].cumulativeInterest).toBe(50);
      expect(schedule[0].remainingPrincipal).toBe(0);
    });
    it('semi-annual 2 years has 4 periods', () => {
      const schedule = buildBondCashFlows(1000, 6, 2, 'semi-annual');
      expect(schedule).toHaveLength(4);
      expect(schedule[3].couponPayment).toBe(1030);
      expect(schedule[3].cumulativeInterest).toBe(120);
    });
  });
});
