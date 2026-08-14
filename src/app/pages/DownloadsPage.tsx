/* ════════════════════════════════════
   Downloads — installers for each platform
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
import { useLatestRelease } from "../hooks/useLatestRelease";
import { groupAssets, displayNameFor, iconFor, variantFor, archFor, formatSize, KNOWN_GROUPS } from "../lib/downloads";
import Icon from "../components/Icon";
import ReleaseNotes from "../lib/ReleaseNotes";

/* Rows are rendered as a GitHub-style release asset list: icon + identity
   + size, with the download action on the right. */
function AssetRow({ asset }: { asset: { name: string; platform: string; size: number; downloadUrl: string; r2Key: string } }) {
	const arch = archFor(asset.platform);
	const variant = variantFor(asset.platform);

	return (
		<li className="asset-row">
			<span className="asset-icon">
				<Icon name={iconFor(asset.platform)} size={20} />
			</span>
			<div className="asset-info">
				<span className="asset-title">
					<span className="asset-title-name">{displayNameFor(asset.platform)}</span>
					{variant !== "Installer" && <span className="asset-chip">{variant}</span>}
					{arch && <span className="asset-chip asset-chip--arch">{arch}</span>}
				</span>
				<span className="asset-file">{asset.name}</span>
			</div>
			<span className="asset-size">{formatSize(asset.size)}</span>
			<a
				className="btn btn-primary btn-sm asset-dl"
				href={asset.downloadUrl}
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon name="download" size={14} />
				Download
			</a>
		</li>
	);
}

/* Loading skeleton mirrors the final layout — one group block per known
   platform so the page keeps its height instead of collapsing. */
function Skeleton() {
	return (
		<>
			<div className="dl-group">
				<div className="skeleton skeleton-line skeleton-line--title skeleton-line--sm" />
				<ul className="asset-list" aria-hidden="true">
					{[0, 1, 2].map((i) => (
						<li key={i} className="asset-row">
							<div className="skeleton skeleton-icon" />
							<div className="asset-info">
								<div className="skeleton skeleton-line skeleton-line--title" />
								<div className="skeleton skeleton-line skeleton-line--meta" />
							</div>
							<div className="skeleton skeleton-badge" />
						</li>
					))}
				</ul>
			</div>
			{KNOWN_GROUPS.slice(1).map((group) => (
				<div className="dl-group" key={group}>
					<div className="skeleton skeleton-line skeleton-line--sm" />
					<ul className="asset-list" aria-hidden="true">
						{[0, 1].map((i) => (
							<li key={i} className="asset-row">
								<div className="skeleton skeleton-icon" />
								<div className="asset-info">
									<div className="skeleton skeleton-line skeleton-line--title" />
									<div className="skeleton skeleton-line skeleton-line--meta" />
								</div>
								<div className="skeleton skeleton-badge" />
							</li>
						))}
					</ul>
				</div>
			))}
		</>
	);
}

export default function DownloadsPage(): JSX.Element {
	const [showNotes, setShowNotes] = useState(false);
	const { release, loading, error, reload } = useLatestRelease();

	return (
		<section id="download" className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Downloads</h1>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					Download the latest release for your platform. No sign-up required.
				</p>

				{release && (
					<div className="dl-version">
						<Icon name="tag" size={14} />
						<span>{release.tag}</span>
						<span className="dl-version-sep">&middot;</span>
						<span>{new Date(release.publishedAt).toLocaleDateString()}</span>
						<button
							className="dl-notes-toggle"
							onClick={() => setShowNotes(!showNotes)}
							aria-expanded={showNotes ? "true" : "false"}
						>
							<Icon name={showNotes ? "chevron-up" : "chevron-down"} size={14} />
							{showNotes ? "Hide" : "View"} release notes
						</button>
					</div>
				)}
				{release && showNotes && release.body && (
					<ReleaseNotes body={release.body} className="dl-notes" lineClassName="dl-notes-line" />
				)}

				{error && (
					<div className="download-error">
						<div className="download-error-content">
							<span className="download-error-icon">!</span>
							<div>
								<p className="download-error-title">Could not load releases</p>
								<p className="download-error-desc">{error}</p>
							</div>
						</div>
						<button className="btn btn-secondary" onClick={reload}>
							Retry
						</button>
					</div>
				)}

				<div className="download-list">
					{loading && <Skeleton />}

					{release && !loading && release.assets.length === 0 && (
						<div className="download-empty">
							<span className="download-empty-icon">
								<Icon name="package" size={32} />
							</span>
							<h3 className="download-empty-title">No downloads available yet</h3>
							<p className="download-empty-desc">
								Installers for <strong>{release.tag}</strong> haven't been published yet.
								Check back soon — or refresh in case you just missed them.
							</p>
							<button className="btn btn-secondary" onClick={reload}>
								Check again
							</button>
						</div>
					)}

					{release &&
						!loading &&
						groupAssets(release.assets).map(({ group, items }) => (
							<div className="dl-group" key={group}>
								<h3 className="download-group-title">{group}</h3>
								<ul className="asset-list">
									{items.map((asset) => (
										<AssetRow key={asset.r2Key} asset={asset} />
									))}
								</ul>
							</div>
						))}
				</div>

				<div className="d-flex justify-center mt-2xl">
					<a href="/" className="btn btn-secondary">
						<Icon name="arrow-left" size={18} />
						Back to Home
					</a>
				</div>
			</div>
		</section>
	);
}
