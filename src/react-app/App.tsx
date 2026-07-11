/* ════════════════════════════════════════════════
   SoftEther App — Multi-Page SPA Router
   ════════════════════════════════════════════════ */

import { lazy, Suspense, useCallback, useEffect, useState, type JSX } from "react";
import "./App.css";

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
		setPage(getPage());
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

	const PageComponent = lazy(() => {
		if (page === "library") return import("./pages/LibraryLanding");
		return import("./pages/AppLanding");
	});

	return (
		<Suspense fallback={null}>
			<PageComponent />
		</Suspense>
	);
}

export default App;
