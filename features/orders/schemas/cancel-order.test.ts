import { describe, expect, it } from 'vitest';
import { cancelOrderSchema } from './cancel-order';

describe('cancelOrderSchema', () => {
  it('accepts a reason and trims the surrounding whitespace', () => {
    const result = cancelOrderSchema.safeParse({ reason: '  重複下單  ' });

    expect(result.success).toBe(true);
    expect(result.data?.reason).toBe('重複下單');
  });

  it('rejects an empty or whitespace-only reason', () => {
    expect(cancelOrderSchema.safeParse({ reason: '' }).success).toBe(false);
    expect(cancelOrderSchema.safeParse({ reason: '   ' }).success).toBe(false);
  });

  it('rejects a reason longer than 200 characters', () => {
    expect(
      cancelOrderSchema.safeParse({ reason: '茶'.repeat(200) }).success,
    ).toBe(true);
    expect(
      cancelOrderSchema.safeParse({ reason: '茶'.repeat(201) }).success,
    ).toBe(false);
  });
});
