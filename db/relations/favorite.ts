import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '@/db/schema';

export const favoriteRelations = defineRelationsPart(schema, (r) => ({
  favorite: {
    product: r.one.product({
      from: r.favorite.productId,
      to: r.product.id,
      optional: false,
    }),
  },
}));
