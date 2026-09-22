import { describe, expect, it } from 'vitest';
import { getSafeRedirectPath } from './safe-redirect';

describe('getSafeRedirectPath', () => {
  it('keeps same-site paths, including the query string', () => {
    expect(getSafeRedirectPath('/checkout')).toBe('/checkout');
    expect(getSafeRedirectPath('/user/orders?page=2')).toBe(
      '/user/orders?page=2',
    );
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

  // URL parser 會先刪掉 tab 與換行，這些字串解析後都會變成 //evil.example
  it('rejects paths that only become another site once tabs or newlines are stripped', () => {
    expect(getSafeRedirectPath('/\t/evil.example')).toBe('/');
    expect(getSafeRedirectPath('/\n/evil.example')).toBe('/');
    expect(getSafeRedirectPath('/\r\n/evil.example')).toBe('/');
    expect(getSafeRedirectPath('/\t\\evil.example')).toBe('/');
  });

  it('keeps the hash of a same-site path', () => {
    expect(getSafeRedirectPath('/products?category=oolong#top')).toBe(
      '/products?category=oolong#top',
    );
  });
});
