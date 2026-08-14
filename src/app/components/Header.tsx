/* ════════════════════════════════════
   Header — structural shell for the top bar
   Content is supplied by the layout via children.
   ════════════════════════════════════ */

import { type JSX, type ReactNode } from "react";
import "./Header.css";

interface HeaderProps {
	children: ReactNode;
}

export default function Header({ children }: HeaderProps): JSX.Element {
	return (
		<header className="header">
			{children}
		</header>
	);
}
