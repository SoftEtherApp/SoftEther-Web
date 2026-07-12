import { Hono } from "hono";

/* ── Types ── */

interface AppEnv extends Env {
	ASSETS: { fetch: (req: Request) => Promise<Response> };
	RELEASES: R2Bucket;
	RELEASE_META: KVNamespace;
	WEBHOOK_SECRET: string;
}

interface ReleaseAsset {
	name: string;
	platform: string;
	size: number;
	r2Key: string;
	downloadUrl: string;
}

interface ReleaseMeta {
	tag: string;
	version: string;
	publishedAt: string;
	body: string;
	assets: ReleaseAsset[];
}

/* ── Helpers ── */

const PLATFORM_MAP: Record<string, string> = {
	dmg: "macos",
	deb: "linux",
	msi: "windows",
	zip: "windows",
};

function detectPlatform(filename: string): string {
	for (const [ext, plat] of Object.entries(PLATFORM_MAP)) {
		if (filename.endsWith(`.${ext}`)) return plat;
	}
	if (filename.includes("android") || filename.includes("apk")) return "android";
	return "other";
}

/* ── App ── */

const app = new Hono<{ Bindings: AppEnv }>();

/* ── Health ── */
app.get("/api/", (c) => c.json({ name: "SoftEther App API", version: "1.0.0" }));

/* ── GET /download/:tag/:filename — stream file from R2 (MUST be before * wildcard) ── */
app.get("/download/:tag/:filename", async (c) => {
	const { tag, filename } = c.req.param();
	try {
		const r2Key = `${tag}/${filename}`;
		const obj = await c.env.RELEASES.get(r2Key);
		if (!obj) return c.json({ error: "File not found" }, 404);

		const headers = new Headers();
		obj.writeHttpMetadata(headers);
		headers.set("etag", obj.httpEtag);
		headers.set("Content-Disposition", `attachment; filename="${filename}"`);
		headers.set("Cache-Control", "public, max-age=31536000, immutable");

		return new Response(obj.body, { headers });
	} catch (err) {
		console.error("Download error:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── GET /api/releases/latest — latest release metadata ── */
app.get("/api/releases/latest", async (c) => {
	try {
		const latestTag = await c.env.RELEASE_META.get("releases:latest");
		if (!latestTag) return c.json({ error: "No releases found" }, 404);

		const raw = await c.env.RELEASE_META.get(`releases:${latestTag}`);
		if (!raw) return c.json({ error: "Release data not found" }, 404);

		const release: ReleaseMeta = JSON.parse(raw);

		// Point download URLs at the /download/ endpoint
		const withUrls = release.assets.map((a) => ({
			...a,
			downloadUrl: `/download/${latestTag}/${encodeURIComponent(a.r2Key)}`,
		}));

		return c.json({ ...release, assets: withUrls });
	} catch (err) {
		console.error("Error fetching latest release:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── GET /api/releases — list all releases ── */
app.get("/api/releases", async (c) => {
	try {
		const raw = await c.env.RELEASE_META.get("releases:list");
		const tags: string[] = raw ? JSON.parse(raw) : [];
		// Fetch each release summary
		const releases = await Promise.all(
			tags.map(async (tag) => {
				const raw = await c.env.RELEASE_META.get(`releases:${tag}`);
				if (!raw) return null;
				const r: ReleaseMeta = JSON.parse(raw);
				return { tag: r.tag, version: r.version, publishedAt: r.publishedAt, assetCount: r.assets.length };
			}),
		);
		return c.json(releases.filter(Boolean));
	} catch (err) {
		console.error("Error fetching releases list:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── POST /api/webhook/release — triggered by SoftEtherApp release workflow ── */
app.post("/api/webhook/release", async (c) => {
	// Validate webhook secret
	const auth = c.req.header("Authorization");
	const secret = c.env.WEBHOOK_SECRET;
	if (secret && auth !== `Bearer ${secret}`) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	try {
		const body = await c.req.json<{ tag: string; repo?: string }>();
		const { tag, repo = "SoftEtherApp/SoftEther-App" } = body;
		if (!tag) return c.json({ error: "Missing tag" }, 400);

		// GitHub token (needed for private repos) — passed via header
		const ghToken = c.req.header("X-GitHub-Token");
		const ghHeaders: Record<string, string> = {
			Accept: "application/vnd.github+json",
			"User-Agent": "softether-app-web",
		};
		if (ghToken) ghHeaders.Authorization = `Bearer ${ghToken}`;

		const version = tag.replace(/^v/, "");
		console.log(`Processing release ${tag} from ${repo}...`);

		// Fetch release data from GitHub API
		const ghResp = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, {
			headers: ghHeaders,
		});
		if (!ghResp.ok) return c.json({ error: `GitHub API error: ${ghResp.status}` }, 502);

		const ghRelease = await ghResp.json<{
			id: number;
			tag_name: string;
			published_at: string;
			body: string;
			assets: { id: number; name: string; url: string; browser_download_url: string; size: number }[];
		}>();

		// Download each asset and upload to R2
		const assets: ReleaseAsset[] = [];
		for (const asset of ghRelease.assets) {
			const r2Key = `${tag}/${asset.name}`;
			console.log(`Downloading ${asset.name}...`);

			// Use the asset API endpoint with octet-stream (works for private repos with token)
			const dlResp = await fetch(asset.url, {
				headers: {
					...ghHeaders,
					Accept: "application/octet-stream",
				},
				redirect: "follow",
			});
			if (!dlResp.ok) {
				console.error(`Failed to download ${asset.name}: ${dlResp.status}`);
				continue;
			}

			const blob = await dlResp.blob();
			await c.env.RELEASES.put(r2Key, blob, {
				httpMetadata: { contentType: dlResp.headers.get("content-type") || "application/octet-stream" },
				customMetadata: { source: "github-release", tag, originalUrl: asset.browser_download_url },
			});

			assets.push({
				name: asset.name,
				platform: detectPlatform(asset.name),
				size: asset.size,
				r2Key: asset.name,
				downloadUrl: "", // populated at request time with signed URL
			});
			console.log(`Uploaded ${asset.name} to R2`);
		}

		// Build release metadata
		const meta: ReleaseMeta = {
			tag,
			version,
			publishedAt: ghRelease.published_at,
			body: ghRelease.body || "",
			assets,
		};

		// Store in KV
		await c.env.RELEASE_META.put(`releases:${tag}`, JSON.stringify(meta));

		// Update releases list
		const listRaw = await c.env.RELEASE_META.get("releases:list");
		const list: string[] = listRaw ? JSON.parse(listRaw) : [];
		if (!list.includes(tag)) list.unshift(tag); // newest first
		await c.env.RELEASE_META.put("releases:list", JSON.stringify(list));

		// Update latest
		await c.env.RELEASE_META.put("releases:latest", tag);

		return c.json({ ok: true, tag, assetsStored: assets.length });
	} catch (err) {
		console.error("Webhook error:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── GET /download/:tag/:filename — stream file from R2 ── */
app.get("/download/:tag/:filename", async (c) => {
	const { tag, filename } = c.req.param();
	try {
		const r2Key = `${tag}/${filename}`;
		const obj = await c.env.RELEASES.get(r2Key);
		if (!obj) return c.json({ error: "File not found" }, 404);

		const headers = new Headers();
		obj.writeHttpMetadata(headers);
		headers.set("etag", obj.httpEtag);
		headers.set("Content-Disposition", `attachment; filename="${filename}"`);
		headers.set("Cache-Control", "public, max-age=31536000, immutable");

		return new Response(obj.body, { headers });
	} catch (err) {
		console.error("Download error:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── SPA fallback: serve index.html for all non-file, non-API paths ── */
app.get("*", async (c) => {
	try {
		// Try ASSETS first — this serves static files from dist/client
		const resp = await c.env.ASSETS.fetch(c.req.raw);
		if (resp.status < 400) return resp;
	} catch {
		// fall through to index.html
	}
	// SPA fallback — serve index.html for client-side routes
	return c.env.ASSETS.fetch(new Request(new URL("/index.html", c.req.url), c.req.raw));
});

export default app;
