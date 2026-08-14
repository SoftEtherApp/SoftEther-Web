/* ════════════════════════════════════
   Footer — structural shell for the page footer
   Content is supplied by the layout via children.
   ════════════════════════════════════ */

import { type JSX, type ReactNode } from "react";
import "./Footer.css";

interface FooterProps {
	children: ReactNode;
}

export default function Footer({ children }: FooterProps): JSX.Element {
	return (
		<footer className="footer">
			{children}
		</footer>
	);
}
