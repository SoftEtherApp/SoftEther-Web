import { Hono } from "hono";

// ASSETS binding is auto-injected by Cloudflare when assets.directory is set in wrangler.json
interface AppEnv extends Env {
	ASSETS: { fetch: (req: Request) => Promise<Response> };
}

const app = new Hono<{ Bindings: AppEnv }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

/* SPA fallback: serve static files, fall back to /index.html for client-side routes */
app.get("*", async (c) => {
	try {
		const resp = await c.env.ASSETS.fetch(c.req.raw);
		if (resp.status === 404) {
			return c.env.ASSETS.fetch(new Request(new URL("/index.html", c.req.url), c.req.raw));
		}
		return resp;
	} catch {
		return c.env.ASSETS.fetch(new Request(new URL("/index.html", c.req.url), c.req.raw));
	}
});

export default app;
