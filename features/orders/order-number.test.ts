import { describe, expect, it } from 'vitest';
import {
  buildOrderNumber,
  formatOrderDateStamp,
  nextOrderSequence,
} from './order-number';

describe('formatOrderDateStamp', () => {
  it('formats the date as YYYYMMDD', () => {
    expect(formatOrderDateStamp(new Date('2026-09-19T04:00:00Z'))).toBe(
      '20260919',
    );
  });

  it('uses the Taipei date, not the runtime timezone', () => {
    // 台北時間 2026-09-20 00:30，UTC 還在 09-19
    expect(formatOrderDateStamp(new Date('2026-09-19T16:30:00Z'))).toBe(
      '20260920',
    );
    // 台北時間 2026-09-19 07:59，UTC 還在前一天
    expect(formatOrderDateStamp(new Date('2026-09-18T23:59:00Z'))).toBe(
      '20260919',
    );
  });
});

describe('buildOrderNumber', () => {
  it('pads the sequence to four digits', () => {
    expect(buildOrderNumber('20260919', 1)).toBe('ST-20260919-0001');
    expect(buildOrderNumber('20260919', 42)).toBe('ST-20260919-0042');
    expect(buildOrderNumber('20260919', 9999)).toBe('ST-20260919-9999');
  });
});

describe('nextOrderSequence', () => {
  it('starts at 1 when there is no order for the day', () => {
    expect(nextOrderSequence(undefined)).toBe(1);
  });

  it('increments the trailing sequence', () => {
    expect(nextOrderSequence('ST-20260919-0001')).toBe(2);
    expect(nextOrderSequence('ST-20260919-0041')).toBe(42);
  });

  it('falls back to 1 when the order number is malformed', () => {
    expect(nextOrderSequence('ST-20260919-abcd')).toBe(1);
    expect(nextOrderSequence('ST-20260919-0000')).toBe(1);
    expect(nextOrderSequence('')).toBe(1);
  });
});
