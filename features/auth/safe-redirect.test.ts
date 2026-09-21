import { describe, expect, it } from 'vitest';
import { getSafeRedirectPath } from './safe-redirect';

describe('getSafeRedirectPath', () => {
  it('keeps same-site paths, including the query string', () => {
    expect(getSafeRedirectPath('/checkout')).toBe('/checkout');
    expect(getSafeRedirectPath('/user/orders?page=2')).toBe('/user/orders?page=2');
  });

  it('falls back to the home page when there is nothing to return to', () => {
    expect(getSafeRedirectPath(undefined)).toBe('/');
    expect(getSafeRedirectPath('')).toBe('/');
  });

  it('rejects anything a browser would treat as another site', () => {
    expect(getSafeRedirectPath('https://evil.example')).toBe('/');
    expect(getSafeRedirectPath('//evil.example')).toBe('/');
    expect(getSafeRedirectPath('/\\evil.example')).toBe('/');
    expect(getSafeRedirectPath('checkout')).toBe('/');
  });
});
