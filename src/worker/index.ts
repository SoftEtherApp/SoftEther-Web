import { Hono } from "hono";

import { getDb } from "./db/client";
import * as schema from "./db/schema";
import type { ReleaseAsset, Release } from "../shared/types";
import { authRoutes } from "./api/auth";
import { adminRoutes } from "./api/admin";
import { constantTimeEqual } from "./auth/bearer";
import type { AppEnv } from "./env";

/* ── App ── */

const app = new Hono<{ Bindings: AppEnv }>();

/* ── Helpers ── */

const PLATFORM_MAP: Record<string, string> = {
	dmg: "macos",
	deb: "linux",
	msi: "windows",
	zip: "windows-portable",
	apk: "android",
};

function detectPlatform(filename: string): string {
	// Check extension-based map first
	for (const [ext, plat] of Object.entries(PLATFORM_MAP)) {
		if (filename.endsWith(`.${ext}`)) {
			// Sub-classify macOS by arch
			if (plat === "macos") {
				if (/\barm64\b|\baarch64\b/i.test(filename)) return "macos-aarch64";
				if (/\bx64\b|\bx86_64\b|intel/i.test(filename)) return "macos-x64";
				return plat;
			}
			// Sub-classify Android by ABI
			if (plat === "android" && /armv7|armeabi/i.test(filename)) return "android-armv7";
			return plat;
		}
	}
	// Fallback for .tar.gz or unknown archive formats
	if (filename.endsWith(".tar.gz")) return "linux";
	if (filename.includes("android") || filename.includes("apk")) return "android";
	return "other";
}

/* ── Security headers middleware ── */
app.use("*", async (c, next) => {
	await next();

	// 101 Switching Protocols (WebSocket upgrade) responses cannot be
	// reconstructed via `new Response()` — skip header injection entirely.
	if (c.res.status === 101) return;

	const isDev = c.env.ENVIRONMENT === "development" || c.req.url.includes("localhost");
	const cspPolicies = [
		"default-src 'self'",
		isDev ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'",
		isDev ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'",
		"img-src 'self' data:",
		"font-src 'self'",
		"connect-src 'self'",
		"frame-ancestors 'none'",
		"base-uri 'self'",
	];

	const securityHeaders: [string, string][] = [
		["Content-Security-Policy", cspPolicies.join("; ")],
		["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
		["X-Content-Type-Options", "nosniff"],
		["X-Frame-Options", "DENY"],
		["Referrer-Policy", "strict-origin-when-cross-origin"],
	];

	// Prefer mutating the original response's headers in place — this keeps
	// the body stream and any response metadata (status, cf, webSocket)
	// untouched. Rebuild only when the original headers are immutable
	// (e.g. responses passed through from ASSETS fetch), and only then.
	try {
		for (const [key, value] of securityHeaders) {
			c.res.headers.set(key, value);
		}
		return;
	} catch {
		// Headers are immutable — reconstruct the response so we can still
		// inject security headers. Rebuilding disturbs the body stream, so
		// this path is only for simple, fully-read bodies (asset fetches).
	}

	const res = new Response(c.res.body, {
		status: c.res.status,
		statusText: c.res.statusText,
		headers: c.res.headers,
	});
	for (const [key, value] of securityHeaders) {
		res.headers.set(key, value);
	}
	c.res = res;
});

/* ── Health ── */
app.get("/api/", (c) => c.json({ name: "SoftEther App API", version: "1.0.0" }));

/* ── Auth ── */
app.route("/api/auth", authRoutes);

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

		const release: Release = JSON.parse(raw);

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
				const r: Release = JSON.parse(raw);
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
	// Validate webhook secret — FAIL CLOSED: without a configured secret
	// the guard must reject (except local development), never accept an
	// unauthenticated release sync into R2/KV/D1.
	const auth = c.req.header("Authorization");
	const secret = c.env.WEBHOOK_SECRET;
	const isDev = c.env.ENVIRONMENT === "development" || c.req.url.includes("localhost");
	const authorized = secret
		? auth !== undefined && auth.startsWith("Bearer ") && constantTimeEqual(auth.slice(7), secret)
		: isDev;
	if (!authorized) {
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
		const meta: Release = {
			tag,
			version,
			publishedAt: ghRelease.published_at,
			body: ghRelease.body || "",
			assets,
		};

		// Store in KV
		await c.env.RELEASE_META.put(`releases:${tag}`, JSON.stringify(meta));

		// Mirror release metadata into D1
		try {
			const db = getDb(c.env.DB);
			const [releaseRow] = await db
				.insert(schema.releases)
				.values({
					tag,
					version,
					publishedAt: ghRelease.published_at,
					body: ghRelease.body || "",
				})
				.onConflictDoUpdate({
					target: schema.releases.tag,
					set: {
						version,
						publishedAt: ghRelease.published_at,
						body: ghRelease.body || "",
					},
				})
				.returning({ id: schema.releases.id });

			if (releaseRow) {
				for (const asset of assets) {
					await db.insert(schema.releaseAssets).values({
						releaseId: releaseRow.id,
						name: asset.name,
						platform: asset.platform,
						size: asset.size,
						r2Key: asset.r2Key,
					});
				}
			}
		} catch (err) {
			console.error("D1 mirror write failed (non-fatal):", err);
		}

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

/* ── Admin API (D1) ── */

// Admin routes are gated behind a bearer token (ADMIN_API_TOKEN secret).
// Fail closed: without the token configured, everyone gets 401. The SPA
// sends the token from the admin Settings page (epic #16).
app.use("/api/admin/*", async (c, next) => {
	const token = c.env.ADMIN_API_TOKEN;
	const auth = c.req.header("Authorization");
	const authorized =
		token !== undefined &&
		auth !== undefined &&
		auth.startsWith("Bearer ") &&
		constantTimeEqual(auth.slice(7), token);
	if (!authorized) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	await next();
});

app.route("/api/admin", adminRoutes);

/* ── SPA fallback ── */

// Routes the SPA router knows. Any other path is a genuine 404: the server
// answers 404 (so crawlers, link checkers, and no-JS clients get honest
// semantics) while still shipping the shell for client-side rendering.
const SPA_ROUTES = new Set([
	"/",
	"/library",
	"/changelog",
	"/privacy",
	"/security",
	"/download",
	"/terms",
	"/docs",
	"/login",
	"/register",
	"/verify-email",
	"/forgot-password",
	"/reset-password",
	"/profile",
	"/admin",
	"/admin/analytics",
	"/admin/distribution",
	"/admin/access/users",
	"/admin/access/roles",
	"/admin/access/permissions",
	"/admin/features",
	"/admin/settings",
	"/unauthorized",
]);

function spaStatus(pathname: string): number {
	const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	return SPA_ROUTES.has(p) ? 200 : 404;
}

app.get("*", async (c) => {
	const assets = c.env.ASSETS;

	// No ASSETS binding (misconfigured deployment): fail loudly (404) rather
	// than serve an un-built template — the built shell lives in the assets
	// directory and can only be served through this binding.
	if (!assets) {
		return c.notFound();
	}

	const status = spaStatus(new URL(c.req.url).pathname);
	const indexRequest = new Request(new URL("/index.html", c.req.url), c.req.raw);

	// Serve the SPA shell for unknown paths while preserving the requested
	// URL. The assets runtime only exposes index.html via a canonical 307
	// redirect to "/", so returning that redirect as-is would bounce the
	// browser to the home page; follow it here instead so the client router
	// boots on the deep link (/library) itself.
	const serveShell = async () => {
		const shell = await assets.fetch(indexRequest);
		const location = shell.headers.get("location");
		const body =
			shell.status >= 300 && shell.status < 400 && location
				? await assets.fetch(new Request(new URL(location, c.req.url), c.req.raw))
				: shell;
		// Rewrite the status so unknown routes report 404 while still
		// carrying the shell body for client-side rendering.
		if (status !== 200) {
			return new Response(body.body, { status, headers: body.headers });
		}
		return body;
	};

	try {
		const resp = await assets.fetch(c.req.raw);
		if (resp.status === 404) {
			return serveShell();
		}
		return resp;
	} catch (err) {
		console.error("ASSETS fetch failed, serving index.html fallback:", err);
		return serveShell();
	}
});

export default app;
