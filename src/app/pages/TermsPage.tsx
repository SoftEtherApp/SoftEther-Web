/* ════════════════════════════════════
   Terms — terms of service for softether.app
   Covers the self-hosted VPN client and this
   website. Disclaimer wording mirrors the
   footer's legal line.
   ════════════════════════════════════ */

import { type JSX } from "react";
import { Alert } from "@devstroop/react-ui";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { SITE_NAME, LIBRARY_REPO_URL } from "../lib/constants";

// Fixed revision date — bump it manually whenever these terms change.
const LAST_UPDATED = "2026-08-18";

export default function TermsPage(): JSX.Element {
	useScrollToHash(200);

	return (
		<section className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Terms of Service</h1>
				<p className="m-auto mb-xl text-center text-secondary mw-540 fs-base">
					Last updated: {LAST_UPDATED}
				</p>

				<Alert tone="info" className="mb-xl">
					These terms cover both the SoftEther App client and this website.
					They are intentionally plain-spoken — if a statement depends on
					behavior that has not shipped yet, it says so.
				</Alert>

				<article className="trust-card">
					<h2 className="trust-h">The short version</h2>
					<p className="trust-p">
						SoftEther App is a <strong>self-hosted VPN client</strong>. It connects your
						device to SoftEther VPN servers that you — or an administrator you
						trust — configure. Devstroop operates no VPN servers, does not see
						your traffic, and has no account system inside the app.
					</p>
				</article>

				<article className="trust-card">
					<h2 className="trust-h">The software</h2>
					<ul className="trust-list">
						<li>
							<strong>Standalone client.</strong> SoftEther App is a client for the
							SoftEther VPN protocol. Connection profiles (server address, port,
							virtual hub, credentials) are entered manually and stored locally on
							your device.
						</li>
						<li>
							<strong>No account system.</strong> The app does not require an
							account, does not phone home, and transmits nothing beyond what the
							SoftEther VPN protocol itself requires to connect to the server you
							configured.
						</li>
						<li>
							<strong>Your responsibility.</strong> You are responsible for the
							servers you connect to, for the credentials you store, and for using
							the software in compliance with applicable law and the policies of
							the networks you join.
						</li>
					</ul>
				</article>

				<article className="trust-card">
					<h2 className="trust-h">This website &amp; accounts</h2>
					<ul className="trust-list">
						<li>
							<strong>Demo-mode sign-in.</strong> Accounts on this site are currently
							local and experimental: any email and password signs you in, nothing
							is stored on a server, and admin access is simulated for
							demonstration purposes.
						</li>
						<li>
							<strong>No tracking.</strong> This site does not sell data or use
							advertising trackers. See the{" "}
							<a href="/privacy" className="text-primary">Privacy Policy</a> for details.
						</li>
						<li>
							<strong>When real accounts ship,</strong> this section will be revised
							before they do.
						</li>
					</ul>
				</article>

				<article className="trust-card">
					<h2 className="trust-h">Third-party software</h2>
					<p className="trust-p">
						{SITE_NAME} is a third-party implementation based on SoftEther VPN
						source code. We do not have any affiliation with SoftEther Corporation
						or its developers. SoftEther VPN is a registered trademark of its
						respective owners, used here only to describe compatibility.
					</p>
					<p className="trust-p">
						The VPN engine, SoftEtherZig, is open source under the Apache-2.0
						license — see the <a href="/library" className="text-primary">Library</a> page
						for the source repository.
					</p>
				</article>

				<article className="trust-card">
					<h2 className="trust-h">No warranty</h2>
					<p className="trust-p">
						The software and this website are provided <strong>as is</strong>, without
						warranty of any kind, express or implied. To the maximum extent
						permitted by law, Devstroop shall not be liable for any damages
						arising from use of the software, including loss of data or
						interruption of service.
					</p>
				</article>

				<article className="trust-card">
					<h2 className="trust-h">Changes to these terms</h2>
					<p className="trust-p">
						These terms may be revised as the software evolves. The revision date
						above is updated on every change; continued use of the software or
						site after a revision constitutes acceptance.
					</p>
				</article>

				<article className="trust-card">
					<h2 className="trust-h">Contact</h2>
					<p className="trust-p">
						Questions about these terms? Reach us via the{" "}
						<a href={LIBRARY_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-primary">
							project repository
						</a>{" "}
						on GitHub or at{" "}
						<a href="https://devstroop.com" target="_blank" rel="noopener noreferrer" className="text-primary">
							devstroop.com
						</a>.
					</p>
				</article>
			</div>
		</section>
	);
}