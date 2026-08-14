/* ════════════════════════════════════
   Sidebar — controlled mobile nav drawer shell
   The layout owns `open`; onClose fires from the
   backdrop, close button, or Escape.
   ════════════════════════════════════ */

import { type JSX, type ReactNode } from "react";
import "./Sidebar.css";

interface SidebarProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
}

export default function Sidebar({ open, onClose, children }: SidebarProps): JSX.Element {
	return (
		<>
			{/* Mobile sidebar overlay — outside <aside> to avoid backdrop-filter clipping on iOS */}
			{open && <div className="sidebar-backdrop" onClick={onClose} />}
			<aside
				className={`sidebar ${open ? "sidebar--open" : ""}`}
				role="dialog"
				aria-modal={open ? "true" : undefined}
				aria-label="Navigation menu"
			>
				{children}
			</aside>
		</>
	);
}
