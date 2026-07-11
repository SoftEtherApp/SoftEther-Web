/* ════════════════════════════════════
   SoftEther App — Main Landing Page
   ════════════════════════════════════ */

import { useEffect, type JSX } from "react";
import Icon from "../components/Icon";
import Footer from "../components/Footer";
import Header from "../components/Header";

/* ── Data ── */

interface Feature {
	title: string;
	desc: string;
	icon: string;
}

interface Platform {
	name: string;
	icon: string;
}

const FEATURES: Feature[] = [
	{
		title: "Multi-Profile",
		desc: "Manage multiple VPN configurations simultaneously. Switch between work, home, and custom profiles with one tap.",
		icon: "layers",
	},
	{
		title: "Native Performance",
		desc: "Tunnel your traffic through a lean, fast native engine with minimal overhead.",
		icon: "zap",
	},
	{
		title: "Cross-Platform",
		desc: "Runs on Android, iOS, macOS, Windows, and Linux from a shared Flutter codebase.",
		icon: "monitor",
	},
	{
		title: "Self-Managed",
		desc: "Bring your own SoftEther server. No vendor lock-in, no subscription, no data leaving your control.",
		icon: "server",
	},
	{
		title: "Fast & Light",
		desc: "Built on a lean native library — minimal overhead, maximum throughput for your tunnel.",
		icon: "zap",
	},
	{
		title: "Open Trust",
		desc: "Built with SoftEtherZig, an open-source VPN library you can inspect, verify, and rely on.",
		icon: "code",
	},
	{
		title: "Modern UI",
		desc: "Material 3 design with dark theme, glass-morphism surfaces, and smooth animations.",
		icon: "palette",
	},
];

const PLATFORMS: Platform[] = [
	{ name: "Android", icon: "logo-android" },
	{ name: "iOS", icon: "logo-apple" },
	{ name: "macOS", icon: "logo-apple" },
	{ name: "Windows", icon: "logo-windows" },
	{ name: "Linux", icon: "logo-linux" },
];


/* ── Components ── */

function Hero() {
	return (
		<section className="hero">
			<div className="hero-bg" />
			<div className="hero-content">
				<div className="hero-badge">v0.3.0 — Built with SoftEtherZig</div>
				<h1 className="hero-title">
					<span className="hero-accent">
						#Modern
						<br />
						#Cross-Platform
					</span>
					<br />
					SoftEther VPN Client
				</h1>
				<p className="hero-desc">
					Manage your own SoftEther VPN server from any device. Self-hosted,
					private, and built for mobile and desktop alike.
				</p>
				<div className="hero-actions">
					<a href="#download" className="btn btn-primary">
						Download App
					</a>
					<a href="/library" className="btn btn-secondary">
						<Icon name="code" size={20} />
						Get Library
					</a>
				</div>
			</div>
		</section>
	);
}

function FeaturesSection() {
	return (
		<section id="features" className="section">
			<div className="section-inner">
				<h2 className="section-title">The First Modern SoftEther VPN Client</h2>
				<p className="section-desc">
					The SoftEther ecosystem never had a clean, modern mobile client \u2014
					until now. SoftEther App is built from scratch for Android, iOS, macOS,
					Windows, and Linux, with the same experience everywhere.
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

function LibraryPromo() {
	return (
		<section className="section section-alt">
			<div className="section-inner">
				<div className="library-promo-card">
					<p className="section-desc" style={{ margin: 0 }}>
						Every connection runs on{" "}
						<a href="/library" style={{ color: "var(--indigo-400)", fontWeight: 500 }}>
							SoftEtherZig
						</a>
						, an open-source VPN library.
					</p>
				</div>
			</div>
		</section>
	);
}

function DownloadSection() {
	return (
		<section id="download" className="section">
			<div className="section-inner">
				<h2 className="section-title">Get Started</h2>
				<p className="section-desc">
					Download the latest release for your platform. Available via app stores
					and direct download.
				</p>
				<div className="download-list">
					<div className="download-card" style={{ cursor: "default", opacity: 0.8 }}>
						<div className="download-icon">
							<Icon name="logo-android" size={28} />
						</div>
						<div className="download-info">
							<h3>Android</h3>
							<span className="download-meta">Google Play &middot; Direct APK</span>
						</div>
						<span className="download-meta">Coming soon</span>
					</div>
					<div className="download-card" style={{ cursor: "default", opacity: 0.8 }}>
						<div className="download-icon">
							<Icon name="logo-apple" size={28} />
						</div>
						<div className="download-info">
							<h3>iOS</h3>
							<span className="download-meta">App Store &middot; TestFlight</span>
						</div>
						<span className="download-meta">Coming soon</span>
					</div>
					<div className="download-card" style={{ cursor: "default", opacity: 0.8 }}>
						<div className="download-icon">
							<Icon name="logo-apple" size={28} />
						</div>
						<div className="download-info">
							<h3>macOS</h3>
							<span className="download-meta">Mac App Store &middot; .dmg</span>
						</div>
						<span className="download-meta">Coming soon</span>
					</div>
					<div className="download-card" style={{ cursor: "default", opacity: 0.8 }}>
						<div className="download-icon">
							<Icon name="logo-windows" size={28} />
						</div>
						<div className="download-info">
							<h3>Windows</h3>
							<span className="download-meta">Microsoft Store &middot; .msi</span>
						</div>
						<span className="download-meta">Coming soon</span>
					</div>
					<div className="download-card" style={{ cursor: "default", opacity: 0.8 }}>
						<div className="download-icon">
							<Icon name="logo-linux" size={28} />
						</div>
						<div className="download-info">
							<h3>Linux</h3>
							<span className="download-meta">.AppImage &middot; .deb &middot; .rpm</span>
						</div>
						<span className="download-meta">Coming soon</span>
					</div>
				</div>
			</div>
		</section>
	);
}

/* ── Page ── */

export default function AppLanding(): JSX.Element {
	useEffect(() => {
		const hash = window.location.hash;
		if (hash) {
			const el = document.getElementById(hash.slice(1));
			if (el) {
				setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
			}
		}
	}, []);

	return (
		<>
			<Header />
			<main>
				<Hero />
				<FeaturesSection />
				<PlatformsSection />
				<LibraryPromo />
				<DownloadSection />
			</main>
			<Footer />
		</>
	);
}
