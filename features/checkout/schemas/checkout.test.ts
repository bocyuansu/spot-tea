import { describe, expect, it } from 'vitest';
import { checkoutFormSchema, createOrderSchema, type CheckoutFormValues } from './checkout';

function createFormValues(overrides: Partial<CheckoutFormValues> = {}): CheckoutFormValues {
  return {
    recipientName: 'Cyuan Su',
    phone: '0912345678',
    postalCode: '106',
    city: '台北市',
    district: '大安區',
    addressLine: '信義路四段 1 號 8 樓',
    note: '',
    paymentMethod: 'cod',
    ...overrides,
  };
}

describe('checkoutFormSchema', () => {
  it('accepts a complete form', () => {
    expect(checkoutFormSchema.safeParse(createFormValues()).success).toBe(true);
  });

  it('accepts a 6 digit postal code', () => {
    expect(checkoutFormSchema.safeParse(createFormValues({ postalCode: '106001' })).success).toBe(
      true,
    );
  });

  it('rejects a phone number that is not a Taiwan mobile', () => {
    expect(checkoutFormSchema.safeParse(createFormValues({ phone: '0912' })).success).toBe(false);
    expect(checkoutFormSchema.safeParse(createFormValues({ phone: '0212345678' })).success).toBe(
      false,
    );
    expect(checkoutFormSchema.safeParse(createFormValues({ phone: '09123456789' })).success).toBe(
      false,
    );
  });

  it('rejects an empty required address field', () => {
    expect(checkoutFormSchema.safeParse(createFormValues({ city: '' })).success).toBe(false);
    expect(checkoutFormSchema.safeParse(createFormValues({ addressLine: '' })).success).toBe(false);
  });

  it('rejects an unknown payment method', () => {
    const values = createFormValues({ paymentMethod: 'credit_card' as 'cod' });

    expect(checkoutFormSchema.safeParse(values).success).toBe(false);
  });
});

describe('createOrderSchema', () => {
  it('accepts items alongside the form values', () => {
    const input = {
      ...createFormValues(),
      expectedTotal: 1480,
      items: [{ variantId: 'var-1', quantity: 2 }],
    };

    expect(createOrderSchema.safeParse(input).success).toBe(true);
  });

  it('rejects an empty cart', () => {
    const input = { ...createFormValues(), expectedTotal: 1480, items: [] };

    expect(createOrderSchema.safeParse(input).success).toBe(false);
  });

  it('rejects a duplicated variant', () => {
    const input = {
      ...createFormValues(),
      expectedTotal: 1480,
      items: [
        { variantId: 'var-1', quantity: 1 },
        { variantId: 'var-1', quantity: 1 },
      ],
    };

    expect(createOrderSchema.safeParse(input).success).toBe(false);
  });

  it('rejects a non positive or fractional quantity', () => {
    const zero = {
      ...createFormValues(),
      expectedTotal: 1480,
      items: [{ variantId: 'var-1', quantity: 0 }],
    };
    const fractional = {
      ...createFormValues(),
      expectedTotal: 1480,
      items: [{ variantId: 'var-1', quantity: 1.5 }],
    };

    expect(createOrderSchema.safeParse(zero).success).toBe(false);
    expect(createOrderSchema.safeParse(fractional).success).toBe(false);
  });

  it('requires the total the customer saw', () => {
    const input = { ...createFormValues(), items: [{ variantId: 'var-1', quantity: 2 }] };

    expect(createOrderSchema.safeParse(input).success).toBe(false);
  });
});
