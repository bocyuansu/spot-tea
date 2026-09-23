import { describe, expect, it } from 'vitest';

import { resetPasswordSchema } from './reset-password';

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords on confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'password123',
      confirmPassword: 'password456',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});
