/* ════════════════════════════════════
   Docs — documentation hub
   Setup guides, connection configuration,
   and library integration targets.
   ════════════════════════════════════ */

import { type JSX } from "react";
import { useScrollToHash } from "../../hooks/useScrollToHash";
import Icon from "../../components/Icon";
import { LIBRARY_REPO_URL } from "../../lib/constants";

/* In-page anchors for the section quick-links. */
const SECTIONS = [
	{ href: "#quick-start", label: "Quick start" },
	{ href: "#connection-configuration", label: "Connection configuration" },
	{ href: "#library-integration", label: "Library integration" },
	{ href: "#resources", label: "Resources" },
] as const;

export default function DocsPage(): JSX.Element {
	useScrollToHash(200);

	return (
		<section className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Documentation</h1>
				<p className="m-auto mb-xl text-center text-secondary mw-540 fs-base">
					Setup guides, configuration reference, and integration targets for
					SoftEther App.
				</p>

				<nav className="d-flex gap-sm flex-wrap justify-center mb-2xl" aria-label="On this page">
					{SECTIONS.map((s) => (
						<a key={s.href} href={s.href} className="btn btn-secondary btn-sm">
							{s.label}
						</a>
					))}
				</nav>

				<article id="quick-start" className="trust-card">
					<h2 className="trust-h">Quick start</h2>
					<ol className="trust-list">
						<li>
							<strong>Download the app</strong> for your platform from the{" "}
							<a href="/download" className="text-primary">Downloads</a> page — no
							sign-up required.
						</li>
						<li>
							<strong>Create a connection profile</strong> with the details of a
							SoftEther VPN server you have access to: server address, port,
							virtual hub, and credentials.
						</li>
						<li>
							<strong>Connect.</strong> The connection screen shows live status and
							statistics; the Log tab shows protocol activity when you need to
							troubleshoot.
						</li>
					</ol>
					<p className="trust-p">
						Stuck? Check the{" "}
						<a href="/changelog" className="text-primary">changelog</a> for known
						changes, or report issues in the{" "}
						<a href={LIBRARY_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-primary">
							project repository
						</a>.
					</p>
				</article>

				<article id="connection-configuration" className="trust-card">
					<h2 className="trust-h">Connection configuration</h2>
					<p className="trust-p">
						Profiles are stored locally on your device. The core fields:
					</p>
					<ul className="trust-list">
						<li>
							<strong>Server address &amp; port</strong> — the SoftEther VPN server
							hostname or IP, and its TCP port (commonly 443, 992, 1194, or 5555).
						</li>
						<li>
							<strong>Virtual hub</strong> — the hub on the server that your
							account belongs to (for example <code>DEFAULT</code>).
						</li>
						<li>
							<strong>Username &amp; password</strong> — the account granted by the
							server administrator. Passwords are stored in your system's secure
							keychain.
						</li>
						<li>
							<strong>Authentication type</strong> — password authentication, or
							certificate authentication with a client certificate and key.
						</li>
					</ul>
					<p className="trust-p">Advanced options per profile:</p>
					<ul className="trust-list">
						<li>
							<strong>Half-connection</strong> — always connect to the server
							first, even when no tunnel is requested; useful for UDP
							acceleration and for servers that expect a stable presence.
						</li>
						<li>
							<strong>UDP acceleration</strong> — uses the SoftEther UDP
							acceleration protocol to reduce latency when the network allows it.
						</li>
						<li>
							<strong>Encryption &amp; compression</strong> — per-session
							encryption (AES-256-CBC) and optional compression of tunnel data.
						</li>
						<li>
							<strong>MTU &amp; keepalive</strong> — tunnel MTU and keepalive
							interval tuning for unusual networks.
						</li>
						<li>
							<strong>Static IP &amp; DNS</strong> — request a fixed virtual IP and
							push DNS servers from the profile.
						</li>
						<li>
							<strong>Custom routes</strong> — override which networks are routed
							through the tunnel.
						</li>
						<li>
							<strong>Proxy</strong> — connect through an HTTP or SOCKS proxy when
							the network blocks direct connections.
						</li>
					</ul>
				</article>

				<article id="library-integration" className="trust-card">
					<h2 className="trust-h">Library integration</h2>
					<p className="trust-p">
						The VPN engine behind the app is <strong>SoftEtherZig</strong> — the
						SoftEther protocol implemented in Zig, released under Apache-2.0. It
						is designed to be reusable outside the desktop app, so other clients,
						CLI tools, and embedded devices can speak the SoftEther protocol
						without a proprietary stack.
					</p>
					<p className="trust-p">
						See the{" "}
						<a href="/library" className="text-primary">Library</a> page for the
						source repository, license, and build notes.
					</p>
				</article>

				<article id="resources" className="trust-card">
					<h2 className="trust-h">Resources</h2>
					<ul className="trust-list">
						<li>
							<a href="/download" className="text-primary">Downloads</a> — installers
							for Windows, macOS, Linux, and Android.
						</li>
						<li>
							<a href="/changelog" className="text-primary">Changelog</a> — release
							notes for every version.
						</li>
						<li>
							<a href="/library" className="text-primary">Library</a> — the open-source
							SoftEtherZig engine.
						</li>
						<li>
							<a href="/security" className="text-primary">Security</a> — threat model
							and vulnerability reporting.
						</li>
						<li>
							<a href="/privacy" className="text-primary">Privacy</a> — what the app and
							site collect, and what they never see.
						</li>
						<li>
							<a href="/terms" className="text-primary">Terms of Service</a> — the
							legal terms for the software and this site.
						</li>
					</ul>
				</article>

				<div className="d-flex gap-md flex-wrap justify-center mt-2xl">
					<a href="/" className="btn btn-secondary">
						<Icon name="arrow-left" size={18} />
						Back to Home
					</a>
				</div>
			</div>
		</section>
	);
}