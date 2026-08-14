/* ════════════════════════════════════
   UserMenu — avatar button with a dropdown menu
   for the signed-in user. Reusable in any header.
   ════════════════════════════════════ */

import { useEffect, useRef, useState, type JSX } from "react";
import Icon from "./Icon";
import { navigate } from "../App";
import { useAuth } from "../auth/useAuth";
import "./UserMenu.css";

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]!.toUpperCase())
		.join("");
}

export default function UserMenu(): JSX.Element | null {
	const { user, signOut } = useAuth();
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onPointer = (e: PointerEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("pointerdown", onPointer);
		window.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointer);
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	if (!user) return null;

	const close = () => setOpen(false);

	const go = (href: string) => {
		close();
		navigate(href);
	};

	return (
		<div className="user-menu" ref={rootRef}>
			<button
				type="button"
				className="user-menu-btn"
				onClick={() => setOpen(!open)}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={`Account menu for ${user.name}`}
			>
				<span className="user-menu-avatar">{initials(user.name)}</span>
				<Icon name="chevron-down" size={14} className="user-menu-chevron" />
			</button>
			{open && (
				<div className="user-menu-pop" role="menu" aria-label="Account">
					<div className="user-menu-header">
						<span className="user-menu-name">{user.name}</span>
						<span className="user-menu-email">{user.email}</span>
					</div>
					<button
						type="button"
						className="user-menu-item"
						role="menuitem"
						onClick={() => go("/profile")}
					>
						<Icon name="user" size={16} />
						Profile
					</button>
					{user.role === "admin" && (
						<button
							type="button"
							className="user-menu-item"
							role="menuitem"
							onClick={() => go("/admin")}
						>
							<Icon name="dashboard" size={16} />
							Admin panel
						</button>
					)}
					<div className="user-menu-divider" />
					<button
						type="button"
						className="user-menu-item"
						role="menuitem"
						onClick={() => { close(); signOut(); navigate("/"); }}
					>
						<Icon name="log-out" size={16} />
						Sign out
					</button>
				</div>
			)}
		</div>
	);
}
