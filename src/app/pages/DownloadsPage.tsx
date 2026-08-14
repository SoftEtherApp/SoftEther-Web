/* ════════════════════════════════════
   Downloads — installers for each platform
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
import { useLatestRelease } from "../hooks/useLatestRelease";
import { groupAssets, displayNameFor, iconFor, variantFor, pkgFor, archFor, formatSize } from "../lib/downloads";
import Icon from "../components/Icon";
import ReleaseNotes from "../lib/ReleaseNotes";

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
					{loading && (
						<>
							<div className="skeleton skeleton-line skeleton-line--title" />
							<div className="dl-grid">
								{[0, 1, 2].map((i) => (
									<div key={i} className="dl-card">
										<div className="skeleton skeleton-icon" />
										<div className="skeleton skeleton-line skeleton-line--title" />
										<div className="skeleton skeleton-line skeleton-line--meta" />
										<div className="skeleton skeleton-badge" />
									</div>
								))}
							</div>
						</>
					)}

					{release && !loading && groupAssets(release.assets).map(({ group, items }) => (
						<div className="dl-group" key={group}>
							<h3 className="download-group-title">{group}</h3>
							<div className="dl-grid">
								{items.map((asset) => {
									const arch = archFor(asset.platform);
									const variant = variantFor(asset.platform);
									return (
										<a
											key={asset.r2Key}
											href={asset.downloadUrl}
											className={`dl-card dl-card--live${variant === "Portable" ? " dl-card--portable" : ""}`}
											target="_blank"
											rel="noopener noreferrer"
										>
											<div className="dl-card-head">
												<span className="dl-card-icon">
													<Icon name={iconFor(asset.platform)} size={22} />
												</span>
												<div className="dl-card-title">
													<h4>{displayNameFor(asset.platform)}</h4>
													<span className="dl-card-sub">
														{variant} &middot; {formatSize(asset.size)}
													</span>
												</div>
												<span className="dl-card-pkg">{pkgFor(asset)}</span>
												{arch && <span className="dl-card-arch">{arch}</span>}
											</div>
											<span className="dl-card-cta">
												<Icon name="download" size={15} />
												Download
											</span>
										</a>
									);
								})}
							</div>
						</div>
					))}
					{release && !loading && release.assets.length === 0 && (
						<p className="m-0 py-xl text-center text-muted fs-sm">
							No installers are available yet for the latest release.
						</p>
					)}
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
