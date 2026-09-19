import { describe, expect, it } from 'vitest';
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  calculateShippingFee,
  getAmountToFreeShipping,
} from './shipping';

describe('calculateShippingFee', () => {
  it('charges the flat fee below the threshold', () => {
    expect(calculateShippingFee(1)).toBe(SHIPPING_FEE);
    expect(calculateShippingFee(680)).toBe(SHIPPING_FEE);
    expect(calculateShippingFee(FREE_SHIPPING_THRESHOLD - 1)).toBe(SHIPPING_FEE);
  });

  it('is free at and above the threshold', () => {
    expect(calculateShippingFee(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(calculateShippingFee(FREE_SHIPPING_THRESHOLD + 1)).toBe(0);
    expect(calculateShippingFee(99999)).toBe(0);
  });

  it('charges nothing for an empty cart', () => {
    expect(calculateShippingFee(0)).toBe(0);
    expect(calculateShippingFee(-100)).toBe(0);
  });
});

describe('getAmountToFreeShipping', () => {
  it('returns the remaining amount below the threshold', () => {
    expect(getAmountToFreeShipping(680)).toBe(FREE_SHIPPING_THRESHOLD - 680);
    expect(getAmountToFreeShipping(0)).toBe(FREE_SHIPPING_THRESHOLD);
  });

  it('returns 0 once the threshold is reached', () => {
    expect(getAmountToFreeShipping(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(getAmountToFreeShipping(99999)).toBe(0);
  });
});
