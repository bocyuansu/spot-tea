import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { config } from 'dotenv';
import { Client } from 'pg';

// 加入 override: true 強制覆蓋已經被外部工具注入的環境變數
config({ path: '.env.local', override: true });

const main = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    // 和 Neon 建立連線
    await client.connect();

    const db = drizzle({ client });

    await migrate(db, {
      migrationsFolder: './drizzle',
      migrationsSchema: 'public', // 使用 public Schema 記錄 migration 狀態
    });

    console.log('Migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

main();
