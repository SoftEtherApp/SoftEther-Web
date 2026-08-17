/* ════════════════════════════════════
   Register — creates a pending account server-side; the verification
   email link activates it. No local session until verification.
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import { Button, Field, Input } from "@devstroop/react-ui";
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
				<Field label="Display name" htmlFor="name">
					<Input
						id="name"
						type="text"
						placeholder="Jane Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoComplete="name"
						required
					/>
				</Field>
				<Field label="Email" htmlFor="email">
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						required
					/>
				</Field>
				<Field label="Password" htmlFor="password">
					<div className="pos-relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							className="pr-xl"
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
				</Field>
				<Field label="Confirm password" htmlFor="confirm">
					<div className="pos-relative">
						<Input
							id="confirm"
							type={showPassword ? "text" : "password"}
							className="pr-xl"
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
				</Field>
				<Button type="submit" fullWidth disabled={submitting}>
					{submitting ? "Creating account…" : "Create account"}
				</Button>
				{error && <p className="m-0 fs-sm text-danger">{error}</p>}
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