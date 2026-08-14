/* ════════════════════════════════════
   AdminLayout — shell for the authorized admin area
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../components/Icon";
import { navigate } from "../App";
import "./AdminLayout.css";

interface LayoutProps {
	children: JSX.Element;
}

const NAV_LINKS = [
	{ href: "/admin", label: "Dashboard", icon: "dashboard" },
	{ href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminLayout({ children }: LayoutProps): JSX.Element {
	return (
		<div className="admin-layout">
			<header className="admin-bar">
				<a href="/" className="admin-bar-brand" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
					<img src="/logo.png" alt="" width={24} height={24} />
					<span>SoftEther Admin</span>
				</a>
				<nav className="d-flex items-center gap-sm" aria-label="Admin navigation">
					{NAV_LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className="admin-bar-link"
							onClick={(e) => { e.preventDefault(); navigate(l.href); }}
						>
							<Icon name={l.icon} size={16} />
							{l.label}
						</a>
					))}
				</nav>
			</header>
			<main className="admin-main flex-1 p-xl">{children}</main>
		</div>
	);
}
