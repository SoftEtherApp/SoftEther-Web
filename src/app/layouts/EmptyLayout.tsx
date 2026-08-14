/* ════════════════════════════════════
   EmptyLayout — no chrome; for Unauthorized / 404 pages
   ════════════════════════════════════ */

import { type JSX } from "react";

interface LayoutProps {
	children: JSX.Element;
}

export default function EmptyLayout({ children }: LayoutProps): JSX.Element {
	return <>{children}</>;
}
