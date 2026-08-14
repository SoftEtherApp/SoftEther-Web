/* ══════════════════════════════════════════════════
   SoftEther App — Multi-Page SPA Router
   Route table + layout groups (public / auth / admin / empty)
   ══════════════════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import "./shared.css";
import "./utilities.css";
import "./layouts/AdminLayout.css";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import EmptyLayout from "./layouts/EmptyLayout";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/library/LibraryPage";
import ChangelogPage from "./pages/ChangelogPage";
import PrivacyPage from "./pages/PrivacyPage";
import SecurityPage from "./pages/SecurityPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardPage from "./pages/admin/DashboardPage";
import SettingsPage from "./pages/admin/settings/SettingsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ErrorBoundary from "./components/ErrorBoundary";

/* SPA navigation: push state + notify listeners */
const NAV_EVENT = "spa:navigate";

export function navigate(href: string) {
	const [path, hash] = href.split("#");
	const currentPath = window.location.pathname;

	// Same-pathname anchor nav: just scroll, no remount
	if (!path || path === currentPath) {
		if (hash) {
			window.history.pushState(null, "", href);
			const el = document.getElementById(hash);
			if (el) el.scrollIntoView({ behavior: "smooth" });
		}
		return;
	}

	window.history.pushState(null, "", href);
	window.dispatchEvent(new CustomEvent(NAV_EVENT));
}

/* ── Routes ── */

type LayoutKind = "public" | "auth" | "admin" | "empty";

interface RouteDef {
	path: string;
	page: () => JSX.Element;
	layout: LayoutKind;
	title: string;
}

const ROUTES: RouteDef[] = [
	{ path: "/", page: () => <HomePage />, layout: "public", title: "SoftEther App — Modern Cross-Platform VPN Client" },
	{ path: "/library", page: () => <LibraryPage />, layout: "public", title: "SoftEtherZig — Open-Source VPN Library" },
	{ path: "/changelog", page: () => <ChangelogPage />, layout: "public", title: "Changelog — SoftEther App" },
	{ path: "/privacy", page: () => <PrivacyPage />, layout: "public", title: "Privacy Policy — SoftEther App" },
	{ path: "/security", page: () => <SecurityPage />, layout: "public", title: "Security — SoftEther App" },
	{ path: "/login", page: () => <LoginPage />, layout: "auth", title: "Sign in — SoftEther App" },
	{ path: "/register", page: () => <RegisterPage />, layout: "auth", title: "Create account — SoftEther App" },
	{ path: "/forgot-password", page: () => <ForgotPasswordPage />, layout: "auth", title: "Reset password — SoftEther App" },
	{ path: "/reset-password", page: () => <ResetPasswordPage />, layout: "auth", title: "Set new password — SoftEther App" },
	{ path: "/admin", page: () => <DashboardPage />, layout: "admin", title: "Dashboard — SoftEther Admin" },
	{ path: "/admin/settings", page: () => <SettingsPage />, layout: "admin", title: "Settings — SoftEther Admin" },
	{ path: "/unauthorized", page: () => <UnauthorizedPage />, layout: "empty", title: "Unauthorized — SoftEther App" },
];

const NOT_FOUND: RouteDef = {
	path: "*",
	page: () => <NotFoundPage />,
	layout: "empty",
	title: "Page Not Found — SoftEther App",
};

const LAYOUTS: Record<LayoutKind, ({ children }: { children: JSX.Element }) => JSX.Element> = {
	public: PublicLayout,
	auth: AuthLayout,
	admin: AdminLayout,
	empty: EmptyLayout,
};

// "/library/" and "/" resolve to the same route; unknown paths fall to NOT_FOUND.
function matchRoute(pathname: string): RouteDef {
	const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	return ROUTES.find((r) => r.path === p) ?? NOT_FOUND;
}

/* ── App ── */

function App(): JSX.Element {
	// Lazily initialize from the current URL: the correct page renders on the
	// very first pass (no blank loading frame) and title sync happens on mount.
	const [pathname, setPathname] = useState(window.location.pathname);

	const sync = useCallback(() => {
		const p = window.location.pathname;
		setPathname(p);
		document.title = matchRoute(p).title;
	}, []);

	useEffect(() => {
		sync();
		window.addEventListener("popstate", sync);
		window.addEventListener(NAV_EVENT, sync);
		return () => {
			window.removeEventListener("popstate", sync);
			window.removeEventListener(NAV_EVENT, sync);
		};
	}, [sync]);

	const route = matchRoute(pathname);
	const Layout = LAYOUTS[route.layout];
	const Page = route.page;

	return (
		<ErrorBoundary>
			<Layout>
				<Page />
			</Layout>
		</ErrorBoundary>
	);
}

export default App;
