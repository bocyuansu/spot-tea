import { describe, expect, it } from 'vitest';
import { avatarMaxBytes, avatarUploadSchema } from './avatar';

describe('avatarUploadSchema', () => {
  it('accepts a supported image within the size limit', () => {
    const result = avatarUploadSchema.safeParse({
      contentType: 'image/png',
      size: 1024,
    });

    expect(result.success).toBe(true);
  });

  it('rejects unsupported content types', () => {
    const result = avatarUploadSchema.safeParse({
      contentType: 'image/gif',
      size: 1024,
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty or oversized files', () => {
    expect(
      avatarUploadSchema.safeParse({ contentType: 'image/jpeg', size: 0 })
        .success,
    ).toBe(false);
    expect(
      avatarUploadSchema.safeParse({
        contentType: 'image/jpeg',
        size: avatarMaxBytes + 1,
      }).success,
    ).toBe(false);
  });
});
