import { describe, expect, it } from 'vitest';
import { changePasswordSchema } from './password';

const validInput = {
  currentPassword: 'oldpassword',
  newPassword: 'newpassword',
  confirmPassword: 'newpassword',
};

describe('changePasswordSchema', () => {
  it('accepts a valid password change', () => {
    const result = changePasswordSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it('reports the mismatch on the confirmation field', () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      confirmPassword: 'anotherpassword',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });

  it('rejects reusing the current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'samepassword',
      newPassword: 'samepassword',
      confirmPassword: 'samepassword',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['newPassword']);
  });
});
