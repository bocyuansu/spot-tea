import { describe, expect, it } from 'vitest';
import { signUpSchema } from './signup';

describe('signUpSchema', () => {
  it('accepts valid registration data', () => {
    const result = signUpSchema.safeParse({
      email: 'tea@example.com',
      name: '找茶會員',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      name: '找茶會員',
      password: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects names and passwords outside their length limits', () => {
    const result = signUpSchema.safeParse({
      email: 'tea@example.com',
      name: '找',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });
});
