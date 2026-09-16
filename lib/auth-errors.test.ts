import { describe, expect, it } from 'vitest';

import { getErrorMessage } from './auth-errors';

describe('getErrorMessage', () => {
  it('returns the localized message for a known error code', () => {
    expect(getErrorMessage('INVALID_EMAIL_OR_PASSWORD', 'zh')).toBe('電子信箱或密碼錯誤 !');
    expect(getErrorMessage('INVALID_EMAIL_OR_PASSWORD', 'en')).toBe('Invalid email or password');
  });

  it('returns the fallback message for an unknown error code', () => {
    expect(getErrorMessage('UNKNOWN_ERROR', 'zh')).toBe('發生未知的錯誤。(未定義的錯誤訊息)');
  });
});
