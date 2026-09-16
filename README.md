# vinext app

This project was created with create-vinext-app.

## Neon, Hyperdrive, and Drizzle

1. Create a Neon database and copy its direct, non-pooled connection string into `.env` as `DATABASE_URL`.
2. Create the Hyperdrive configuration with the same direct connection string:

   ```sh
   pnpm wrangler hyperdrive create spot-tea-neon --connection-string="$DATABASE_URL"
   ```

3. Replace `<your-hyperdrive-id-here>` in `wrangler.jsonc` with the returned Hyperdrive ID.
4. Generate and apply the initial Drizzle migration:

   ```sh
   pnpm db:generate
   pnpm db:migrate
   ```

5. Refresh the Cloudflare binding types and run the app:

   ```sh
   pnpm cf-typegen
   pnpm dev
   ```

Hyperdrive manages connection pooling in production. The Worker creates a short-lived `pg` client per request using `env.HYPERDRIVE.connectionString`; do not use Neon's `-pooler` hostname for the Hyperdrive origin.

## Scripts

- `pnpm run dev` starts the vinext dev server.
- `pnpm run build` builds the Cloudflare Worker output.
- `pnpm run start` starts the built Worker locally with Wrangler.
- `pnpm run deploy` deploys the Cloudflare Worker.
- `pnpm run db:generate` generates SQL migrations from `db/schema.ts`.
- `pnpm run db:migrate` applies pending migrations using `DATABASE_URL`.
- `pnpm run cf-typegen` refreshes the Cloudflare binding types.
