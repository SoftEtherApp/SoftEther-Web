/* ════════════════════════════════════
   SoftEther App — Main Landing Page
   ════════════════════════════════════ */

import { type JSX } from "react";
import { useScrollToHash } from "../hooks/useScrollToHash";
import Icon from "../components/Icon";
import HeroIllustration from "../components/HeroIllustration";

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

/* Marketing chips for the "Available Everywhere" section — static by design. */
const PLATFORM_CHIPS = [
	{ name: "Android", icon: "logo-android" },
	{ name: "macOS", icon: "logo-apple" },
	{ name: "Windows", icon: "logo-windows" },
	{ name: "Linux", icon: "logo-linux" },
];

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
						A Layer-2 VPN infrastructure that runs on all your devices.
						Private, open transport, and yours to control.
					</p>
					<div className="hero-actions d-flex gap-md flex-wrap justify-start mb-lg md:justify-center">
						<a href="/download" className="btn btn-primary">
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
											. The core engine is open source (Apache-2.0)
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

/* ── Page ── */

const STEPS = [
	{
		num: 1,
		title: "Download the App",
		desc: "Grab the installer for your platform from the Downloads page — no sign-up required.",
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

	return (
		<>
			<Hero />
			<FeaturesSection />
			<PlatformsSection />
			<GetConnectedSection />
		</>
	);
}
