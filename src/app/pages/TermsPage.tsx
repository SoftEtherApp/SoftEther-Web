/* ════════════════════════════════════
   Terms — terms of service
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../components/Icon";

export default function TermsPage(): JSX.Element {
	return (
		<section className="py-2xl px-lg text-center sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<div className="trust-icon" aria-hidden="true">
					<Icon name="file-text" size={28} />
				</div>
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Terms of Service</h1>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					The full terms of service are being prepared — coming soon.
				</p>
				<div className="d-flex gap-md flex-wrap justify-center mt-xl">
					<a href="/" className="btn btn-secondary">
						<Icon name="arrow-left" size={18} />
						Back to Home
					</a>
				</div>
			</div>
		</section>
	);
}
