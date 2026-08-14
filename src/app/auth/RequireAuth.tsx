/* ════════════════════════════════════
   RequireAuth — route guard for scoped areas.
   Redirects to /login (remembering the target) when there is
   no session; renders children when signed in.
   ════════════════════════════════════ */

import { useEffect, type JSX } from "react";
import { navigate } from "../App";
import { useAuth } from "./useAuth";
import { setAuthNext } from "./auth-next";

export default function RequireAuth({ children }: { children: JSX.Element }): JSX.Element | null {
	const { session } = useAuth();

	useEffect(() => {
		if (!session) {
			setAuthNext(window.location.pathname + window.location.hash);
			navigate("/login");
		}
	}, [session]);

	if (!session) return null;
	return children;
}
