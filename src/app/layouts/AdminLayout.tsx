/* ════════════════════════════════════
   AdminLayout — shell for the authorized admin area.
   Left sidebar with grouped navigation, current-user chip and sign out;
   content takes the full remaining width.
   ════════════════════════════════════ */

import { useEffect, useState, type JSX } from "react";
import Icon, { type IconName } from "../components/Icon";
import { navigate } from "../App";
import { useAuth } from "../auth/useAuth";
import "./AdminLayout.css";

interface LayoutProps {
	children: JSX.Element;
}

interface NavLink {
	href: string;
	label: string;
	icon: IconName;
}

interface NavGroup {
	label: string;
	links: NavLink[];
}

const NAV: NavGroup[] = [
	{
		label: "Overview",
		links: [
			{ href: "/admin", label: "Dashboard", icon: "dashboard" },
			{ href: "/admin/analytics", label: "Analytics", icon: "trending-up" },
			{ href: "/admin/distribution", label: "Distribution", icon: "package" },
		],
	},
	{
		label: "Access",
		links: [
			{ href: "/admin/access/users", label: "Users", icon: "users" },
			{ href: "/admin/access/roles", label: "Roles", icon: "shield" },
			{ href: "/admin/access/permissions", label: "Permissions", icon: "key" },
		],
	},
	{
		label: "Product",
		links: [{ href: "/admin/features", label: "Features", icon: "flag" }],
	},
	{
		label: "System",
		links: [{ href: "/admin/settings", label: "Settings", icon: "settings" }],
	},
];

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]!.toUpperCase())
		.join("");
}

export default function AdminLayout({ children }: LayoutProps): JSX.Element {
	const { user, signOut } = useAuth();
	const [path, setPath] = useState(window.location.pathname);

	useEffect(() => {
		const sync = () => setPath(window.location.pathname);
		window.addEventListener("popstate", sync);
		window.addEventListener("spa:navigate", sync);
		return () => {
			window.removeEventListener("popstate", sync);
			window.removeEventListener("spa:navigate", sync);
		};
	}, []);

	const isActive = (href: string) =>
		path === href || path.startsWith(href + "/");

	const handleSignOut = () => {
		signOut();
		navigate("/login");
	};

	return (
		<div className="admin-layout">
			<aside className="admin-sidebar">
				<a
					href="/"
					className="admin-brand"
					onClick={(e) => { e.preventDefault(); navigate("/"); }}
				>
					<img src="/logo.png" alt="" width={24} height={24} />
					<span>SoftEther Admin</span>
				</a>
				<nav className="admin-sidebar-nav" aria-label="Admin navigation">
					{NAV.map((group) => (
						<div key={group.label} className="admin-nav-group">
							<span className="admin-nav-label">{group.label}</span>
							{group.links.map((l) => (
								<a
									key={l.href}
									href={l.href}
									className={`admin-nav-link${isActive(l.href) ? " admin-nav-link--active" : ""}`}
									onClick={(e) => { e.preventDefault(); navigate(l.href); }}
									aria-current={isActive(l.href) ? "page" : undefined}
								>
									<Icon name={l.icon} size={16} />
									{l.label}
								</a>
							))}
						</div>
					))}
				</nav>
				<div className="flex-grow-1" />
				<div className="admin-sidebar-footer">
					{user && (
						<div className="admin-user" title={user.email}>
							<span className="admin-avatar">{initials(user.name)}</span>
							<span className="admin-user-name">{user.name}</span>
						</div>
					)}
					<button className="admin-signout" onClick={handleSignOut}>
						<Icon name="log-out" size={16} />
						Sign out
					</button>
				</div>
			</aside>
			<main className="admin-main flex-1">{children}</main>
		</div>
	);
}
