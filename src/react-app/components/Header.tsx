/* ════════════════════════════════════
   Shared Header
   ════════════════════════════════════ */

import { useState, useEffect } from "react";
import Icon from "./Icon";
import { navigate } from "../App";

export const LIBRARY_REPO_URL = "https://github.com/devstroop/SoftEtherZig";

/* ── Theme toggle ── */

function ThemeToggle() {
	const [dark, setDark] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem("theme");
		if (stored === "light") {
			setDark(false);
			document.documentElement.classList.add("light");
		}
	}, []);

	const toggle = () => {
		const next = !dark;
		setDark(next);
		document.documentElement.classList.toggle("light", !next);
		localStorage.setItem("theme", next ? "dark" : "light");
	};

	return (
		<button
			className="theme-btn"
			onClick={toggle}
			aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
			title={dark ? "Light mode" : "Dark mode"}
		>
			<Icon name={dark ? "moon" : "sun"} size={18} />
		</button>
	);
}

/* ── Nav links — same across all pages ── */

const LINKS = [
	{ href: "/#features", label: "Features" },
	{ href: "/#platforms", label: "Platforms" },
	{ href: "/#download", label: "Download" },
	{ href: "/library", label: "Library" },
];

export default function Header() {
	const [open, setOpen] = useState(false);
	const [path, setPath] = useState(window.location.pathname);

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

	// Escape to close sidebar
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	const isActive = (href: string) => {
		// Hash-fragment links (scroll anchors on the home page) are never
		// marked active — marking all of them simultaneously would look
		// broken.
		if (href.startsWith("/#")) return false;
		return path.startsWith(href);
	};

	return (
		<>
			<header className="header">
				<div className="header-inner">
					<button
						className="menu-btn"
						onClick={() => setOpen(!open)}
						aria-label="Toggle menu"
						aria-expanded={open}
					>
						<Icon name="menu" size={20} />
					</button>
					<a href="/" className="logo-link">
						<img src="/logo.png" alt="SoftEther App" width={32} height={32} />
						<span className="logo-text">SoftEther App</span>
					</a>
					<nav className="nav-desktop" aria-label="Main navigation">
						{LINKS.map((l) => (
							<a
								key={l.href}
								href={l.href}
								className={`nav-link${isActive(l.href) ? " nav-link--active" : ""}`}
								onClick={(e) => { e.preventDefault(); navigate(l.href); }}
								aria-current={isActive(l.href) ? "page" : undefined}
							>
								{l.label}
							</a>
						))}
					</nav>
					<span className="header-spacer" />
					<div className="header-end">
						<ThemeToggle />
					</div>
				</div>
			</header>
			{/* Mobile sidebar overlay — outside <header> to avoid backdrop-filter clipping on iOS */}
			{open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}
			<aside
				className={`sidebar ${open ? "sidebar--open" : ""}`}
				role="dialog"
				aria-modal={open ? "true" : undefined}
				aria-label="Navigation menu"
			>
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
						</a>
					))}
				</nav>
				<div className="sidebar-footer">
					<ThemeToggle />
				</div>
			</aside>
		</>
	);
}
