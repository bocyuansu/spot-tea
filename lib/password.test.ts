import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('hashPassword', () => {
  it('produces a self-describing pbkdf2 hash', async () => {
    const [algorithm, iterations, salt, key] = (
      await hashPassword('secret123')
    ).split('$');

    expect(algorithm).toBe('pbkdf2_sha256');
    expect(iterations).toBe('100000');
    expect(salt).toMatch(/^[0-9a-f]{32}$/); // 16 bytes
    expect(key).toMatch(/^[0-9a-f]{64}$/); // 256 bits
  });

  it('salts every hash, so the same password hashes differently', async () => {
    const [first, second] = await Promise.all([
      hashPassword('secret123'),
      hashPassword('secret123'),
    ]);

    expect(first).not.toBe(second);
  });
});

describe('verifyPassword', () => {
  it('accepts the right password and rejects the wrong one', async () => {
    const hash = await hashPassword('secret123');

    expect(await verifyPassword({ hash, password: 'secret123' })).toBe(true);
    expect(await verifyPassword({ hash, password: 'secret124' })).toBe(false);
  });

  it('matches across Unicode normalisation forms', async () => {
    // 同一個 "é"：先組合字元，再拆成 e + combining acute accent
    const hash = await hashPassword('cafépass');

    expect(await verifyPassword({ hash, password: 'cafépass' })).toBe(true);
  });

  it('returns false for a hash it cannot read instead of throwing', async () => {
    const legacyScrypt = `${'a'.repeat(32)}:${'b'.repeat(128)}`;

    expect(await verifyPassword({ hash: '', password: 'secret123' })).toBe(
      false,
    );
    expect(
      await verifyPassword({ hash: legacyScrypt, password: 'secret123' }),
    ).toBe(false);
  });
});
