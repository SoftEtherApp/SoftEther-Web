/* ════════════════════════════════════
   useLatestRelease — fetch the latest release from
   the worker with a 5-minute localStorage cache.
   Shared by the hero badge and the download section.
   ════════════════════════════════════ */

import { useEffect, useState } from "react";
import type { Release } from "../../shared/types";

const CACHE_KEY = "cache:releases:latest";
const TTL_MS = 5 * 60 * 1000;

export function useLatestRelease(): {
	release: Release | null;
	loading: boolean;
	error: string | null;
	reload: () => void;
} {
	const [release, setRelease] = useState<Release | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [nonce, setNonce] = useState(0);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError(null);

			try {
				const cached = localStorage.getItem(CACHE_KEY);
				if (cached) {
					const { data, ts } = JSON.parse(cached);
					if (Date.now() - ts < TTL_MS) {
						if (!cancelled) setRelease(data);
						if (!cancelled) setLoading(false);
						return;
					}
				}
			} catch {
				/* ignore corrupt cache */
			}

			try {
				const r = await fetch("/api/releases/latest");
				if (!r.ok) throw new Error(`Server returned ${r.status}`);
				const data = (await r.json()) as Release;
				if (data) {
					localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
				}
				if (!cancelled) setRelease(data);
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load releases");
			}
			if (!cancelled) setLoading(false);
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [nonce]);

	return { release, loading, error, reload: () => setNonce((n) => n + 1) };
}
