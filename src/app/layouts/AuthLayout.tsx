/* ════════════════════════════════════
   AuthLayout — centered card for auth pages,
   wrapped in the site header (logo + theme toggle) and footer.
   ════════════════════════════════════ */

import { type JSX } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";
import Icon from "../components/Icon";
import { navigate } from "../App";
import { LIBRARY_REPO_URL, SITE_NAME, SITE_URL } from "../lib/constants";

interface LayoutProps {
	children: JSX.Element;
}

export default function AuthLayout({ children }: LayoutProps): JSX.Element {
	return (
		<>
			<Header>
				<div className="m-auto mw-1100 px-lg d-flex items-center gap-md h-56">
					<a
						href="/"
						className="logo-link d-flex items-center gap-sm text-primary"
						onClick={(e) => { e.preventDefault(); navigate("/"); }}
					>
						<img src="/logo.png" alt={SITE_NAME} width={32} height={32} />
						<span className="logo-text">{SITE_NAME}</span>
					</a>
					<span className="flex-grow-1" />
					<div className="d-flex items-center gap-sm">
						<ThemeToggle />
					</div>
				</div>
			</Header>
			<div className="d-flex items-center justify-center min-vh-100 p-xl px-md pt-4xl">
				<main className="w-100 mw-420 p-xl bg-surface-800 bordered rounded-lg">
					{children}
				</main>
			</div>
			<Footer>
				<div className="m-auto mw-1040">
					<div className="d-flex items-center justify-between gap-lg flex-wrap">
						<div className="d-flex items-center gap-sm fw-600 fs-sm">
							<img src="/logo.png" alt="" width={24} height={24} />
							<span>{SITE_NAME}</span>
						</div>
						<div className="d-flex items-center gap-md fs-sm">
							<a
								href={LIBRARY_REPO_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="SoftEtherZig on GitHub"
							>
								<Icon name="github" size={18} />
							</a>
							<a href={SITE_URL} target="_blank" rel="noopener noreferrer">
								SoftEther.app
							</a>
							<a href="/library">Library</a>
							<a href="/changelog">Changelog</a>
							<a href="/privacy">Privacy</a>
							<a href="/security">Security</a>
						</div>
					</div>
					<p className="footer-copy mt-md fs-xs text-muted text-center">
						Copyright &copy; {new Date().getFullYear()} <a href="https://devstroop.com" target="_blank" rel="noopener noreferrer">
							<strong>Devstroop</strong>
						</a>. The SoftEtherZig engine is open source (Apache-2.0); the {SITE_NAME} binary is freeware.
					</p>
					<p className="footer-legal mt-sm text-center">
						{SITE_NAME} is a third-party implementation based on SoftEther VPN source code.
						We do not have any affiliation with SoftEther Corporation or its developers.
					</p>
				</div>
			</Footer>
		</>
	);
}
