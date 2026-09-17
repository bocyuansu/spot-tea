import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from 'dotenv';
import { Client } from 'pg';
import { category, product, productVariant } from './schema/shop';
import { seedCategories, seedProducts } from './seed-data';

// 加入 override: true 強制覆蓋已經被外部工具注入的環境變數
config({ path: '.env.local', override: true });

const main = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    // 和 Neon 建立連線
    await client.connect();

    const db = drizzle({ client });

    // 以 slug / sku 這類自然鍵做 upsert，讓 seed 可以重複執行而不會產生重複資料
    const insertedCategories = await db
      .insert(category)
      .values(seedCategories)
      .onConflictDoUpdate({
        target: category.slug,
        set: { name: sql`excluded.name` },
      })
      .returning({ id: category.id, slug: category.slug });

    const categoryIdBySlug = new Map(insertedCategories.map((row) => [row.slug, row.id]));

    for (const seedProduct of seedProducts) {
      const categoryId = categoryIdBySlug.get(seedProduct.categorySlug);

      if (!categoryId) {
        throw new Error(`找不到分類 ${seedProduct.categorySlug}，請確認 seed 資料`);
      }

      const [insertedProduct] = await db
        .insert(product)
        .values({
          categoryId,
          name: seedProduct.name,
          slug: seedProduct.slug,
          description: seedProduct.description,
          images: seedProduct.images,
          status: seedProduct.status,
          origin: seedProduct.origin,
        })
        .onConflictDoUpdate({
          target: product.slug,
          set: {
            categoryId,
            name: seedProduct.name,
            description: seedProduct.description,
            images: seedProduct.images,
            status: seedProduct.status,
            origin: seedProduct.origin,
            updatedAt: new Date(),
          },
        })
        .returning({ id: product.id });

      await db
        .insert(productVariant)
        .values(
          seedProduct.variants.map((variant) => ({
            productId: insertedProduct.id,
            weightGrams: variant.weightGrams,
            label: variant.label,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          })),
        )
        .onConflictDoUpdate({
          target: productVariant.sku,
          set: {
            productId: sql`excluded.product_id`,
            weightGrams: sql`excluded.weight_grams`,
            label: sql`excluded.label`,
            price: sql`excluded.price`,
            stock: sql`excluded.stock`,
            updatedAt: new Date(),
          },
        });
    }

    console.log(
      `Seed completed: ${seedCategories.length} categories, ${seedProducts.length} products`,
    );
  } catch (error) {
    console.error('Error during seed:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

main();
