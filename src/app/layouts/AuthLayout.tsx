/* ════════════════════════════════════
   AuthLayout — centered card for auth pages
   ════════════════════════════════════ */

import { type JSX } from "react";

interface LayoutProps {
	children: JSX.Element;
}

export default function AuthLayout({ children }: LayoutProps): JSX.Element {
	return (
		<div className="d-flex items-center justify-center min-vh-100 p-xl px-md">
			<main className="w-100 mw-420 p-xl bg-surface-800 bordered rounded-lg">
				{children}
			</main>
		</div>
	);
}
