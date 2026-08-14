/* ════════════════════════════════════
   Session store — mock auth session persisted in localStorage.
   Swappable for a real backend later: same shape as a JWT
   "me" endpoint would return.
   ════════════════════════════════════ */

export interface SessionUser {
	id: string;
	name: string;
	email: string;
}

export interface Session {
	user: SessionUser;
	createdAt: number;
}

const SESSION_KEY = "softether.session";

export function getSession(): Session | null {
	try {
		const raw = window.localStorage.getItem(SESSION_KEY);
		return raw ? (JSON.parse(raw) as Session) : null;
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
