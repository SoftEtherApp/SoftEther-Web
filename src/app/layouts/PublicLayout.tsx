/* ════════════════════════════════════
   PublicLayout — shared chrome for public pages
   ════════════════════════════════════ */

import { type JSX } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface LayoutProps {
	children: JSX.Element;
}

export default function PublicLayout({ children }: LayoutProps): JSX.Element {
	return (
		<>
			<Header />
			<a href="#main-content" className="skip-link">Skip to content</a>
			<main id="main-content">{children}</main>
			<Footer />
		</>
	);
}
