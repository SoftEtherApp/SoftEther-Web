import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

/* SPA fallback: serve index.html for all non-API routes */
app.get("*", async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
