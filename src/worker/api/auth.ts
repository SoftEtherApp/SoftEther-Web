/* ════════════════════════════════════
   Auth API — registration + email verification (epic #46, #49).

   Anti-enumeration: register always answers 201 {ok:true} for valid
   input, whether or not the email already exists (existing accounts
   get no token and no email). Verify answers a generic "invalid or
   expired" message; token validity is single-use + 1h (tokens.ts).

   Rate limiting: fixed-window KV counters per IP (5/min register,
   10/min verify). Reuses the RELEASE_META namespace with a
   "ratelimit:" prefix; #52 moves this to a dedicated namespace and
   hardens the guards.

   Passwords are PBKDF2-SHA256 hashed (auth/password.ts) at
   registration; the login epic consumes the hash later.
   ════════════════════════════════════ */

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Context } from "hono";

import { getDb } from "../db/client";
import * as schema from "../db/schema";
import { sendEmail } from "../email/sender";
import { verificationEmail } from "../email/templates";
import { mintEmailToken, verifyEmailToken, type EmailTokenKind } from "../email/tokens";
import { hashPassword } from "../auth/password";
import { checkPassword, normalizeEmail, normalizeName } from "../auth/validate";
import type { AppEnv } from "../env";

export const authRoutes = new Hono<{ Bindings: AppEnv }>();

/* ── helpers ── */

const LIMIT_KV_PREFIX = "ratelimit:";

/** Fixed-window per-IP counter. Returns false when the limit is hit. */
async function rateLimitHit(kv: KVNamespace, key: string, limit: number, windowSec: number): Promise<boolean> {
	const now = Math.floor(Date.now() / 1000);
	const window = Math.floor(now / windowSec);
	const kvKey = `${LIMIT_KV_PREFIX}auth:${key}:${window}`;
	const raw = await kv.get(kvKey);
	const count = Number.parseInt(raw ?? "0", 10) || 0;
	if (count >= limit) return true;
	// expirationTtl covers the current window plus slack so the counter
	// never outlives its window.
	await kv.put(kvKey, String(count + 1), { expirationTtl: windowSec * 2 });
	return false;
}

function clientIp(c: Context<{ Bindings: AppEnv }>): string {
	return c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function audit(c: Context<{ Bindings: AppEnv }>, action: string, detail: string): Promise<void> {
	try {
		const db = getDb(c.env.DB);
		await db.insert(schema.activityLog).values({ actor: "system", action, detail });
	} catch (err) {
		console.error(`Activity audit failed (non-fatal): ${action}`, err);
	}
}

/* ── POST /api/auth/register ── */

authRoutes.post("/register", async (c) => {
	const ip = clientIp(c);
	if (await rateLimitHit(c.env.RELEASE_META, `register:${ip}`, 5, 60)) {
		return c.json({ error: "Too many attempts. Try again in a minute." }, 429);
	}

	let body: { name?: string; email?: string; password?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body." }, 400);
	}

	const email = normalizeEmail(body.email ?? "");
	const name = normalizeName(body.name ?? "");
	if (!email) return c.json({ error: "Please enter a valid email address." }, 400);
	if (!name) return c.json({ error: "Please enter a display name (max 64 characters)." }, 400);
	if (!checkPassword(body.password ?? "")) {
		return c.json({ error: "Password must be at least 8 characters." }, 400);
	}

	const db = getDb(c.env.DB);

	// Anti-enumeration: existing email → same generic 201, no token, no email.
	const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
	if (existing) {
		await audit(c, "auth.register.duplicate", `email=${email}`);
		return c.json({ ok: true }, 201);
	}

	let passwordHash: string;
	try {
		passwordHash = await hashPassword(body.password as string);
	} catch (err) {
		console.error("Password hash failed:", err);
		return c.json({ error: "Internal server error." }, 500);
	}

	const [user] = await db
		.insert(schema.users)
		.values({ email, name, status: "pending", passwordHash })
		.returning({ id: schema.users.id });
	if (!user) {
		return c.json({ error: "Internal server error." }, 500);
	}

	// Mint + email the verification token. A mint failure rolls back the
	// user so no pending account is left dangling; a send failure keeps
	// the pending user (a resend flow can pick it up later).
	let token: string;
	try {
		token = await mintEmailToken(c.env.DB, { userId: user.id, kind: "verify_email" });
	} catch (err) {
		console.error("Token mint failed, rolling back user:", err);
		await db.delete(schema.users).where(eq(schema.users.id, user.id));
		return c.json({ error: "Internal server error." }, 500);
	}

	const verifyUrl = `${new URL(c.req.url).origin}/verify-email?token=${encodeURIComponent(token)}`;
	const mail = verificationEmail(name, verifyUrl);
	const result = await sendEmail(c.env, {
		to: email,
		subject: mail.subject,
		text: mail.text,
		html: mail.html,
	});
	await audit(c, "auth.register", `email=${email} name=${name} mail=${result.ok ? "sent" : "failed"}`);

	return c.json({ ok: true }, 201);
});

/* ── POST /api/auth/verify-email ── */

const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;

authRoutes.post("/verify-email", async (c) => {
	const ip = clientIp(c);
	if (await rateLimitHit(c.env.RELEASE_META, `verify:${ip}`, 10, 60)) {
		return c.json({ error: "Too many attempts. Try again in a minute." }, 429);
	}

	let body: { token?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body." }, 400);
	}

	const token = body.token ?? "";
	if (typeof token !== "string" || !TOKEN_RE.test(token)) {
		return c.json({ error: "Invalid or expired verification link." }, 400);
	}

	const db = getDb(c.env.DB);
	const verified = await verifyEmailToken(c.env.DB, token, "verify_email" satisfies EmailTokenKind);
	if (!verified) {
		return c.json({ error: "Invalid or expired verification link." }, 400);
	}

	const [user] = await db
		.update(schema.users)
		.set({ status: "active" })
		.where(eq(schema.users.id, verified.userId))
		.returning({ id: schema.users.id, email: schema.users.email });
	if (!user) {
		return c.json({ error: "Invalid or expired verification link." }, 400);
	}

	await audit(c, "auth.verify-email", `email=${user.email}`);
	return c.json({ ok: true });
});
