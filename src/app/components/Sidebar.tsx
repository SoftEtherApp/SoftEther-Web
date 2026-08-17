/* ════════════════════════════════════
   Sidebar — controlled mobile nav modal
   The layout owns `open`; onClose fires from the
   close button, backdrop, or Escape (native <dialog>).
   ════════════════════════════════════ */

import { type JSX, type ReactNode } from "react";
import { Dialog } from "@devstroop/react-ui";
import "./Sidebar.css";

interface SidebarProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
}

export default function Sidebar({ open, onClose, children }: SidebarProps): JSX.Element {
	return (
		<Dialog open={open} onClose={onClose} title="Menu" size="sm">
			{children}
		</Dialog>
	);
}