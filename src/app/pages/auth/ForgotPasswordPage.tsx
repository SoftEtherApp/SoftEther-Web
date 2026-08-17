/* ════════════════════════════════════
   ForgotPassword — requests a password reset email. The worker always
   answers generically (no account enumeration); the confirmation state
   shows regardless of whether the email exists.
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import Icon from "../../components/Icon";
import { navigate } from "../../App";

export default function ForgotPasswordPage(): JSX.Element {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			if (res.ok) {
				setSubmitted(true);
			} else {
				const data = await res.json().catch(() => ({}));
				setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
			}
		} catch {
			setError("Network error — please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div>
				<div className="d-flex items-center gap-sm mb-sm">
					<div className="stat-card-icon">
						<Icon name="check" size={18} />
					</div>
					<h1 className="m-0 fs-lg fw-700 text-primary">Check your email</h1>
				</div>
				<p className="m-0 mb-xl text-muted fs-sm">
					If an account exists for <strong className="text-primary">{email}</strong>, a reset
					link is on its way. It expires in 1 hour and works once.
				</p>
				<a
					href="/login"
					className="btn btn-secondary w-100 justify-center"
					onClick={(e) => { e.preventDefault(); navigate("/login"); }}
				>
					Back to sign in
				</a>
			</div>
		);
	}

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Reset password</h1>
			<p className="m-0 mb-xl text-muted fs-sm">
				Enter the email linked to your account and we'll send you a reset link.
			</p>
			<form onSubmit={handleSubmit} noValidate className="d-flex flex-col gap-md">
				<div>
					<label className="label" htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						className="input"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						required
					/>
				</div>
				{error && <p className="m-0 fs-sm" style={{ color: "#ff6b6b" }}>{error}</p>}
				<button type="submit" className="btn btn-primary w-100 justify-center" disabled={submitting}>
					{submitting ? "Sending…" : "Send reset link"}
				</button>
			</form>
			<p className="m-0 mt-lg text-center text-muted fs-sm">
				Remembered it?{" "}
				<a
					href="/login"
					className="text-secondary"
					onClick={(e) => { e.preventDefault(); navigate("/login"); }}
				>
					Back to sign in
				</a>
			</p>
		</div>
	);
}