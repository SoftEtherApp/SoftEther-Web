/* ════════════════════════════════════
   Registration field validators — pure module (Node-testable).
   All validators return a trimmed/normalized value or null;
   handlers translate null into a generic 400.
   ════════════════════════════════════ */

/* Kept in sync with password.ts — cannot import it statically
   (extensionless relative import breaks Node loading). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;
export const NAME_MAX_LENGTH = 64;

/** Lax-but-safe address check: single @, no spaces/angle brackets
 *  (matches the SMTP client's recipient guard), normalized lowercase. */
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i;

export function normalizeEmail(raw: string): string | null {
	if (typeof raw !== "string") return null;
	const email = raw.trim().toLowerCase();
	if (email.length === 0 || email.length > EMAIL_MAX_LENGTH) return null;
	if (!EMAIL_RE.test(email)) return null;
	return email;
}

export function normalizeName(raw: string): string | null {
	if (typeof raw !== "string") return null;
	// Reject line breaks and angle brackets BEFORE collapsing whitespace,
	// otherwise "\r\n" would be scrubbed into a harmless space.
	if (/[\r\n<>]/.test(raw)) return null;
	const name = raw.trim().replace(/\s+/g, " ");
	if (name.length === 0 || name.length > NAME_MAX_LENGTH) return null;
	return name;
}

export function checkPassword(raw: string): boolean {
	if (typeof raw !== "string") return false;
	return raw.length >= PASSWORD_MIN_LENGTH && raw.length <= PASSWORD_MAX_LENGTH;
}
