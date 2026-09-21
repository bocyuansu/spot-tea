import { describe, expect, it } from 'vitest';
import {
  getPreviousStatuses,
  isAwaitingPrepayment,
  isAwaitingRefund,
  orderStatusTransitions,
  paymentStatusTransitions,
} from './order-status';

describe('getPreviousStatuses', () => {
  it('finds every status that can move to the target', () => {
    expect(getPreviousStatuses(orderStatusTransitions, 'processing')).toEqual(['pending']);
    expect(getPreviousStatuses(orderStatusTransitions, 'cancelled')).toEqual([
      'pending',
      'processing',
    ]);
    expect(getPreviousStatuses(paymentStatusTransitions, 'paid')).toEqual(['unpaid', 'failed']);
    expect(getPreviousStatuses(paymentStatusTransitions, 'refunded')).toEqual(['paid']);
  });

  it('never lets anything move back to a starting status', () => {
    expect(getPreviousStatuses(orderStatusTransitions, 'pending')).toEqual([]);
    expect(getPreviousStatuses(paymentStatusTransitions, 'unpaid')).toEqual([]);
    expect(getPreviousStatuses(paymentStatusTransitions, 'failed')).toEqual([]);
  });

  it('does not allow cancelling once the order has shipped', () => {
    expect(getPreviousStatuses(orderStatusTransitions, 'cancelled')).not.toContain('shipped');
  });
});

describe('isAwaitingPrepayment', () => {
  it('holds credit card and bank transfer orders until they are paid', () => {
    expect(isAwaitingPrepayment({ paymentProvider: 'ecpay', paymentStatus: 'unpaid' })).toBe(true);
    expect(
      isAwaitingPrepayment({ paymentProvider: 'bank_transfer', paymentStatus: 'failed' }),
    ).toBe(true);
    expect(isAwaitingPrepayment({ paymentProvider: 'ecpay', paymentStatus: 'paid' })).toBe(false);
  });

  it('lets cash on delivery orders be prepared before payment', () => {
    expect(isAwaitingPrepayment({ paymentProvider: 'cod', paymentStatus: 'unpaid' })).toBe(false);
  });

  it('treats a missing payment provider as prepaid', () => {
    expect(isAwaitingPrepayment({ paymentProvider: null, paymentStatus: 'unpaid' })).toBe(true);
  });
});

describe('isAwaitingRefund', () => {
  it('flags a cancelled order that has been paid', () => {
    expect(isAwaitingRefund({ status: 'cancelled', paymentStatus: 'paid' })).toBe(true);
  });

  it('ignores cancelled orders that were never paid or already refunded', () => {
    expect(isAwaitingRefund({ status: 'cancelled', paymentStatus: 'unpaid' })).toBe(false);
    expect(isAwaitingRefund({ status: 'cancelled', paymentStatus: 'refunded' })).toBe(false);
  });

  it('ignores paid orders that are still going ahead', () => {
    expect(isAwaitingRefund({ status: 'processing', paymentStatus: 'paid' })).toBe(false);
  });
});
