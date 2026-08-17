/* ════════════════════════════════════
   ResetPassword — sets a new password from a reset link
   (/?token=...). Single-use token; a successful reset invalidates
   every other outstanding reset link.
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import { Button, Field, Input } from "@devstroop/react-ui";
import Icon from "../../components/Icon";
import { navigate } from "../../App";

export default function ResetPasswordPage(): JSX.Element {
	const [token] = useState(() => new URLSearchParams(window.location.search).get("token"));
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirm) {
			setError("Passwords do not match.");
			return;
		}
		if (!token) {
			setError("This reset link is missing its token.");
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password }),
			});
			const data = await res.json().catch(() => ({}));
			if (res.ok) {
				setSubmitted(true);
			} else {
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
					<div className="icon-chip">
						<Icon name="check" size={18} />
					</div>
					<h1 className="m-0 fs-lg fw-700 text-primary">Password updated</h1>
				</div>
				<p className="m-0 mb-xl text-muted fs-sm">
					Your password has been changed. You can sign in with it now.
				</p>
				<a
					href="/login"
					className="text-none"
					onClick={(e) => { e.preventDefault(); navigate("/login"); }}
				>
					<Button fullWidth>Sign in</Button>
				</a>
			</div>
		);
	}

	if (!token) {
		return (
			<div>
				<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Invalid reset link</h1>
				<p className="m-0 mb-xl text-muted fs-sm">
					This reset link is missing its token — request a new one.
				</p>
				<Button fullWidth onClick={() => navigate("/forgot-password")}>
					Request a new link
				</Button>
			</div>
		);
	}

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Set new password</h1>
			<p className="m-0 mb-xl text-muted fs-sm">
				Choose a strong new password for your account.
			</p>
			<form onSubmit={handleSubmit} noValidate className="d-flex flex-col gap-md">
				<Field label="New password" htmlFor="password">
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
				<Field label="Confirm new password" htmlFor="confirm">
					<div className="pos-relative">
						<Input
							id="confirm"
							type={showPassword ? "text" : "password"}
							className="pr-xl"
							placeholder="Repeat your new password"
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
				{error && <p className="m-0 fs-sm" style={{ color: "#ff6b6b" }}>{error}</p>}
				<Button type="submit" fullWidth disabled={submitting}>
					{submitting ? "Updating…" : "Update password"}
				</Button>
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