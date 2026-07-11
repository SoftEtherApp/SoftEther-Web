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

	return (
		<header className="header">
			<div className="header-inner">
				<a href="/" className="logo-link">
					<img src="/logo.png" alt="SoftEther App" width={32} height={32} />
					<span className="logo-text">SoftEther App</span>
				</a>
				<nav className="nav-desktop">
					{LINKS.map((l) => (
						<a key={l.href} href={l.href} className="nav-link" onClick={(e) => { e.preventDefault(); navigate(l.href); }}>
							{l.label}
						</a>
					))}
					{/* <a
						href={LIBRARY_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="nav-link nav-github"
					>
						<Icon name="github" size={18} />
						GitHub
					</a> */}
				</nav>
				<ThemeToggle />
				<button
					className="menu-btn"
					onClick={() => setOpen(!open)}
					aria-label="Toggle menu"
				>
					<Icon name={open ? "x-circle" : "menu"} />
				</button>
			</div>
			{open && (
				<nav className="nav-mobile">
					{LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className="nav-link"
							onClick={(e) => { e.preventDefault(); setOpen(false); navigate(l.href); }}
						>
							{l.label}
						</a>
					))}
					{/* <a
						href={LIBRARY_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="nav-link"
					>
						<Icon name="github" size={18} />
						GitHub
					</a> */}
					<div className="nav-mobile-theme">
						<ThemeToggle />
					</div>
				</nav>
			)}
		</header>
	);
}
