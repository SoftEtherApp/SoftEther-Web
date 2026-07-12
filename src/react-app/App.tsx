/* ══════════════════════════════════════════════════
   SoftEther App — Multi-Page SPA Router
   ══════════════════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import "./App.css";
import AppLanding from "./pages/AppLanding";
import LibraryLanding from "./pages/LibraryLanding";

type Page = "app" | "library" | "loading";

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

function getPage(): Page {
	const p = window.location.pathname;
	if (p === "/library" || p === "/library/") return "library";
	return "app";
}

function App(): JSX.Element {
	const [page, setPage] = useState<Page>("loading");

	const sync = useCallback(() => {
		const p = getPage();
		setPage(p);
		document.title = p === "library" ? "SoftEtherZig — Open-Source VPN Library" : "SoftEther App — Modern Cross-Platform VPN Client";
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

	if (page === "loading") return <></>;

	return page === "library" ? <LibraryLanding /> : <AppLanding />;
}

export default App;
