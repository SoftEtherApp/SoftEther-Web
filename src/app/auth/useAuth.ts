/* ════════════════════════════════════
   useAuth — read the current session from context
   ════════════════════════════════════ */

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return ctx;
}
