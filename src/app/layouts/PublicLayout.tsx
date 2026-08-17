/* ════════════════════════════════════
   PublicLayout — shared chrome for public pages
   Owns nav state and composes the chrome from shell
   components, passing content through as children.
   ════════════════════════════════════ */

import { useEffect, useState, type JSX } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import Icon from "../components/Icon";
import UserMenu from "../components/UserMenu";
import { navigate } from "../App";
import { useAuth } from "../auth/useAuth";
import { LIBRARY_REPO_URL, SITE_NAME, SITE_URL } from "../lib/constants";

interface LayoutProps {
	children: JSX.Element;
}

/* ── Nav links — same across all public pages ── */

const LINKS = [
	{ href: "/#features", label: "Features" },
	{ href: "/#platforms", label: "Platforms" },
	{ href: "/download", label: "Download" },
	{ href: "/library", label: "Library", badge: "OSS" },
];

export default function PublicLayout({ children }: LayoutProps): JSX.Element {
	const { user, signOut } = useAuth();
	const [open, setOpen] = useState(false);
	const [path, setPath] = useState(window.location.pathname);

	const isActive = (href: string) => {
		// Hash-fragment links (scroll anchors on the home page) are never
		// marked active — marking all of them simultaneously would look
		// broken.
		if (href.startsWith("/#")) return false;
		return path.startsWith(href);
	};

	// Sync nav state on popstate / spa:navigate
	useEffect(() => {
		const sync = () => setPath(window.location.pathname);
		window.addEventListener("popstate", sync);
		window.addEventListener("spa:navigate", sync);
		return () => {
			window.removeEventListener("popstate", sync);
			window.removeEventListener("spa:navigate", sync);
		};
	}, []);

	return (
		<>
			<Header>
				<div className="m-auto mw-1100 px-lg d-flex items-center gap-md h-56">
					<button
						className="menu-btn"
						onClick={() => setOpen(!open)}
						aria-label="Toggle menu"
						aria-expanded={open}
					>
						<Icon name="menu" size={20} />
					</button>
					<a href="/" className="logo-link d-flex items-center gap-sm text-primary">
						<img src="/logo.png" alt={SITE_NAME} width={32} height={32} />
						<span className="logo-text">{SITE_NAME}</span>
					</a>
					<nav className="nav-desktop d-flex items-center gap-sm" aria-label="Main navigation">
						{LINKS.map((l) => (
							<a
								key={l.href}
								href={l.href}
								className={`nav-link${isActive(l.href) ? " nav-link--active" : ""}`}
								onClick={(e) => { e.preventDefault(); navigate(l.href); }}
								aria-current={isActive(l.href) ? "page" : undefined}
							>
								{l.label}
								{l.badge && <span className="nav-badge">{l.badge}</span>}
							</a>
						))}
					</nav>
					<span className="flex-grow-1" />
					<div className="d-flex items-center gap-sm sm:d-none">
						{user ? (
							<UserMenu />
						) : (
							<>
								<a
									href="/login"
									className="btn btn-secondary btn-sm"
									onClick={(e) => { e.preventDefault(); navigate("/login"); }}
								>
									Sign in
								</a>
								<a
									href="/register"
									className="btn btn-primary btn-sm"
									onClick={(e) => { e.preventDefault(); navigate("/register"); }}
								>
									Create account
								</a>
							</>
						)}
					</div>
					<ThemeToggle />
				</div>
			</Header>
			<Sidebar open={open} onClose={() => setOpen(false)}>
				<div className="sidebar-header">
					<button
						className="menu-btn"
						onClick={() => setOpen(false)}
						aria-label="Close menu"
					>
						<Icon name="x-circle" size={20} />
					</button>
				</div>
				<nav className="sidebar-nav" aria-label="Mobile navigation">
					{LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className={`nav-link sidebar-link${isActive(l.href) ? " nav-link--active" : ""}`}
							onClick={(e) => { e.preventDefault(); setOpen(false); navigate(l.href); }}
							aria-current={isActive(l.href) ? "page" : undefined}
						>
							{l.label}
							{l.badge && <span className="nav-badge">{l.badge}</span>}
						</a>
					))}
					{user ? (
						<>
							<a
								href={user.role === "admin" ? "/admin" : "/profile"}
								className="nav-link sidebar-link"
								onClick={(e) => { e.preventDefault(); setOpen(false); navigate(user.role === "admin" ? "/admin" : "/profile"); }}
							>
								{user.role === "admin" ? "Admin" : "Profile"}
							</a>
							<a
								href="/login"
								className="nav-link sidebar-link"
								onClick={(e) => { e.preventDefault(); setOpen(false); signOut(); navigate("/"); }}
							>
								Sign out
							</a>
						</>
					) : (
						<>
							<a
								href="/login"
								className="nav-link sidebar-link"
								onClick={(e) => { e.preventDefault(); setOpen(false); navigate("/login"); }}
							>
								Sign in
							</a>
							<a
								href="/register"
								className="nav-link sidebar-link"
								onClick={(e) => { e.preventDefault(); setOpen(false); navigate("/register"); }}
							>
								Create account
							</a>
						</>
					)}
				</nav>
				<div className="sidebar-footer">
					<ThemeToggle />
				</div>
			</Sidebar>
			<a href="#main-content" className="skip-link">Skip to content</a>
			<main id="main-content">{children}</main>
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
							<a href="/docs">Docs</a>
							<a href="/changelog">Changelog</a>
							<a href="/privacy">Privacy</a>
							<a href="/terms">Terms</a>
							<a href="/security">Security</a>
						</div>
					</div>
					<p className="footer-copy mt-md fs-xs text-muted text-center">
						Copyright &copy; {new Date().getFullYear()} <a href="https://devstroop.com" target="_blank" rel="noopener noreferrer">
							<strong>Devstroop</strong>
						</a>. The SoftEtherZig engine is open source (Apache-2.0)
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
