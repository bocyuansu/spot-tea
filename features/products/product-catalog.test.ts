import { describe, expect, it } from 'vitest';
import { getProductsHref, paginate, searchProducts } from './product-catalog';

const products = [
  { name: '凍頂烏龍茶', origin: '南投鹿谷', category: { name: '烏龍茶' } },
  { name: '東方美人茶', origin: '新竹北埔', category: { name: '烏龍茶' } },
  { name: '日月潭紅玉', origin: '南投魚池', category: { name: '紅茶' } },
  { name: 'GABA 佳葉龍茶', origin: null, category: null },
];

describe('searchProducts', () => {
  it('returns every product for a blank query', () => {
    expect(searchProducts(products, '')).toBe(products);
    expect(searchProducts(products, '   ')).toBe(products);
  });

  it('matches the name, origin and category shown on the card', () => {
    expect(searchProducts(products, '美人').map((p) => p.name)).toEqual([
      '東方美人茶',
    ]);
    expect(searchProducts(products, '南投').map((p) => p.name)).toEqual([
      '凍頂烏龍茶',
      '日月潭紅玉',
    ]);
    expect(searchProducts(products, '紅茶').map((p) => p.name)).toEqual([
      '日月潭紅玉',
    ]);
  });

  it('ignores case and full-width characters', () => {
    expect(searchProducts(products, 'gaba')).toHaveLength(1);
    expect(searchProducts(products, 'ＧＡＢＡ')).toHaveLength(1);
  });

  it('returns nothing when no field matches', () => {
    expect(searchProducts(products, '咖啡')).toEqual([]);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, index) => index);

  it('slices the requested page', () => {
    const result = paginate(items, 2, 10);

    expect(result.items).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('falls back to the first page for invalid page numbers', () => {
    expect(paginate(items, Number.NaN, 10).page).toBe(1);
    expect(paginate(items, 1.5, 10).page).toBe(1);
    expect(paginate(items, 0, 10).page).toBe(1);
    expect(paginate(items, -3, 10).page).toBe(1);
  });

  it('stays on the last page when the page is out of range', () => {
    const result = paginate(items, 99, 10);

    expect(result.page).toBe(3);
    expect(result.items).toEqual([20, 21, 22, 23, 24]);
  });

  it('counts an empty list as a single page', () => {
    expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, totalPages: 1 });
  });
});

describe('getProductsHref', () => {
  it('omits empty params and the first page', () => {
    expect(getProductsHref({})).toBe('/products');
    expect(getProductsHref({ query: '', page: 1 })).toBe('/products');
  });

  it('keeps the category, query and page together', () => {
    expect(
      getProductsHref({ category: 'oolong', query: '南投', page: 2 }),
    ).toBe('/products?category=oolong&q=%E5%8D%97%E6%8A%95&page=2');
  });
});
