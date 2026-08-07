/* ════════════════════════════════════
   Privacy Policy — softether.app
   Honest-by-construction copy. Claims the
   project cannot verify carry an explicit
   [needs confirmation] marker for review.
   ════════════════════════════════════ */

import { type JSX } from "react";
import { useScrollToHash } from "../hooks/useScrollToHash";
import Icon from "../components/Icon";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Fixed revision date — bump it manually whenever this policy actually changes.
const LAST_UPDATED = "2026-08-06";

export default function PrivacyPage(): JSX.Element {
	useScrollToHash(200);

	return (
		<>
			<Header />
			<a href="#main-content" className="skip-link">Skip to content</a>
			<main id="main-content">
				<section className="section">
					<div className="section-inner">
						<h1 className="section-title">Privacy Policy</h1>
						<p className="section-desc section-desc--spaced">
							Last updated: {LAST_UPDATED}
						</p>

						<div className="confirm-note">
							<Icon name="book" size={16} />
							<span>
								This policy is intentionally short. Where a statement depends on
								the app's exact behavior (update checks, telemetry), the wording
								is flagged in-brackets for review until verified.
							</span>
						</div>

						<article className="trust-card">
													<h2 className="trust-h">The short version</h2>
													<p className="trust-p">
														SoftEther App is a <strong>self-hosted VPN client</strong>. It exists
														to connect your device to a SoftEther VPN server that <em>you</em>{" "}
														configure — and only that server. We do not operate VPN
														infrastructure, do not see your traffic, and do not sell data of
														any kind.
													</p>
													<p className="trust-p">
														Specific behaviors of the app binary — update checks, crash
														reporting, telemetry — are listed below and flagged where they
														still await verification of the shipped binary.
													</p>
												</article>

						<article className="trust-card">
							<h2 className="trust-h">What the app does with your data</h2>
							<ul className="trust-list">
								<li>
									<strong>Your traffic</strong> — while connected, network traffic
									is encrypted and passes through the SoftEther VPN server you
									configure. SoftEther App does not route your traffic through any
									third-party server, and the app company does not see your traffic
									at all.
								</li>
								<li>
									<strong>Connection profile</strong> — the servers and profiles you
									add are stored locally on your device. They are not transmitted
									to us.
								</li>
								<li>
									<strong>Update checks</strong> — [needs confirmation: how does the
									app learn about new versions — check-on-launch, manual
									download, or auto-update? and what, if anything, is sent when it
									checks?]
								</li>
								<li>
									<strong>Telemetry and crash reports</strong> — [needs confirmation:
									does the app send crash reports, usage analytics, or any
									diagnostic data anywhere?]
								</li>
							</ul>
						</article>

						<article className="trust-card">
							<h2 className="trust-h">What the website does</h2>
							<ul className="trust-list">
								<li>
									This site (<code>softether.app</code>) is served through
									{" "}Cloudflare and loads <strong>no analytics or tracking
									scripts</strong> of our own.
								</li>
								<li>
																	The site stores two small localStorage values: the light/dark
																	theme choice, and a 5-minute cache of the latest release data
																	for the download and changelog sections. No cookies are used by
																	the site itself.
																</li>
																<li>
																	Cloudflare infrastructure processes standard web request logs
																	(e.g. IP address) as part of hosting; their handling is governed
																	by Cloudflare's own privacy policy.
																</li>
																<li>
																	Downloads are streamed from Cloudflare storage (no third-party
																	download trackers or ad networks).
																</li>
							</ul>
						</article>

						<article className="trust-card">
							<h2 className="trust-h">The open-source engine</h2>
							<p className="trust-p">
								The SoftEtherZig engine used by this app is open source under the
								Apache-2.0 licence and available at{" "}
								<a
									href="https://github.com/devstroop/SoftEtherZig"
									target="_blank"
									rel="noopener noreferrer"
								>
									github.com/devstroop/SoftEtherZig
								</a>
								. The SoftEther App binary itself is freeware — free to use, source
								not distributed.
							</p>
						</article>

						<article className="trust-card">
							<h2 className="trust-h">Contact</h2>
							<p className="trust-p">
								For privacy questions: [needs confirmation: contact email or a
								channel on the Devstroop GitHub org.]
							</p>
						</article>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}