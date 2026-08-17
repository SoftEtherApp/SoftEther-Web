/* ════════════════════════════════════
   Admin API validators — pure surface of the write
   endpoints (epic #16, #27). Kept module-pure so the
   handlers stay thin and the rules are testable without
   a live D1 binding (see scripts/test-admin.mjs).
   ════════════════════════════════════ */

export const USER_STATUSES = ["active", "suspended", "invited"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ROLE_MAX_LENGTH = 32;
export const DEFAULT_INVITE_ROLE = "user";

/** Parse a user status field from an untrusted PATCH body. */
export function parseUserStatus(raw: unknown): UserStatus | null {
	if (typeof raw !== "string") return null;
	const value = raw.trim().toLowerCase();
	return (USER_STATUSES as readonly string[]).includes(value) ? (value as UserStatus) : null;
}

/** Parse a role assignment; empty falls back to the default invite role. */
export function parseRole(raw: unknown, fallback = DEFAULT_INVITE_ROLE): string | null {
	if (typeof raw !== "string") return null;
	const value = raw.trim();
	if (value === "") return fallback;
	if (value.length > ROLE_MAX_LENGTH) return null;
	return value;
}

/** Parse a boolean toggle from an untrusted PATCH body. */
export function parseEnabled(raw: unknown): boolean | null {
	if (typeof raw === "boolean") return raw;
	if (raw === 1 || raw === "1" || raw === "true") return true;
	if (raw === 0 || raw === "0" || raw === "false") return false;
	return null;
}
