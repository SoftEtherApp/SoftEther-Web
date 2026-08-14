import { defineConfig } from "drizzle-kit";

// Used for `drizzle-kit generate` only — it diffs the schema and writes
// plain SQL migrations to ./drizzle. Apply them to D1 with wrangler:
//
//   wrangler d1 migrations apply softether-app --local
//   wrangler d1 migrations apply softether-app --remote
export default defineConfig({
	out: "./drizzle",
	schema: "./src/worker/db/schema.ts",
	dialect: "sqlite",
});
