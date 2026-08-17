/* ════════════════════════════════════
   Changelog — release history from the
   worker API (KV-backed release metadata)
   ════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import { Alert, Skeleton } from "@devstroop/react-ui";
import { useScrollToHash } from "../hooks/useScrollToHash";
import Icon from "../components/Icon";
import ReleaseNotes from "../lib/ReleaseNotes";

interface ReleaseSummary {
	tag: string;
	version: string;
	publishedAt: string;
	assetCount: number;
}

interface Release {
	tag: string;
	version: string;
	publishedAt: string;
	body?: string;
	assets: { name: string }[];
}

// Shared with the download section — one cache key for the whole site.
const CACHE_KEY = "cache:releases:latest";

export default function ChangelogPage(): JSX.Element {
	useScrollToHash(200);

	const [latest, setLatest] = useState<Release | null>(null);
	const [history, setHistory] = useState<ReleaseSummary[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [historyError, setHistoryError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		setHistoryError(null);

		// Last-known latest release — 5-minute local cache, same as the
		// download section. A corrupt or unreadable cache is not an error.
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (cached) {
				const { data, ts } = JSON.parse(cached);
				if (Date.now() - ts < 300_000) setLatest(data);
			}
		} catch { /* ignore corrupt cache */ }

		// Fetch latest release notes and the version history INDEPENDENTLY:
		// a failure in one must never hide the other.
		try {
			const resp = await fetch("/api/releases/latest");
			if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
			const data: Release = await resp.json();
			setLatest(data);
			// Cache write is best-effort and isolated: hitting the quota or
			// storage being disabled must not mask a successful fetch.
			try {
				localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
			} catch { /* non-fatal: cache is an optimization */ }
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load releases");
		}

		try {
			const resp = await fetch("/api/releases");
			if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
			setHistory(await resp.json());
		} catch (err) {
			// Latest still rendered above — surface the partial failure as a
			// muted notice instead of dropping the whole page into an error.
			setHistoryError(err instanceof Error ? err.message : "Failed to load release history");
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	return (
		<section className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Changelog</h1>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					Release notes for the SoftEther App. Installers for every platform live on the{" "}
					<a href="/download" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>
						Downloads page
					</a>.
				</p>

				{error && (
					<Alert tone="danger" title="Could not load releases" className="mb-lg">
						<p className="m-0 fs-sm">{error}</p>
						<button
							type="button"
							className="btn btn-secondary mt-sm"
							onClick={() => { setLoading(true); setError(null); load(); }}
						>
							Retry
						</button>
					</Alert>
				)}

				{loading && !latest && (
					<div className="download-list">
						<div className="dl-group">
							<Skeleton variant="text" width="25%" className="mb-sm" />
							<ul className="asset-list" aria-hidden="true">
								{[0, 1, 2].map((i) => (
									<li key={i} className="asset-row">
										<Skeleton variant="rect" width={44} height={44} />
										<div className="asset-info">
											<Skeleton variant="text" width="60%" className="mb-xs" />
											<Skeleton variant="text" width="40%" />
										</div>
										<Skeleton variant="rect" width={72} height={28} />
									</li>
								))}
							</ul>
						</div>
					</div>
				)}

				{latest && (
					<article className="trust-card">
						<header className="trust-card-head">
							<h2 className="trust-card-title">
								<Icon name="tag" size={16} />
								{latest.tag}
							</h2>
							<span className="trust-card-meta">
								{new Date(latest.publishedAt).toLocaleDateString()} ·{" "}
								{latest.assets.length} binaries
							</span>
						</header>
						{latest.body ? (
							<ReleaseNotes body={latest.body} className="dl-notes dl-notes--full" lineClassName="dl-notes-line" />
						) : (
							<p className="trust-p">No release notes published for this version.</p>
						)}
					</article>
				)}

				{historyError && (
					<Alert tone="info">
						Release history could not be loaded ({historyError}). The latest release above is still current.
					</Alert>
				)}

				{history && history.length > 0 && (
					<div className="trust-list">
						<h2 className="trust-h">Previous releases</h2>
						{(() => {
							// Exclude the CURRENT release — via the fetched latest
							// if present, else the freshest known tag (history[0]),
							// so a partial failure (latest fetch down) cannot
							// mislabel the current release as "previous".
							const excludeTag = latest?.tag ?? history[0].tag;
							return history.filter((r) => r.tag !== excludeTag).map((r) => (
								<div key={r.tag} className="trust-list-row">
									<span className="trust-list-title">{r.tag}</span>
									<span className="trust-list-meta">
										{new Date(r.publishedAt).toLocaleDateString()} · {r.assetCount} binaries
									</span>
								</div>
							));
						})()}
					</div>
				)}
			</div>
		</section>
	);
}
