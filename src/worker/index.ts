import { Hono } from "hono";

// ASSETS binding is auto-injected by Cloudflare when assets.directory is set in wrangler.json
interface AppEnv extends Env {
	ASSETS: { fetch: (req: Request) => Promise<Response> };
}

const app = new Hono<{ Bindings: AppEnv }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

/* SPA fallback: serve static assets for all non-API routes */
app.get("*", async (c) => {
	try {
		return await c.env.ASSETS.fetch(c.req.raw);
	} catch {
		return c.notFound();
	}
});

export default app;
