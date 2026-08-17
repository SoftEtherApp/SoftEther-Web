/* ════════════════════════════════════
   Email token store — hashed, single-use, expiring tokens for
   email verification and password reset (epic #46).

   Security model:
   - Raw tokens are 32 bytes of CSPRNG entropy, base64url-encoded,
     and returned ONLY to the code path that emails them.
   - Only the SHA-256 hash is stored (hex). A hash lookup reveals
     nothing about the raw token (high entropy) and constant-time
     comparison guards against timing side channels.
   - Single-use is enforced atomically: the UPDATE claims the row
     only when used_at IS NULL (RETURNING checks the claim).
   - Expiry is 1h by default; expired rows are purged lazily on
     verify and on mint.

   Loadable in Node tests: D1/drizzle imports are dynamic (same
   pattern as sender.ts), crypto uses WebCrypto (global in Node 19+).
   ════════════════════════════════════ */

export const EMAIL_TOKEN_KINDS = ["verify_email", "reset_password"] as const;
export type EmailTokenKind = (typeof EMAIL_TOKEN_KINDS)[number];

export const EMAIL_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const EMAIL_TOKEN_BYTES = 32;

export interface MintEmailTokenOptions {
	userId: number;
	kind: EmailTokenKind;
	/** Custom TTL, for flows that need a shorter window. */
	ttlMs?: number;
}

export interface EmailTokenVerification {
	userId: number;
	kind: EmailTokenKind;
}

export function isEmailTokenKind(value: string): value is EmailTokenKind {
	return (EMAIL_TOKEN_KINDS as readonly string[]).includes(value);
}

/* ── pure crypto (Node-testable) ── */

/** base64url of EMAIL_TOKEN_BYTES CSPRNG bytes — URL-safe, no padding. */
export function generateEmailToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(EMAIL_TOKEN_BYTES));
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Hex SHA-256 of the raw token — the only form ever persisted. */
export async function hashEmailToken(token: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexBytes(hex: string): Uint8Array {
	const out = new Uint8Array(Math.ceil(hex.length / 2));
	for (let i = 0; i < hex.length; i += 2) {
		out[i >> 1] = Number.parseInt(hex.slice(i, i + 2), 16) || 0;
	}
	return out;
}

/** Constant-time hex comparison (XOR accumulation; length mismatches
 *  still burn a full pass). Non-hex input is never equal. */
export function timingSafeEqualHex(a: string, b: string): boolean {
	if (/[^0-9a-fA-F]/.test(a) || /[^0-9a-fA-F]/.test(b)) return false;
	const ab = hexBytes(a);
	const bb = hexBytes(b);
	const max = Math.max(ab.length, bb.length);
	let diff = ab.length ^ bb.length;
	for (let i = 0; i < max; i++) {
		diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
	}
	return diff === 0;
}

/* ── store (D1) — dynamic imports keep this file Node-loadable;
      type-only imports are erased and add no runtime cost ── */

import type { Db } from "../db/client";

interface EmailTokenRow {
	id: number;
	userId: number;
	kind: string;
	tokenHash: string;
	expiresAt: number;
	usedAt: number | null;
}

interface Store {
	insertToken(row: { userId: number; kind: string; tokenHash: string; expiresAt: number }): Promise<void>;
	selectToken(hash: string, kind: string): Promise<EmailTokenRow | null>;
	claimToken(id: number, at: number): Promise<boolean>;
	deleteExpired(now: number, kind?: string): Promise<number>;
}

let store: Store | null = null;

async function storeFor(db: D1Database): Promise<Store> {
	if (!store) {
		const [{ getDb }, { emailTokens }, { and, eq, isNull, lt }] = await Promise.all([
			import("../db/client"),
			import("../db/schema"),
			import("drizzle-orm"),
		]);
		const d: Db = getDb(db);
		store = {
			async insertToken(row) {
				await d.insert(emailTokens).values(row);
			},
			async selectToken(hash, kind) {
				const rows = await d
					.select({
						id: emailTokens.id,
						userId: emailTokens.userId,
						kind: emailTokens.kind,
						tokenHash: emailTokens.tokenHash,
						expiresAt: emailTokens.expiresAt,
						usedAt: emailTokens.usedAt,
					})
					.from(emailTokens)
					.where(and(eq(emailTokens.tokenHash, hash), eq(emailTokens.kind, kind)));
				return rows[0] ?? null;
			},
			async claimToken(id, at) {
				const claimed = await d
					.update(emailTokens)
					.set({ usedAt: at })
					.where(and(eq(emailTokens.id, id), isNull(emailTokens.usedAt)))
					.returning({ id: emailTokens.id });
				return claimed.length === 1;
			},
			async deleteExpired(now, kind) {
				const cond = kind
					? and(lt(emailTokens.expiresAt, now), eq(emailTokens.kind, kind))
					: lt(emailTokens.expiresAt, now);
				const deleted = await d.delete(emailTokens).where(cond).returning({ id: emailTokens.id });
				return deleted.length;
			},
		};
	}
	return store;
}

/**
 * Mint a token: stores only the SHA-256 hash, returns the raw token
 * to the caller (email path only). Expired rows for the kind are
 * purged lazily on the way through.
 */
export async function mintEmailToken(db: D1Database, opts: MintEmailTokenOptions): Promise<string> {
	const s = await storeFor(db);
	const raw = generateEmailToken();
	const hash = await hashEmailToken(raw);

	await s.deleteExpired(Math.floor(Date.now() / 1000), opts.kind);

	await s.insertToken({
		userId: opts.userId,
		kind: opts.kind,
		tokenHash: hash,
		expiresAt: Math.floor((Date.now() + (opts.ttlMs ?? EMAIL_TOKEN_TTL_MS)) / 1000),
	});

	return raw;
}

/**
 * Verify a token: expiry + single-use checks, then claim it atomically.
 * Returns the token's intent (userId + kind) or null when invalid,
 * expired, already used, or never issued.
 */
export async function verifyEmailToken(
	db: D1Database,
	token: string,
	kind: EmailTokenKind,
): Promise<EmailTokenVerification | null> {
	const s = await storeFor(db);
	const hash = await hashEmailToken(token);
	const row = await s.selectToken(hash, kind);
	if (!row) return null;
	if (!timingSafeEqualHex(row.tokenHash, hash)) return null;

	const now = Math.floor(Date.now() / 1000);
	if (row.expiresAt <= now) {
		await s.deleteExpired(now, kind);
		return null;
	}
	if (row.usedAt !== null) return null;

	// Atomic single-use claim: only succeeds when the row is still unused.
	const claimed = await s.claimToken(row.id, now);
	if (!claimed) return null;

	return { userId: row.userId, kind: row.kind as EmailTokenKind };
}

/** Delete expired rows (all kinds, or one kind). Returns rows deleted. */
export async function purgeExpiredTokens(db: D1Database, kind?: EmailTokenKind): Promise<number> {
	const s = await storeFor(db);
	return s.deleteExpired(Math.floor(Date.now() / 1000), kind);
}