/* ════════════════════════════════════
   Register — creates a pending account server-side; the verification
   email link activates it. No local session until verification.
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import Icon from "../../components/Icon";
import { navigate } from "../../App";

export default function RegisterPage(): JSX.Element {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [done, setDone] = useState(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirm) {
			setError("Passwords do not match.");
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});
			const data = await res.json().catch(() => ({}));
			if (res.ok) {
				setDone(true);
			} else {
				setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
			}
		} catch {
			setError("Network error — please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (done) {
		return (
			<div>
				<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Check your email</h1>
				<p className="m-0 mb-xl text-muted fs-sm">
					We sent a verification link to <strong>{email}</strong>. Click it to activate your account —
					the link expires in 1 hour and works once.
				</p>
				<p className="m-0 mt-lg text-center text-muted fs-sm">
					Already verified?{" "}
					<a
						href="/login"
						className="text-secondary"
						onClick={(e) => { e.preventDefault(); navigate("/login"); }}
					>
						Sign in
					</a>
				</p>
			</div>
		);
	}

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Create account</h1>
			<p className="m-0 mb-xl text-muted fs-sm">Create your new account.</p>
			<form onSubmit={handleSubmit} noValidate className="d-flex flex-col gap-md">
				<div>
					<label className="label" htmlFor="name">Display name</label>
					<input
						id="name"
						type="text"
						className="input"
						placeholder="Jane Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoComplete="name"
						required
					/>
				</div>
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
				<div>
					<label className="label" htmlFor="password">Password</label>
					<div className="pos-relative">
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							className="input pr-xl"
							placeholder="At least 8 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="new-password"
							required
							minLength={8}
						/>
						<button
							type="button"
							className="password-toggle"
							onClick={() => setShowPassword(!showPassword)}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							<Icon name={showPassword ? "eye-off" : "eye"} size={18} />
						</button>
					</div>
				</div>
				<div>
					<label className="label" htmlFor="confirm">Confirm password</label>
					<div className="pos-relative">
						<input
							id="confirm"
							type={showPassword ? "text" : "password"}
							className="input pr-xl"
							placeholder="Repeat your password"
							value={confirm}
							onChange={(e) => setConfirm(e.target.value)}
							autoComplete="new-password"
							required
						/>
						<button
							type="button"
							className="password-toggle"
							onClick={() => setShowPassword(!showPassword)}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							<Icon name={showPassword ? "eye-off" : "eye"} size={18} />
						</button>
					</div>
				</div>
				{error && <p className="m-0 fs-sm" style={{ color: "#ff6b6b" }}>{error}</p>}
				<button type="submit" className="btn btn-primary w-100 justify-center" disabled={submitting}>
					{submitting ? "Creating account…" : "Create account"}
				</button>
			</form>
			<p className="m-0 mt-lg text-center text-muted fs-xs">
				We&apos;ll send a one-time verification link to your email address.
			</p>
			<p className="m-0 mt-sm text-center text-muted fs-sm">
				Already have an account?{" "}
				<a
					href="/login"
					className="text-secondary"
					onClick={(e) => { e.preventDefault(); navigate("/login"); }}
				>
					Sign in
				</a>
			</p>
		</div>
	);
}