/* ════════════════════════════════════
   Auth redirect target — remembers where an unauthenticated
   visitor was headed so sign-in can return them there.
   Pure module (no components).
   ════════════════════════════════════ */

const NEXT_KEY = "softether.authNext";

export function setAuthNext(href: string): void {
	try {
		window.sessionStorage.setItem(NEXT_KEY, href);
	} catch {
		/* sessionStorage unavailable — sign-in falls back to /admin */
	}
}

export function consumeAuthNext(): string | null {
	try {
		const next = window.sessionStorage.getItem(NEXT_KEY);
		window.sessionStorage.removeItem(NEXT_KEY);
		return next;
	} catch {
		return null;
	}
}
