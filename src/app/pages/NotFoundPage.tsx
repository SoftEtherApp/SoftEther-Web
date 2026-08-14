/* ════════════════════════════════════
   Not Found — unknown SPA routes
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../components/Icon";

export default function NotFoundPage(): JSX.Element {
	return (
		<section className="py-2xl px-lg text-center sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<div className="trust-icon" aria-hidden="true">
					<Icon name="x-circle" size={28} />
				</div>
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Page not found</h1>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					This address does not exist on softether.app. If you followed a
					link here, the page may have moved.
				</p>
				<div className="d-flex gap-md flex-wrap justify-center mt-xl">
					<a href="/" className="btn btn-primary">
						<Icon name="arrow-left" size={18} />
						Back to Home
					</a>
					<a href="/library" className="btn btn-secondary">
						SoftEtherZig Library
					</a>
				</div>
			</div>
		</section>
	);
}
