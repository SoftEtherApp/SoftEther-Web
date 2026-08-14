/* ════════════════════════════════════
   Auth context object — shared between AuthProvider and useAuth.
   Pure module (no components) so both import sites stay fast-refresh clean.
   ════════════════════════════════════ */

import { createContext } from "react";
import type { Session, SessionUser } from "./session";

export interface AuthContextValue {
	session: Session | null;
	user: SessionUser | null;
	signIn: (user: SessionUser) => void;
	signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
