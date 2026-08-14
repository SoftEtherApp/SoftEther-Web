/* ════════════════════════════════════
   Unauthorized — 403 for restricted areas
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../components/Icon";

export default function UnauthorizedPage(): JSX.Element {
	return (
		<section className="py-2xl px-lg text-center sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<div className="trust-icon" aria-hidden="true">
					<Icon name="x-circle" size={28} />
				</div>
				<h1 className="mb-sm text-center fw-700 fs-lg text-primary">Unauthorized</h1>
				<p className="m-auto mb-2xl text-center text-secondary mw-540 fs-base">
					You don't have access to this area. If you believe this is a mistake,
					contact the administrator.
				</p>
				<div className="d-flex gap-md flex-wrap justify-center mt-xl">
					<a href="/" className="btn btn-primary">
						<Icon name="arrow-left" size={18} />
						Back to Home
					</a>
				</div>
			</div>
		</section>
	);
}
