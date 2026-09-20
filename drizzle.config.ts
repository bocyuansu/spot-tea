import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { postgresEnv } from './env';

config({ path: '.env.local', override: true });

export default defineConfig({
  out: './drizzle',
  schema: './db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: postgresEnv().databaseUrlUnpooled,
  },
});
