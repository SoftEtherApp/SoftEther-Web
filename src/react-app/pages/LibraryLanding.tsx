/* ════════════════════════════════════
   SoftEtherZig — Open-Source Library
   ════════════════════════════════════ */

import { useEffect, type JSX } from "react";
import Icon from "../components/Icon";
import Footer from "../components/Footer";
import Header, { LIBRARY_REPO_URL } from "../components/Header";

/* ── Data ── */

interface LibFeature {
	title: string;
	desc: string;
	icon: string;
}

interface Target {
	name: string;
	desc: string;
}

const LIB_FEATURES: LibFeature[] = [
	{
		title: "Pure Zig",
		desc: "Written entirely in Zig 0.15. Zero runtime dependencies. Compiles to a small, fast native binary.",
		icon: "cpu",
	},
	{
		title: "C ABI Exports",
		desc: "Exposes a clean C ABI \u2014 callable from any language: Dart, Kotlin, Swift, C#, Python, and more.",
		icon: "code",
	},
	{
		title: "Dart FFI Ready",
		desc: "First-class Dart FFI bindings included. 60+ exported functions covering the full SoftEther protocol surface.",
		icon: "terminal",
	},
	{
		title: "Cross-Platform",
		desc: "Compiles for arm64, armv7, x86_64 on Android, iOS, macOS, Windows, and Linux.",
		icon: "monitor",
	},
	{
		title: "Open Source",
		desc: "MIT licensed. Audit, fork, contribute. Built in the open on GitHub.",
		icon: "code",
	},
	{
		title: "Lightweight",
		desc: "Minimal binary footprint. No heavy frameworks \u2014 just the protocol, the tunnel, and your data.",
		icon: "zap",
	},
];

const TARGETS: Target[] = [
	{ name: "Android (JNI)", desc: "Integrate via jni_bridge.c; compile with NDK + Zig cross toolchain." },
	{ name: "iOS / macOS", desc: "Link as a static framework via Xcode; FFI access from Swift or Dart." },
	{ name: "Linux", desc: "Shared library (.so) with standard C ABI; package via CMake or Zig build." },
	{ name: "Windows", desc: "DLL with C ABI exports; consume from C#, C++, or Dart." },
	{ name: "Flutter / Dart", desc: "Pre-built FFI bindings and client abstraction layer \u2014 drop in and connect." },
];

/* ── Components ── */

function LibHero() {
	return (
		<section id="library" className="hero hero-tall">
			<div className="hero-bg" />
			<div className="hero-content">
				<div className="hero-badge">Open Source &middot; MIT License</div>
				<h1 className="hero-title">
					SoftEtherZig
					<br />
					<span className="hero-accent">Native VPN Library in Zig</span>
				</h1>
				<p className="hero-desc">
					A lightweight, cross-platform SoftEther VPN protocol implementation
					written in Zig. Exposes a C ABI for seamless integration with any
					language or framework.
				</p>
				<div className="hero-actions">
					<a
						href={LIBRARY_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-primary"
					>
						<Icon name="github" size={20} />
						GitHub Repository
					</a>
					<a href="#usage" className="btn btn-secondary">
						<Icon name="code" size={20} />
						Quick Start
					</a>
				</div>
			</div>
		</section>
	);
}

function LibFeaturesSection() {
	return (
		<section id="features" className="section">
			<div className="section-inner">
				<h2 className="section-title">The Missing Mobile VPN Architecture</h2>
				<p className="section-desc" style={{ marginBottom: "var(--sp-xl)" }}>
					The existing SoftEther ecosystem has zero architecture for mobile or
					embeddable clients \u2014 and no viable community contributions toward one.
					SoftEtherZig is the first clean-runtime library purpose-built to fill
					that gap.
				</p>
				<div className="features-grid">
					{LIB_FEATURES.map((f) => (
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

function UsageSection() {
	return (
		<section id="usage" className="section">
			<div className="section-inner">
				<h2 className="section-title">Quick Start</h2>
				<p className="section-desc">
					Build the library and integrate it into your project in minutes.
				</p>
				<div className="code-block">
					<pre>
						<code>{`git clone https://github.com/devstroop/SoftEtherZig.git
cd SoftEtherZig

# Build for your host platform
zig build -Doptimize=ReleaseSafe

# Or cross-compile for Android (arm64)
zig build -Dtarget=aarch64-linux-android -Doptimize=ReleaseSafe

# Generated in zig-out/lib/
#   libsoftether.so \u2014 shared library with C ABI`}</code>
					</pre>
				</div>
				<div className="usage-note">
					<Icon name="book" size={18} />
					<span>
						Full build instructions and integration guides for each platform
						are available on GitHub.
					</span>
				</div>
				<div className="hero-actions" style={{ marginTop: "var(--sp-xl)" }}>
					<a
						href={LIBRARY_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-primary"
					>
						<Icon name="github" size={20} />
						GitHub
					</a>
					<a
						href={`${LIBRARY_REPO_URL}#readme`}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-secondary"
					>
						<Icon name="book" size={20} />
						Documentation
					</a>
				</div>
			</div>
		</section>
	);
}

function TargetsSection() {
	return (
		<section className="section section-alt">
			<div className="section-inner">
				<h2 className="section-title">Integration Targets</h2>
				<p className="section-desc">
					SoftEtherZig works wherever you need a native SoftEther VPN library.
				</p>
				<div className="targets-list">
					{TARGETS.map((t) => (
						<div key={t.name} className="target-card">
							<h3 className="target-title">{t.name}</h3>
							<p className="target-desc">{t.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function LibCtaSection() {
	return (
		<section className="section">
			<div className="section-inner" style={{ textAlign: "center" }}>
				<h2 className="section-title">Ready to build with it?</h2>
				<p className="section-desc">
					Star the repo, open an issue, or submit a PR. The VPN library is yours.
				</p>
				<div className="hero-actions">
					<a
						href={LIBRARY_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-primary"
					>
						<Icon name="github" size={20} />
						GitHub
					</a>
					<a
						href={`${LIBRARY_REPO_URL}/issues`}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-secondary"
					>
						<Icon name="external-link" size={20} />
						Report Issue
					</a>
				</div>
			</div>
		</section>
	);
}

/* ── Page ── */

export default function LibraryLanding(): JSX.Element {
	useEffect(() => {
		const hash = window.location.hash;
		if (hash) {
			requestAnimationFrame(() => {
				setTimeout(() => {
					document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
				}, 200);
			});
		}
	}, []);

	return (
		<>
			<Header />
			<main>
				<LibHero />
				<LibFeaturesSection />
				<UsageSection />
				<TargetsSection />
				<LibCtaSection />
			</main>
			<Footer />
		</>
	);
}
