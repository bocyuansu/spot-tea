import { describe, expect, it } from 'vitest';

import { loginSchema } from './login';

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'tea@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'tea@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});
