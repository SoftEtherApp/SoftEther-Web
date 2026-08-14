/* ════════════════════════════════════
   ForgotPassword — request a password reset
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import { navigate } from "../../App";

export default function ForgotPasswordPage(): JSX.Element {
	const [email, setEmail] = useState("");

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

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
					/>
				</div>
				<button type="submit" className="btn btn-primary w-100 justify-center">
					Send reset link
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
