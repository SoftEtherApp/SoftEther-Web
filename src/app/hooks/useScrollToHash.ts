/* ════════════════════════════════════
   Scroll to hash on mount (shared by all pages)
   ════════════════════════════════════ */

import { useEffect } from "react";

export function useScrollToHash(delay = 100) {
	useEffect(() => {
		const hash = window.location.hash;
		if (hash) {
			const el = document.getElementById(hash.slice(1));
			if (el) {
				setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), delay);
			}
		}
	}, [delay]);
}
