/* ════════════════════════════════════
   Security — disclosure + trust page
   Honest-by-construction: no invented
   claims about signatures or SLAs.
   ════════════════════════════════════ */

import { type JSX } from "react";
import { useScrollToHash } from "../hooks/useScrollToHash";

export default function SecurityPage(): JSX.Element {
	useScrollToHash(200);

	return (
		<section className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Security</h1>
				<p className="m-auto mb-xl text-center text-secondary mw-540 fs-base">
					How we handle security for the SoftEther App and the SoftEtherZig
					engine — and what you should expect from a self-hosted VPN client.
				</p>

						<article className="trust-card">
							<h2 className="trust-h">Threat model, honestly stated</h2>
							<p className="trust-p">
								SoftEther App is a <strong>self-hosted</strong> VPN client: you run
								the server, you hold the credentials, and your traffic is
								encrypted between your device and <em>your</em> server using the
								SoftEther VPN protocol. We do not operate VPN infrastructure, do
								not see your traffic, and cannot remove you from the security
								posture of the server you connect to. Your server operator's
								configuration — cipher choices, certificate verification, logging —
								is part of your trust boundary.
							</p>
						</article>

						<article className="trust-card">
							<h2 className="trust-h">Reporting a vulnerability</h2>
							<ul className="trust-list">
								<li>
									<strong>SoftEtherZig engine</strong> — open source at{" "}
									<a
										href="https://github.com/devstroop/SoftEtherZig/security"
										target="_blank"
										rel="noopener noreferrer"
									>
										github.com/devstroop/SoftEtherZig
									</a>
									. Use the repository's security advisory / private disclosure
									path. Issues with proposed patches are welcome.
								</li>
								<li>
									<strong>SoftEther App binary</strong> — [needs confirmation:
									dedicated security contact (email or advisory channel) for the
									closed-source app.]
								</li>
								<li>
									We aim to acknowledge reports promptly and will coordinate
									disclosure once a fix ships.
								</li>
							</ul>
						</article>

						<article className="trust-card">
							<h2 className="trust-h">How releases are built and delivered</h2>
							<ul className="trust-list">
								<li>
									Binaries are built in continuous integration from the project
									source and published as GitHub release assets, then mirrored to
									Cloudflare storage and served from <code>softether.app</code>{" "}
									over HTTPS.
								</li>
								<li>
									The site enforces HTTPS with HSTS preloading, and page responses
									carry a restrictive Content-Security-Policy and frame/embedding
									denials.
								</li>
								<li>
									<strong>Checksums / PGP signatures</strong> — not published yet.
									We plan to add per-release checksums and signing; until then,
									verify downloads against the corresponding GitHub release asset.
								</li>
								<li>
									<strong>Reproducible builds</strong> — not available yet. The
									build pipeline is documented on the project; determinism work is
									planned.
								</li>
							</ul>
						</article>

						<article className="trust-card">
							<h2 className="trust-h">Getting security updates</h2>
							<p className="trust-p">
								[needs confirmation: how do users learn about updates — in-app
								check, this site's changelog, release announcements? This page
								will describe the exact mechanism once confirmed.]
							</p>
						</article>
				</div>
			</section>
	);
}