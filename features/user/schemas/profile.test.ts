import { describe, expect, it } from 'vitest';
import { updateProfileSchema } from './profile';

describe('updateProfileSchema', () => {
  it('accepts a valid name', () => {
    const result = updateProfileSchema.safeParse({ name: '找茶會員' });

    expect(result.success).toBe(true);
  });

  it('rejects names outside the length limits', () => {
    expect(updateProfileSchema.safeParse({ name: '找' }).success).toBe(false);
    expect(
      updateProfileSchema.safeParse({ name: '找'.repeat(21) }).success,
    ).toBe(false);
  });
});
