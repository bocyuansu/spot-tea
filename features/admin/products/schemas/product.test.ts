import { describe, expect, it } from 'vitest';
import {
  UNCATEGORIZED,
  emptyProductVariant,
  productFormSchema,
  type ProductFormValues,
} from './product';

function createFormValues(
  overrides: Partial<ProductFormValues> = {},
): ProductFormValues {
  return {
    name: '凍頂烏龍茶',
    slug: 'dong-ding-oolong',
    categoryId: UNCATEGORIZED,
    status: 'draft',
    origin: '',
    description: '',
    images: [],
    variants: [{ ...emptyProductVariant, sku: 'DD-150' }],
    ...overrides,
  };
}

// slug 直接進商品網址 /products/[slug]
describe('productFormSchema slug', () => {
  it('accepts lowercase words joined by single hyphens', () => {
    expect(productFormSchema.safeParse(createFormValues()).success).toBe(true);
    expect(
      productFormSchema.safeParse(createFormValues({ slug: 'oolong2026' }))
        .success,
    ).toBe(true);
  });

  it.each([
    'Dong-Ding',
    'dong ding',
    'dong--ding',
    '-oolong',
    'oolong-',
    '凍頂',
  ])('rejects %s', (slug) => {
    expect(
      productFormSchema.safeParse(createFormValues({ slug })).success,
    ).toBe(false);
  });
});
