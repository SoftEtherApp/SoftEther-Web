/* ══════════════════════════════════════════════════
   SoftEther App — Multi-Page SPA Router
   ══════════════════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import "./shared.css";
import AppLanding from "./pages/AppLanding";
import LibraryLanding from "./pages/LibraryLanding";
import ChangelogPage from "./pages/ChangelogPage";
import PrivacyPage from "./pages/PrivacyPage";
import SecurityPage from "./pages/SecurityPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";

type Page = "app" | "library" | "changelog" | "privacy" | "security" | "notfound";

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

const PAGE_TITLES: Record<Page, string> = {
	app: "SoftEther App — Modern Cross-Platform VPN Client",
	library: "SoftEtherZig — Open-Source VPN Library",
	changelog: "Changelog — SoftEther App",
	privacy: "Privacy Policy — SoftEther App",
	security: "Security — SoftEther App",
	notfound: "Page Not Found — SoftEther App",
};

function getPage(): Page {
	const p = window.location.pathname;
	if (p === "/library" || p === "/library/") return "library";
	if (p === "/changelog" || p === "/changelog/") return "changelog";
	if (p === "/privacy" || p === "/privacy/") return "privacy";
	if (p === "/security" || p === "/security/") return "security";
	if (p === "/" || p === "") return "app";
	return "notfound";
}

function App(): JSX.Element {
	// Lazily initialize from the current URL: the correct page renders on the
	// very first pass (no blank loading frame) and title sync happens on mount.
	const [page, setPage] = useState<Page>(getPage);

	const sync = useCallback(() => {
		const p = getPage();
		setPage(p);
		document.title = PAGE_TITLES[p];
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

	return (
		<ErrorBoundary>
			{page === "library" && <LibraryLanding />}
			{page === "changelog" && <ChangelogPage />}
			{page === "privacy" && <PrivacyPage />}
			{page === "security" && <SecurityPage />}
			{page === "notfound" && <NotFoundPage />}
			{page === "app" && <AppLanding />}
		</ErrorBoundary>
	);
}

export default App;
