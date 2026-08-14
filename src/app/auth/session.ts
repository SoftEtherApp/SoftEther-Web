/* ════════════════════════════════════
   Session store — mock auth session persisted in localStorage.
   Swappable for a real backend later: same shape as a JWT
   "me" endpoint would return.
   ════════════════════════════════════ */

export type UserRole = "admin" | "user";

export interface SessionUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

export interface Session {
	user: SessionUser;
	createdAt: number;
}

const SESSION_KEY = "softether.session";

/* Demo role resolution — a real backend would return the role with the
   session. admin@softether.app acts as the admin demo account. */
const ADMIN_EMAILS = new Set(["admin@softether.app", "admin@softether.com"]);

export function roleForEmail(email: string): UserRole {
	return ADMIN_EMAILS.has(email.trim().toLowerCase()) ? "admin" : "user";
}

export function getSession(): Session | null {
	try {
		const raw = window.localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const session = JSON.parse(raw) as Session;
		// Backfill role for sessions stored before roles existed
		session.user.role = session.user.role ?? roleForEmail(session.user.email);
		return session;
	} catch {
		return null;
	}
}

export function setSession(session: Session): void {
	window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
	window.localStorage.removeItem(SESSION_KEY);
}
