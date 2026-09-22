import { describe, expect, it } from 'vitest';
import {
  buildItemName,
  buildMerchantTradeNo,
  ecpayUrlEncode,
  formatMerchantTradeDate,
  generateCheckMacValue,
  verifyCheckMacValue,
} from './ecpay';

// 綠界公開的測試帳號與官方測試向量（.claude/skills/ecpay/test-vectors/checkmacvalue.json）
const HASH_KEY = 'pwFHCqoQZGmho4w6';
const HASH_IV = 'EkRm7iFT261dpevs';

describe('ecpayUrlEncode', () => {
  it('matches PHP urlencode + strtolower + .NET replacements', () => {
    expect(ecpayUrlEncode("a b~c'd!*()-_.")).toBe('a+b%7ec%27d!*()-_.');
  });
});

describe('generateCheckMacValue', () => {
  it('matches the official AIO SHA256 vector', async () => {
    const params = {
      MerchantID: '3002607',
      MerchantTradeNo: 'Test1234567890',
      MerchantTradeDate: '2025/01/01 12:00:00',
      PaymentType: 'aio',
      TotalAmount: '100',
      TradeDesc: '測試',
      ItemName: '測試商品',
      ReturnURL: 'https://example.com/notify',
      ChoosePayment: 'ALL',
      EncryptType: '1',
    };

    expect(await generateCheckMacValue(params, HASH_KEY, HASH_IV)).toBe(
      '291CBA324D31FB5A4BBBFDF2CFE5D32598524753AFD4959C3BF590C5B2F57FB2',
    );
  });

  it.each([
    [
      "Tom's Shop",
      '100',
      'CF0A3D4901D99459D8641516EC57210700E8A5C9AB26B1D021301E9CB93EF78D',
    ],
    [
      'Test~Product',
      '200',
      'CEEAE01D2F9A8E74D4AC0DCE7735B046D73F35A5EC99558A31A2EE03159DA1C9',
    ],
    [
      'My Test Product',
      '300',
      '7712A5E6EDC3B57086063C88568084C66CE882A21D40E74DE5ACA3B478C6F316',
    ],
  ])(
    'handles special characters in %s',
    async (itemName, totalAmount, expected) => {
      const params = {
        MerchantID: '3002607',
        ItemName: itemName,
        TotalAmount: totalAmount,
      };

      expect(await generateCheckMacValue(params, HASH_KEY, HASH_IV)).toBe(
        expected,
      );
    },
  );
});

describe('verifyCheckMacValue', () => {
  const params = {
    MerchantID: '3002607',
    ItemName: 'My Test Product',
    TotalAmount: '300',
  };
  const checkMacValue =
    '7712A5E6EDC3B57086063C88568084C66CE882A21D40E74DE5ACA3B478C6F316';

  it('accepts a matching value regardless of case', async () => {
    await expect(
      verifyCheckMacValue(
        { ...params, CheckMacValue: checkMacValue.toLowerCase() },
        HASH_KEY,
        HASH_IV,
      ),
    ).resolves.toBe(true);
  });

  it('rejects tampered params', async () => {
    await expect(
      verifyCheckMacValue(
        { ...params, TotalAmount: '1', CheckMacValue: checkMacValue },
        HASH_KEY,
        HASH_IV,
      ),
    ).resolves.toBe(false);
  });

  it('rejects a missing value', async () => {
    await expect(verifyCheckMacValue(params, HASH_KEY, HASH_IV)).resolves.toBe(
      false,
    );
  });
});

describe('buildMerchantTradeNo', () => {
  it('fills 20 alphanumeric characters starting with the order number', () => {
    const tradeNo = buildMerchantTradeNo('ST-20260921-0001');

    expect(tradeNo).toMatch(/^ST202609210001[A-Z0-9]{6}$/);
  });

  it('never exceeds 20 characters', () => {
    expect(buildMerchantTradeNo('ST-20260921-123456789')).toHaveLength(20);
  });

  it('differs between attempts so a failed payment can be retried', () => {
    expect(buildMerchantTradeNo('ST-20260921-0001')).not.toBe(
      buildMerchantTradeNo('ST-20260921-0001'),
    );
  });
});

describe('formatMerchantTradeDate', () => {
  it('formats in Taipei time', () => {
    // UTC 2026-09-20 16:05:09 = 台北 2026-09-21 00:05:09
    expect(formatMerchantTradeDate(new Date('2026-09-20T16:05:09Z'))).toBe(
      '2026/09/21 00:05:09',
    );
  });
});

describe('buildItemName', () => {
  it('joins items with # and strips characters ECPay rejects', () => {
    expect(
      buildItemName([
        { productName: '凍頂#烏龍', variantName: '150g', quantity: 2 },
        { productName: '<b>東方美人</b>', variantName: '禮盒', quantity: 1 },
      ]),
    ).toBe('凍頂烏龍 150g x2#b東方美人/b 禮盒 x1');
  });

  it('truncates to 200 characters without splitting a character', () => {
    const itemName = buildItemName([
      { productName: '茶'.repeat(300), variantName: '', quantity: 1 },
    ]);

    expect(Array.from(itemName)).toHaveLength(200);
  });
});
