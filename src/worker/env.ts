/* ════════════════════════════════════
   Worker bindings — extends the generated Env (worker-configuration.d.ts)
   with the app-level interface shared by index.ts and api routes.
   Kept in its own module so routes can type Bindings without a
   circular import through index.ts.
   ════════════════════════════════════ */

export interface AppEnv extends Env {
	RELEASES: R2Bucket;
	RELEASE_META: KVNamespace;
	DB: D1Database;
	WEBHOOK_SECRET: string;
	ENVIRONMENT?: string;
	SMTP_HOST?: string;
	SMTP_PORT?: string;
	SMTP_USER?: string;
	SMTP_PASS?: string;
	EMAIL_FROM?: string;
}
