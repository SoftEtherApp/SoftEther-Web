/* ════════════════════════════════════
   Password hashing — PBKDF2-HMAC-SHA256 via WebCrypto (Workers +
   Node 19+). Pure module (no D1/worker imports) so it runs in the
   Node test harness.

   Stored format: pbkdf2-sha256$<iterations>$<salt-b64>$<key-b64>
   - 210,000 iterations (OWASP PBKDF2-HMAC-SHA256 guidance)
   - 16-byte random salt per hash
   - 32-byte derived key
   - Constant-time comparison on verify
   ════════════════════════════════════ */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PBKDF2_ITERATIONS = 210_000;
export const PBKDF2_SALT_BYTES = 16;
export const PBKDF2_KEY_BYTES = 32;
export const PBKDF2_ALGORITHM = "PBKDF2";
const HASH_PREFIX = "pbkdf2-sha256";

function toBase64(bytes: Uint8Array): string {
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin);
}

function fromBase64(value: string): Uint8Array {
	const bin = atob(value);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
		"deriveBits",
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", hash: "SHA-256", salt, iterations },
		key,
		PBKDF2_KEY_BYTES * 8,
	);
	return new Uint8Array(bits);
}

/** Constant-time byte comparison (XOR accumulation, full pass always). */
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		// Burn a comparable pass so length leaks nothing meaningful.
		let acc = 0;
		const max = Math.max(a.length, b.length);
		for (let i = 0; i < max; i++) acc |= (a[i] ?? 0) ^ (b[i] ?? 0);
		void acc;
		return false;
	}
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES));
	const key = await derive(password, salt, PBKDF2_ITERATIONS);
	return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(key)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const parts = stored.split("$");
	if (parts.length !== 4 || parts[0] !== HASH_PREFIX) return false;
	const iterations = Number.parseInt(parts[1], 10);
	if (!Number.isInteger(iterations) || iterations <= 0) return false;
	let salt: Uint8Array;
	let expected: Uint8Array;
	try {
		salt = fromBase64(parts[2]);
		expected = fromBase64(parts[3]);
	} catch {
		return false;
	}
	if (salt.length !== PBKDF2_SALT_BYTES || expected.length !== PBKDF2_KEY_BYTES) return false;
	const actual = await derive(password, salt, iterations);
	return timingSafeEqualBytes(actual, expected);
}
