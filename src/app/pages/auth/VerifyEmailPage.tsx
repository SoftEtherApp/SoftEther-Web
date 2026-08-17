/* ════════════════════════════════════
   Verify email — consumes the one-time token from the emailed link
   (/?token=...) against POST /api/auth/verify-email. Shows success,
   error, or a no-token prompt.
   ════════════════════════════════════ */

import { useEffect, useState, type JSX } from "react";
import { navigate } from "../../App";

type VerifyState =
	| { status: "verifying" }
	| { status: "success" }
	| { status: "error"; message: string };

export default function VerifyEmailPage(): JSX.Element {
	const [token] = useState(() => new URLSearchParams(window.location.search).get("token"));
	const [state, setState] = useState<VerifyState>(() =>
		token
			? { status: "verifying" }
			: { status: "error", message: "This verification link is missing its token." },
	);

	useEffect(() => {
		if (!token) return;

		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/auth/verify-email", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});
				const data = await res.json().catch(() => ({}));
				if (cancelled) return;
				if (res.ok) {
					setState({ status: "success" });
				} else {
					setState({
						status: "error",
						message: typeof data.error === "string" ? data.error : "Verification failed. Please try again.",
					});
				}
			} catch {
				if (!cancelled) setState({ status: "error", message: "Network error — please try again." });
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [token]);

	if (state.status === "verifying") {
		return (
			<div>
				<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Verifying your email…</h1>
				<p className="m-0 mb-xl text-muted fs-sm">Activating your account.</p>
			</div>
		);
	}

	if (state.status === "success") {
		return (
			<div>
				<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Email verified</h1>
				<p className="m-0 mb-xl text-muted fs-sm">
					Your account is now active. You can sign in with your email and password.
				</p>
				<button
					type="button"
					className="btn btn-primary w-100 justify-center"
					onClick={() => navigate("/login")}
				>
					Sign in
				</button>
			</div>
		);
	}

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Verification failed</h1>
			<p className="m-0 mb-xl text-muted fs-sm">{state.message}</p>
			<button
				type="button"
				className="btn btn-primary w-100 justify-center"
				onClick={() => navigate("/register")}
			>
				Create a new account
			</button>
		</div>
	);
}