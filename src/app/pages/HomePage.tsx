/* ════════════════════════════════════
   SoftEther App — Main Landing Page
   ════════════════════════════════════ */

import { Fragment, useState, type JSX } from "react";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { useLatestRelease } from "../hooks/useLatestRelease";
import type { Release, ReleaseAsset } from "../../shared/types";
import Icon from "../components/Icon";
import HeroIllustration from "../components/HeroIllustration";
import ReleaseNotes from "../lib/ReleaseNotes";

/* ── Types ── */

/* ── Data ── */

interface Feature {
	title: string;
	desc: string;
	icon: string;
}

const FEATURES: Feature[] = [
	{
		title: "Multi-Profile",
		desc: "Manage multiple VPN configurations simultaneously. Switch between work, home, and custom profiles with one tap.",
		icon: "layers",
	},
	{
		title: "Native",
		desc: "Tunnel your traffic through a lean, fast native engine with minimal overhead.",
		icon: "zap",
	},
	{
		title: "Cross-Platform",
		desc: "Runs on Android, macOS, Windows, and Linux from a shared Flutter codebase.",
		icon: "monitor",
	},
	{
		title: "Self-Hosted",
		desc: "Bring your own SoftEther server. No vendor lock-in, no subscription, no data leaving your control.",
		icon: "server",
	},
	{
		title: "Lightweight",
		desc: "Built on a lean native library — minimal overhead, maximum throughput for your tunnel.",
		icon: "cpu",
	},
	{
		title: "Modern UI",
		desc: "Material 3 design with dark theme, glass-morphism surfaces, and smooth animations.",
		icon: "palette",
	},
];

/* ── Helpers ── */

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* Display metadata for known platforms — purely cosmetic, never a whitelist.
   Any asset platform not listed here still renders via the fallbacks below. */
const PLATFORM_META: Record<string, { name: string; icon: string; group: string; meta: string }> = {
	android: { name: "Android", icon: "logo-android", group: "Android", meta: "APK (64-bit)" },
	"android-armv7": { name: "Android (32-bit)", icon: "logo-android", group: "Android", meta: "APK (32-bit)" },
	"macos-aarch64": { name: "macOS (Apple Silicon)", icon: "logo-apple", group: "macOS", meta: ".dmg" },
	"macos-x64": { name: "macOS (Intel)", icon: "logo-apple", group: "macOS", meta: ".dmg" },
	windows: { name: "Windows", icon: "logo-windows", group: "Windows", meta: ".msi" },
	"windows-portable": { name: "Windows (Portable)", icon: "logo-windows", group: "Windows", meta: ".zip" },
	linux: { name: "Linux", icon: "logo-linux", group: "Linux", meta: ".deb" },
};

const KNOWN_GROUPS = ["Android", "macOS", "Windows", "Linux"];

/* Marketing chips for the "Available Everywhere" section — static by design. */
const PLATFORM_CHIPS = [
	{ name: "Android", icon: "logo-android" },
	{ name: "macOS", icon: "logo-apple" },
	{ name: "Windows", icon: "logo-windows" },
	{ name: "Linux", icon: "logo-linux" },
];

function groupFor(platform: string): string {
	return PLATFORM_META[platform]?.group ?? "Other";
}

function displayNameFor(platform: string): string {
	if (PLATFORM_META[platform]) return PLATFORM_META[platform].name;
	return platform.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function iconFor(platform: string): string {
	return PLATFORM_META[platform]?.icon ?? "package";
}

function metaFor(asset: ReleaseAsset): string {
	return PLATFORM_META[asset.platform]?.meta ?? asset.name;
}

/* Group release assets by platform group, known groups first, then any
   additional groups in order of first appearance — never skip an asset. */
function groupAssets(assets: ReleaseAsset[]): Array<{ group: string; items: ReleaseAsset[] }> {
	const map = new Map<string, ReleaseAsset[]>();
	for (const a of assets) {
		const g = groupFor(a.platform);
		if (!map.has(g)) map.set(g, []);
		map.get(g)!.push(a);
	}
	const present = [...map.keys()];
	const ordered = [...KNOWN_GROUPS.filter((g) => present.includes(g)), ...present.filter((g) => !KNOWN_GROUPS.includes(g))];
	return ordered.map((g) => ({ group: g, items: map.get(g)! }));
}

function Hero({ release }: { release: Release | null }) {
	return (
		<section className="hero">
			<div className="hero-bg" />
			<div className="hero-inner">
				<div className="hero-text">
					{release && (
						<span className="hero-release-badge">
							<Icon name="tag" size={12} />
							Latest release {release.tag}
						</span>
					)}
					<h1 className="hero-title">
						<span className="hero-accent">Modern <br />Cross-Platform</span>
						<br />
						SoftEther VPN Client
					</h1>
					<p className="hero-desc">
						A self-managed SoftEther VPN client that runs on all your devices.
						Private, open transport, and yours to control.
					</p>
					<div className="hero-actions d-flex gap-md flex-wrap justify-start mb-lg md:justify-center">
						<a href="#download" className="btn btn-primary">
							Download App
						</a>
						<a href="/library" className="btn btn-secondary">
							<Icon name="code" size={20} />
							Open-Source Library
						</a>
					</div>
					<div className="hero-trust d-flex items-start gap-sm text-muted fs-xs text-balance mw-560 md:justify-center">
										<Icon name="code" size={14} />
										<span>
											Built with{" "}
											<a href="/library" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>
												SoftEtherZig
											</a>
											. The engine is open source (Apache-2.0); the app binary is freeware.
										</span>
									</div>
				</div>
				<div className="hero-visual">
					<HeroIllustration size={500} />
				</div>
			</div>
		</section>
	);
}

function FeaturesSection() {
	return (
		<section id="features" className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h2 className="mb-sm text-center fw-700 fs-lg text-primary">Modern SoftEther for Every Device</h2>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					The official SoftEther VPN has clients for Windows, Mac, and Linux
				but mobile and a unified cross-platform experience were always
				missing. SoftEther App fills that gap, built from scratch for
				Android, macOS, Windows, and Linux from a shared codebase.
				</p>
				<div className="features-grid">
					{FEATURES.map((f) => (
						<article key={f.title} className="feature-card">
							<div className="feature-icon">
								<Icon name={f.icon} size={28} />
							</div>
							<h3 className="feature-title">{f.title}</h3>
							<p className="feature-desc">{f.desc}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function PlatformsSection() {
	return (
		<section id="platforms" className="py-2xl px-lg bg-surface-800 sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h2 className="mb-sm text-center fw-700 fs-lg text-primary">Available Everywhere</h2>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					Run on your desktop, take it on the go — same app, same experience.
				</p>
				<div className="platforms-row">
					{PLATFORM_CHIPS.map((p) => (
						<div key={p.name} className="platform-chip">
							<Icon name={p.icon} size={22} />
							<span>{p.name}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function DownloadSection({
	release,
	loading,
	error,
	reload,
}: {
	release: Release | null;
	loading: boolean;
	error: string | null;
	reload: () => void;
}) {
	const [showNotes, setShowNotes] = useState(false);

	return (
		<section id="download" className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h2 className="mb-sm text-center fw-700 fs-lg text-primary">Get Started</h2>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					Download the latest release for your platform.
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
							{[0, 1, 2].map((i) => (
								<div key={i} className="download-card">
									<div className="skeleton skeleton-icon" />
									<div className="download-info">
										<div className="skeleton skeleton-line skeleton-line--title" />
										<div className="skeleton skeleton-line skeleton-line--meta" />
									</div>
									<div className="skeleton skeleton-badge" />
								</div>
							))}
						</>
					)}
					{release && !loading && groupAssets(release.assets).map(({ group, items }) => (
						<Fragment key={group}>
							<h3 className="download-group-title">{group}</h3>
							{items.map((asset) => {
								const name = displayNameFor(asset.platform);
								return (
									<a
										key={asset.r2Key}
										href={asset.downloadUrl}
										className="download-card download-card--live"
										target="_blank"
										rel="noopener noreferrer"
									>
										<div className="download-icon">
											<Icon name={iconFor(asset.platform)} size={28} />
										</div>
										<div className="download-info">
											<h4>{name}</h4>
											<span className="download-meta">{metaFor(asset)}</span>
										</div>
										<span className="download-size">{formatSize(asset.size)}</span>
										<span className="download-badge">Download</span>
									</a>
								);
							})}
						</Fragment>
					))}
					{release && !loading && release.assets.length === 0 && (
						<p className="m-0 py-xl text-center text-muted fs-sm">
							No installers are available yet for the latest release.
						</p>
					)}
				</div>
			</div>
		</section>
	);
}

/* ── Page ── */

const STEPS = [
	{
		num: 1,
		title: "Download the App",
		desc: "Choose your platform above and grab the latest release — no sign-up required.",
	},
	{
		num: 2,
		title: "Add Your Server",
		desc: "Enter your SoftEther server's hostname, port, and credentials. The app supports advanced settings like QoS, NAT traversal, and certificate verification.",
	},
	{
		num: 3,
		title: "Connect & Go",
		desc: "Tap to connect. Your traffic is now tunneled through your own encrypted VPN — private, secure, and self-managed.",
	},
];

function GetConnectedSection() {
	return (
		<section className="py-2xl px-lg bg-surface-800 sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h2 className="mb-sm text-center fw-700 fs-lg text-primary">Get Connected in 3 Steps</h2>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					From zero to secure tunnel in a few clicks. No accounts, no subscriptions — just your own server.
				</p>
				<div className="steps-list">
					{STEPS.map((s) => (
						<div key={s.num} className="step-card">
							<span className="step-number">{s.num}</span>
							<div className="step-content">
								<h3 className="step-title">{s.title}</h3>
								<p className="step-desc">{s.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export default function HomePage(): JSX.Element {
	useScrollToHash(100);
	const { release, loading, error, reload } = useLatestRelease();

	return (
		<>
			<Hero release={release} />
			<FeaturesSection />
			<PlatformsSection />
			<GetConnectedSection />
			<DownloadSection release={release} loading={loading} error={error} reload={reload} />
		</>
	);
}
