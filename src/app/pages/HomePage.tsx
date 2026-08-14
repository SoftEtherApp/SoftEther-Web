/* ════════════════════════════════════
   SoftEther App — Main Landing Page
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
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
const PLATFORM_META: Record<string, { name: string; icon: string; group: string; pkg: string; variant: string; arch: string }> = {
	android: { name: "Android", icon: "logo-android", group: "Android", pkg: ".apk", variant: "Installer", arch: "arm64" },
	"android-armv7": { name: "Android (32-bit)", icon: "logo-android", group: "Android", pkg: ".apk", variant: "32-bit", arch: "armv7" },
	"macos-aarch64": { name: "macOS (Apple Silicon)", icon: "logo-apple", group: "macOS", pkg: ".dmg", variant: "Installer", arch: "arm64" },
	"macos-x64": { name: "macOS (Intel)", icon: "logo-apple", group: "macOS", pkg: ".dmg", variant: "Installer", arch: "x64" },
	windows: { name: "Windows", icon: "logo-windows", group: "Windows", pkg: ".msi", variant: "Installer", arch: "x64" },
	"windows-portable": { name: "Windows (Portable)", icon: "logo-windows", group: "Windows", pkg: ".zip", variant: "Portable", arch: "x64" },
	linux: { name: "Linux", icon: "logo-linux", group: "Linux", pkg: ".deb", variant: "Package", arch: "x64" },
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

function variantFor(platform: string): string {
	return PLATFORM_META[platform]?.variant ?? "Installer";
}

function pkgFor(asset: ReleaseAsset): string {
	if (PLATFORM_META[asset.platform]) return PLATFORM_META[asset.platform].pkg;
	const m = asset.name.match(/\.([a-z0-9]+)$/i);
	return m ? `.${m[1].toLowerCase()}` : "Package";
}

/* Derive an architecture label from the platform id; unknown ones that carry
   no architecture signal return null so the chip is omitted. */
function archFor(platform: string): string | null {
	if (PLATFORM_META[platform]) return PLATFORM_META[platform].arch;
	if (/aarch64|arm64|armv8/i.test(platform)) return "arm64";
	if (/armv7|armhf|armeabi-v7a/i.test(platform)) return "armv7";
	if (/amd64|x86_64|win64/i.test(platform)) return "x64";
	if (/x86|i386|i686|win32/i.test(platform)) return "x86";
	return null;
}

/* Canonical per-group order — primary variant first (e.g. 64-bit before
   32-bit, installer before portable). Unknown platforms sort last. */
const PLATFORM_ORDER = [
	"android",
	"android-armv7",
	"macos-aarch64",
	"macos-x64",
	"windows",
	"windows-portable",
	"linux",
];

function platformSortKey(platform: string): number {
	const idx = PLATFORM_ORDER.indexOf(platform);
	return idx === -1 ? PLATFORM_ORDER.length : idx;
}

/* Group release assets by platform group, known groups first, then any
   additional groups in order of first appearance — never skip an asset.
   Within a group, assets follow PLATFORM_ORDER then name. */
function groupAssets(assets: ReleaseAsset[]): Array<{ group: string; items: ReleaseAsset[] }> {
	const map = new Map<string, ReleaseAsset[]>();
	for (const a of assets) {
		const g = groupFor(a.platform);
		if (!map.has(g)) map.set(g, []);
		map.get(g)!.push(a);
	}
	for (const items of map.values()) {
		items.sort(
			(a, b) =>
				platformSortKey(a.platform) - platformSortKey(b.platform) ||
				a.name.localeCompare(b.name),
		);
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
