/* ════════════════════════════════════
   Admin API client — typed fetch helpers for /api/admin/*.
   The bearer token is a site secret (ADMIN_API_TOKEN) entered
   once on the admin Settings page and kept in localStorage;
   without it every call fails 401 (the worker fails closed).
   ════════════════════════════════════ */

export interface AdminUser {
	id: number;
	email: string;
	name: string;
	role: string;
	status: "active" | "invited" | "suspended";
	createdAt: number;
}

export interface AdminRole {
	id: number;
	key: string;
	name: string;
	description: string;
}

export interface AdminPermission {
	id: number;
	key: string;
	name: string;
	description: string;
	/** Local UI toggle state — the API is read-only for permissions. */
	enabled?: boolean;
}

export interface AdminFeatureFlag {
	id: number;
	key: string;
	name: string;
	description: string;
	enabled: boolean;
	updatedAt: number;
}

export interface AdminStats {
	users: number;
	releases: number;
	featureFlags: number;
}

export interface AdminActivity {
	id: number;
	actor: string;
	action: string;
	detail: string;
	createdAt: number;
}

const TOKEN_KEY = "softether.adminToken";

export function getAdminToken(): string | null {
	try {
		return window.localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setAdminToken(token: string): void {
	try {
		window.localStorage.setItem(TOKEN_KEY, token.trim());
	} catch {
		/* storage unavailable — calls will fail closed with 401 */
	}
}

export function clearAdminToken(): void {
	try {
		window.localStorage.removeItem(TOKEN_KEY);
	} catch {
		/* ignore */
	}
}

export class AdminApiError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
		this.name = "AdminApiError";
	}
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const token = getAdminToken();
	if (!token) {
		throw new AdminApiError("Admin API token is not configured", 401);
	}
	const res = await fetch(`/api/admin${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			...(init.headers ?? {}),
		},
	});
	if (!res.ok) {
		let message = `Request failed (${res.status})`;
		try {
			const body = (await res.json()) as { error?: string };
			if (body.error) message = body.error;
		} catch {
			/* non-JSON error body */
		}
		throw new AdminApiError(message, res.status);
	}
	return (await res.json()) as T;
}

/* ── Reads ── */

export const adminApi = {
	getStats: () => adminFetch<AdminStats>("/stats"),
	getUsers: () => adminFetch<AdminUser[]>("/users"),
	getRoles: () => adminFetch<AdminRole[]>("/roles"),
	getPermissions: () => adminFetch<AdminPermission[]>("/permissions"),
	getFeatures: () => adminFetch<AdminFeatureFlag[]>("/features"),
	getActivity: () => adminFetch<AdminActivity[]>("/activity"),

	/* ── Writes ── */

	inviteUser: (input: { email: string; name: string; role?: string }) =>
		adminFetch<AdminUser>("/users", {
			method: "POST",
			body: JSON.stringify(input),
		}),

	updateUser: (id: number, patch: { status?: string; role?: string }) =>
		adminFetch<AdminUser>(`/users/${id}`, {
			method: "PATCH",
			body: JSON.stringify(patch),
		}),

	toggleFeature: (key: string, enabled: boolean) =>
		adminFetch<AdminFeatureFlag>(`/features/${encodeURIComponent(key)}`, {
			method: "PATCH",
			body: JSON.stringify({ enabled }),
		}),
};