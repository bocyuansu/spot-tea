import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from 'dotenv';
import { Client } from 'pg';

import { seedCategories, seedOrderUserEmail, seedOrders, seedProducts } from './seed-data';
import { category, order, orderItem, product, productVariant, user } from './schema';

// 加入 override: true 強制覆蓋已經被外部工具注入的環境變數
config({ path: '.env.local', override: true });

const main = async () => {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });

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

    const [orderUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, seedOrderUserEmail));

    let seededOrderCount = 0;

    // 使用者是註冊出來的、不歸 seed 管，所以找不到人時只跳過訂單，不讓整個 seed 失敗
    if (!orderUser) {
      console.warn(`找不到使用者 ${seedOrderUserEmail}，已跳過訂單 seed`);
    } else {
      // 訂單要記下單當時的品名與售價，所以先把商品規格的快照資料撈出來
      const variantRows = await db
        .select({
          id: productVariant.id,
          sku: productVariant.sku,
          price: productVariant.price,
          label: productVariant.label,
          weightGrams: productVariant.weightGrams,
          productName: product.name,
        })
        .from(productVariant)
        .innerJoin(product, eq(product.id, productVariant.productId));

      const variantBySku = new Map(variantRows.map((row) => [row.sku, row]));

      for (const seedOrder of seedOrders) {
        const items = seedOrder.items.map((item) => {
          const variant = variantBySku.get(item.sku);

          if (!variant) {
            throw new Error(`找不到規格 ${item.sku}，請確認 seed 資料`);
          }

          return {
            productVariantId: variant.id,
            productName: variant.productName,
            variantName: variant.label ?? `${variant.weightGrams}g`,
            unitPrice: variant.price,
            quantity: item.quantity,
            subtotal: variant.price * item.quantity,
          };
        });

        const subtotalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

        const [insertedOrder] = await db
          .insert(order)
          .values({
            orderNumber: seedOrder.orderNumber,
            userId: orderUser.id,
            status: seedOrder.status,
            paymentStatus: seedOrder.paymentStatus,
            paymentProvider: seedOrder.paymentProvider,
            paymentTransactionId: seedOrder.paymentTransactionId,
            subtotalAmount,
            shippingFee: seedOrder.shippingFee,
            totalAmount: subtotalAmount + seedOrder.shippingFee,
            shippingAddress: seedOrder.shippingAddress,
            note: seedOrder.note,
            createdAt: seedOrder.createdAt,
          })
          .onConflictDoUpdate({
            target: order.orderNumber,
            set: {
              userId: orderUser.id,
              status: seedOrder.status,
              paymentStatus: seedOrder.paymentStatus,
              paymentProvider: seedOrder.paymentProvider,
              paymentTransactionId: seedOrder.paymentTransactionId,
              subtotalAmount,
              shippingFee: seedOrder.shippingFee,
              totalAmount: subtotalAmount + seedOrder.shippingFee,
              shippingAddress: seedOrder.shippingAddress,
              note: seedOrder.note,
              createdAt: seedOrder.createdAt,
              updatedAt: new Date(),
            },
          })
          .returning({ id: order.id });

        // 訂單明細沒有自然鍵可以 upsert，重跑時整批換掉最單純
        await db.delete(orderItem).where(eq(orderItem.orderId, insertedOrder.id));
        await db
          .insert(orderItem)
          .values(items.map((item) => ({ orderId: insertedOrder.id, ...item })));

        seededOrderCount += 1;
      }
    }

    console.log(
      `Seed completed: ${seedCategories.length} categories, ${seedProducts.length} products, ${seededOrderCount} orders`,
    );
  } catch (error) {
    console.error('Error during seed:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

main();
