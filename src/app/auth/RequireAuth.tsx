/* ════════════════════════════════════
   RequireAuth — route guard for scoped areas.
   - No session: redirects to /login (remembering the target).
   - Signed in but missing a required role: redirects to /unauthorized.
   - Otherwise renders children.
   ════════════════════════════════════ */

import { useEffect, type JSX } from "react";
import { navigate } from "../App";
import { useAuth } from "./useAuth";
import { setAuthNext } from "./auth-next";
import type { UserRole } from "./session";

interface RequireAuthProps {
	children: JSX.Element;
	roles?: UserRole[];
}

export default function RequireAuth({ children, roles }: RequireAuthProps): JSX.Element | null {
	const { session, user } = useAuth();

	useEffect(() => {
		if (!session) {
			setAuthNext(window.location.pathname + window.location.hash);
			navigate("/login");
		} else if (roles && user && !roles.includes(user.role)) {
			navigate("/unauthorized");
		}
	}, [session, user, roles]);

	if (!session) return null;
	if (roles && user && !roles.includes(user.role)) return null;
	return children;
}
