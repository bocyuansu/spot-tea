import { describe, expect, it } from 'vitest';
import {
  getPaymentSteps,
  getPreviousStatuses,
  isAwaitingPrepayment,
  isAwaitingRefund,
  isCancellable,
  orderStatusTransitions,
  paymentStatusTransitions,
} from './order-status';

describe('getPreviousStatuses', () => {
  it('finds every status that can move to the target', () => {
    expect(getPreviousStatuses(orderStatusTransitions, 'processing')).toEqual([
      'pending',
    ]);
    expect(getPreviousStatuses(orderStatusTransitions, 'cancelled')).toEqual([
      'pending',
      'processing',
    ]);
    expect(getPreviousStatuses(paymentStatusTransitions, 'paid')).toEqual([
      'unpaid',
      'failed',
    ]);
    expect(getPreviousStatuses(paymentStatusTransitions, 'refunded')).toEqual([
      'paid',
    ]);
  });

  it('never lets anything move back to a starting status', () => {
    expect(getPreviousStatuses(orderStatusTransitions, 'pending')).toEqual([]);
    expect(getPreviousStatuses(paymentStatusTransitions, 'unpaid')).toEqual([]);
    expect(getPreviousStatuses(paymentStatusTransitions, 'failed')).toEqual([]);
  });

  it('does not allow cancelling once the order has shipped', () => {
    expect(
      getPreviousStatuses(orderStatusTransitions, 'cancelled'),
    ).not.toContain('shipped');
  });
});

describe('isCancellable', () => {
  it('lets the customer cancel before the order ships', () => {
    expect(isCancellable({ status: 'pending' })).toBe(true);
    expect(isCancellable({ status: 'processing' })).toBe(true);
  });

  it('does not allow cancelling a shipped, completed or already cancelled order', () => {
    expect(isCancellable({ status: 'shipped' })).toBe(false);
    expect(isCancellable({ status: 'completed' })).toBe(false);
    expect(isCancellable({ status: 'cancelled' })).toBe(false);
  });
});

describe('getPaymentSteps', () => {
  it('lets an unpaid order that is still going ahead be marked as paid', () => {
    expect(
      getPaymentSteps({ status: 'pending', paymentStatus: 'unpaid' }),
    ).toEqual(['paid']);
    expect(
      getPaymentSteps({ status: 'shipped', paymentStatus: 'failed' }),
    ).toEqual(['paid']);
  });

  it('does not allow marking a cancelled order as paid', () => {
    expect(
      getPaymentSteps({ status: 'cancelled', paymentStatus: 'unpaid' }),
    ).toEqual([]);
    expect(
      getPaymentSteps({ status: 'cancelled', paymentStatus: 'failed' }),
    ).toEqual([]);
  });

  it('still lets a cancelled order that was paid be refunded', () => {
    expect(
      getPaymentSteps({ status: 'cancelled', paymentStatus: 'paid' }),
    ).toEqual(['refunded']);
  });
});

describe('isAwaitingPrepayment', () => {
  it('holds credit card and bank transfer orders until they are paid', () => {
    expect(
      isAwaitingPrepayment({
        paymentProvider: 'ecpay',
        paymentStatus: 'unpaid',
      }),
    ).toBe(true);
    expect(
      isAwaitingPrepayment({
        paymentProvider: 'bank_transfer',
        paymentStatus: 'failed',
      }),
    ).toBe(true);
    expect(
      isAwaitingPrepayment({ paymentProvider: 'ecpay', paymentStatus: 'paid' }),
    ).toBe(false);
  });

  it('lets cash on delivery orders be prepared before payment', () => {
    expect(
      isAwaitingPrepayment({ paymentProvider: 'cod', paymentStatus: 'unpaid' }),
    ).toBe(false);
  });

  it('treats a missing payment provider as prepaid', () => {
    expect(
      isAwaitingPrepayment({ paymentProvider: null, paymentStatus: 'unpaid' }),
    ).toBe(true);
  });
});

describe('isAwaitingRefund', () => {
  it('flags a cancelled order that has been paid', () => {
    expect(
      isAwaitingRefund({ status: 'cancelled', paymentStatus: 'paid' }),
    ).toBe(true);
  });

  it('ignores cancelled orders that were never paid or already refunded', () => {
    expect(
      isAwaitingRefund({ status: 'cancelled', paymentStatus: 'unpaid' }),
    ).toBe(false);
    expect(
      isAwaitingRefund({ status: 'cancelled', paymentStatus: 'refunded' }),
    ).toBe(false);
  });

  it('ignores paid orders that are still going ahead', () => {
    expect(
      isAwaitingRefund({ status: 'processing', paymentStatus: 'paid' }),
    ).toBe(false);
  });
});
