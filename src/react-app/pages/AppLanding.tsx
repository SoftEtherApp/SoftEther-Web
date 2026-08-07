/* ════════════════════════════════════
   SoftEther App — Main Landing Page
   ════════════════════════════════════ */

import { useEffect, useState, type JSX } from "react";
import { useScrollToHash } from "../hooks/useScrollToHash";
import type { Release, ReleaseAsset } from "../../shared/types";
import Icon from "../components/Icon";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroIllustration from "../components/HeroIllustration";
import ReleaseNotes from "../lib/ReleaseNotes";

/* ── Types ── */

interface PlatformInfo {
	name: string;
	icon: string;
	meta: string;
	platform: string; // matches worker's detectPlatform() output
}

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

const PLATFORMS: PlatformInfo[] = [
	{ name: "Android", icon: "logo-android", meta: "APK (64-bit)", platform: "android" },
	{ name: "Android (32-bit)", icon: "logo-android", meta: "APK (32-bit)", platform: "android-armv7" },
	{ name: "macOS (Apple Silicon)", icon: "logo-apple", meta: ".dmg", platform: "macos-aarch64" },
	{ name: "macOS (Intel)", icon: "logo-apple", meta: ".dmg", platform: "macos-x64" },
	{ name: "Windows", icon: "logo-windows", meta: ".msi", platform: "windows" },
	{ name: "Windows (Portable)", icon: "logo-windows", meta: ".zip", platform: "windows-portable" },
	{ name: "Linux", icon: "logo-linux", meta: ".deb", platform: "linux" },
];

/* ── Helpers ── */

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* Pick the best asset for a platform.
   With separate platform slots (android, android-armv7, windows, windows-portable),
   each slot maps to exactly one asset type so direct match is sufficient. */
function pickAsset(assets: ReleaseAsset[], platform: string): ReleaseAsset | undefined {
	const matches = assets.filter((a) => a.platform === platform);
	if (matches.length === 0) return undefined;
	// Prefer "App"-branded files (e.g. "SoftEther-App-..." over generic)
	const appBranded = matches.filter((a) => /app/i.test(a.name));
	return (appBranded.length > 0 ? appBranded : matches)[0];
}

function Hero() {
	return (
		<section className="hero">
			<div className="hero-bg" />
			<div className="hero-inner">
				<div className="hero-text">
					<h1 className="hero-title">
						<span className="hero-accent">Modern <br />Cross-Platform</span>
						<br />
						SoftEther VPN Client
					</h1>
					<p className="hero-desc">
						A self-managed SoftEther VPN client that runs on all your devices.
						Private, open transport, and yours to control.
					</p>
					<div className="hero-actions">
						<a href="#download" className="btn btn-primary">
							Download App
						</a>
						<a href="/library" className="btn btn-secondary">
							<Icon name="code" size={20} />
							Open-Source Library
						</a>
					</div>
					<div className="hero-trust">
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
		<section id="features" className="section">
			<div className="section-inner">
				<h2 className="section-title">Modern SoftEther for Every Device</h2>
				<p className="section-desc">
					The official SoftEther VPN has clients for Windows, Mac, and Linux
				��� but mobile and a unified cross-platform experience were always
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
		<section id="platforms" className="section section-alt">
			<div className="section-inner">
				<h2 className="section-title">Available Everywhere</h2>
				<p className="section-desc">
					Run on your desktop, take it on the go — same app, same experience.
				</p>
				<div className="platforms-row">
					{PLATFORMS.map((p) => (
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

function DownloadSection() {
	const [release, setRelease] = useState<Release | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showNotes, setShowNotes] = useState(false);

	async function fetchRelease() {
		setLoading(true);
		setError(null);
		// localStorage cache with 5-min TTL
		const cacheKey = "cache:releases:latest";
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const { data, ts } = JSON.parse(cached);
				if (Date.now() - ts < 300_000) {
					setRelease(data);
					setLoading(false);
					return;
				}
			}
		} catch { /* ignore corrupt cache */ }

		try {
			const r = await fetch("/api/releases/latest");
			if (!r.ok) throw new Error(`Server returned ${r.status}`);
			const data = await r.json();
			if (data) {
				localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
			}
			setRelease(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load releases");
		}
		setLoading(false);
	}

	useEffect(() => {
		fetchRelease();
	}, []);

	return (
		<section id="download" className="section">
			<div className="section-inner">
				<h2 className="section-title">Get Started</h2>
				<p className="section-desc">
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
						<button className="btn btn-secondary" onClick={() => { setLoading(true); setError(null); fetchRelease(); }}>
							Retry
						</button>
					</div>
				)}
				<div className="download-list">
					{PLATFORMS.map((p) => {
						const asset = release ? pickAsset(release.assets, p.platform) : undefined;
						const isComing = !asset && !loading;

						if (!asset && loading) {
							return (
								<div key={p.name} className="download-card">
									<div className="skeleton skeleton-icon" />
									<div className="download-info">
										<div className="skeleton skeleton-line skeleton-line--title" />
										<div className="skeleton skeleton-line skeleton-line--meta" />
									</div>
									<div className="skeleton skeleton-badge" />
								</div>
							);
						}

						if (isComing) {
							return (
								<div key={p.name} className="download-card download-card--dim">
									<div className="download-icon">
										<Icon name={p.icon} size={28} />
									</div>
									<div className="download-info">
										<h3>{p.name}</h3>
										<span className="download-meta">{p.meta}</span>
									</div>
									<span className="download-tag">Coming soon</span>
								</div>
							);
						}

						return (
							<a
								key={p.name}
								href={asset!.downloadUrl}
								className="download-card download-card--live"
								target="_blank"
								rel="noopener noreferrer"
							>
								<div className="download-icon">
									<Icon name={p.icon} size={28} />
								</div>
								<div className="download-info">
									<h3>{p.name}</h3>
									<span className="download-meta">{p.meta}</span>
								</div>
								<span className="download-size">{formatSize(asset!.size)}</span>
								<span className="download-badge">Download</span>
							</a>
						);
					})}
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
		<section className="section section-alt">
			<div className="section-inner">
				<h2 className="section-title">Get Connected in 3 Steps</h2>
				<p className="section-desc">
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

export default function AppLanding(): JSX.Element {
	useScrollToHash(100);

	return (
		<>
			<Header />
			<a href="#main-content" className="skip-link">Skip to content</a>
			<main id="main-content">
				<Hero />
				<FeaturesSection />
				<PlatformsSection />
				<GetConnectedSection />
				<DownloadSection />
			</main>
			<Footer />
		</>
	);
}
