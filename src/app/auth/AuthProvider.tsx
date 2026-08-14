/* ════════════════════════════════════
   AuthProvider — holds the mock session in state,
   backed by localStorage via session.ts.
   ════════════════════════════════════ */

import { useMemo, useState, type JSX } from "react";
import { AuthContext } from "./auth-context";
import { getSession, setSession, clearSession, type SessionUser } from "./session";

export default function AuthProvider({ children }: { children: JSX.Element }): JSX.Element {
	const [session, setSessionState] = useState(() => getSession());

	const value = useMemo(
		() => ({
			session,
			user: session?.user ?? null,
			signIn: (user: SessionUser) => {
				const next = { user, createdAt: Date.now() };
				setSession(next);
				setSessionState(next);
			},
			signOut: () => {
				clearSession();
				setSessionState(null);
			},
		}),
		[session],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
